import '../env'

import knex from 'knex'
import { Model } from 'objection'
import Setting from './models/Setting'
import Place from './models/Place'
import User from './models/User'
import Trend from './models/Trend'
import Search from './models/Search'
import Tweet from './models/Tweet'
import TweetHashtag from './models/TweetHashtag'
import TweetUrl from './models/TweetUrl'

import log from './logger'
import { Twitter } from './twitter'
import { UrlFetcher } from './url-fetcher'
import knexfile from '../../knexfile'
import { getRedis } from './redis'

const urlFetcher = new UrlFetcher()

export class Database {

  constructor() {
    this.redis = getRedis()
    this.pg = knex(knexfile)
    Model.knex(this.pg)
  }

  getIndex(type) {
    return this.esPrefix + '-' + type
  }

  close() {
    this.pg.destroy()
    this.redis.quit()
    urlFetcher.stop()
  }

  async clear() {
    await this.redis.flushdbAsync()
    if (await this.pg.migrate.currentVersion() != "none") {
      await this.pg.migrate.rollback(null, true)
    }
    await this.pg.migrate.latest()
  }

  add(type, id, doc) {
    log.debug(`update ${type} ${id}`, doc)
    return new Promise((resolve, reject) => {
      this.es.index({
        index: this.getIndex(type),
        type: type,
        id: id,
        body: doc,
        refresh: 'wait_for'
      })
      .then(() => {resolve(doc)})
      .catch(reject)
    })
  }

  get(type, id) {
    log.debug(`get type=${type} id=${id}`)
    return new Promise((resolve, reject) => {
      this.es.get({
        index: this.getIndex(type),
        type: type,
        id: id
      }).then((result) => {
        resolve(result._source)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  search(type, q, first = false) {
    log.debug('search', type, q, first)
    const size = first ? 1 : 1000
    return new Promise((resolve, reject) => {
      this.es.search({index: this.getIndex(type), type: type, q: q, size: size})
        .then((result) => {
          if (result.hits.total > 0) {
            if (first) {
              resolve(result.hits.hits[0]._source)
            } else {
              resolve(result.hits.hits.map((h) => {return h._source}))
            }
          } else if (first) {
            resolve(null)
          } else {
            resolve([])
          }
        })
        .catch(reject)
    })
  }

  async addSettings(settings) {

    // convert settings object into a sequence of name/value objects
    const objects = []
    for (const prop in settings) {
      if (Object.prototype.hasOwnProperty.call(settings, prop)) {
        objects.push({
          name: prop,
          value: settings[prop]
        })
      }
    }

    await Setting.transaction(async trx => {
      await Setting.query(trx).delete()
      await Setting.query(trx).insert(objects)
    })

    return settings
  }

  async getSettings() {
    const settings = {}
    const rows = await Setting.query().select('name', 'value')
    for (const row of rows) {
      settings[row.name] = row.value
    }
    return settings
  }

  async addUser(user) {
    const settings = await this.getSettings()
    user.tweetQuota = user.tweetQuota || settings.defaultQuota

    const su = await this.getSuperUser()
    user.isSuperUser = su ? false : true
  
    try {
      const newUser = await User.query().insert(user)

      // once we have the first user we have keys to load places from Twitter
      if (newUser.isSuperUser) {
        await this.loadPlaces()
      }

      return newUser
    } catch (e) { 
      console.error(e)
    }

  }

  async updateUser(user) {
    // the order of places is defined by their position
    // they will be defined based on their order
    if (user.places) {
      for (let pos = 0; pos < user.places.length; pos += 1) {
        user.places[pos].position = pos
      }
    }
    delete user.searches

    const u = await User.query()
      .allowGraph('places')
      .upsertGraph(user, {relate: true, unrelate: true})

    return u
  }

  async getUser(userId) {
    const users = await User.query()
      .withGraphJoined('places')
      .where('user.id', userId)
    return users.length > 0 ? users[0] : null
  }

  async getUsers() {
    const users = await User.query()
      .withGraphJoined('places')
      .withGraphJoined('searches')

    // this is a stop gap until redis goes away
    // we need to add aggregate stats to each search
    // maybe there should be a view for these?

    for (const user of users) {
      const searchesWithStats = []
      for (const search of user.searches) {
        const stats = await this.getSearchStats(search)
        searchesWithStats.push({
          ...search,
          ...stats
        })
      }
      user.searches = searchesWithStats
    }

    return users
  }

  getSuperUser() {
    return User.query().where('isSuperUser', '=', true).first()
  }

  getUserByTwitterUserId(userId) {
    return User.query().where('twitter_user_id', '=', userId).first()
  }

  getUserByTwitterScreenName(twitterScreenName) {
    return this.query().where('twitterScreeName', '=', twitterScreenName).first()
  }

  async importLatestTrends() {
    let trends = []
    const seenPlaces = new Set()
    for (const user of await this.getUsers()) {
      if (user.places) {
        for (const place of user.places) {
          // only fetch the same place once per run
          if (! seenPlaces.has(place.id)) {
            trends = trends.concat(
              await this.importLatestTrendsForPlace(place, user)
            )
            seenPlaces.add(place.id)
          }
        }
      }
    }
    return trends
  }

  async importLatestTrendsForPlace(place, user) {
    const twitter =  await this.getTwitterClientForUser(user)
    const allTrends = []
    const created = new Date()
    const trends = await twitter.getTrendsAtPlace(place.id)

    for (const trend of trends) {
      if (trend.count !== null) {
        allTrends.push({
          name: trend.name,
          count: trend.count,
          placeId: place.id,
          created: created
        })
      }
    }

    const newTrends = await Trend.query().insert(allTrends)
    return newTrends
  }

  startTrendsWatcher(opts = {}) {
    log.info('starting trend watcher')
    this.importLatestTrends()
    this.trendsWatcherId = setInterval(
      this.importLatestTrends.bind(this),
      opts.interval || 60 * 1000
    )
  }

  stopTrendsWatcher() {
    log.info('stopping trend watcher')
    if (this.trendsWatcherId) {
      clearInterval(this.trendsWatcherId)
      this.trendsWatcherId = null
    }
  }

  async getRecentTrendsForPlace(place) {

    // get the datetime of the latest import
    const result = await Trend.query()
      .max('created')
      .where('placeId', place.id)

    if (! result) {
      return []
    }

    const lastImport = result[0].max
    const trends = Trend.query()
      .select()
      .where({
        'placeId': place.id,
        'created': lastImport
      })
      .orderBy('count', 'desc')

    return trends
  }

  async getUserTrends(user) {
    // return a list of places with their most recent trends
    const results = []
    if (user && user.places) {
      for (const place of user.places) {
        place.trends = await this.getRecentTrendsForPlace(place)
        results.push(place)
      }
    }
    return results
  }

  async loadPlaces() {
    // delete any places that are in the database already
    await Place.query().delete()

    // get the places from Twitter using the admin users's keys
    const user = await this.getSuperUser()
    const twitter = await this.getTwitterClientForUser(user)
    const places = await twitter.getPlaces()

    // insert them all into the database
    await Place.query().insert(places)

    return places
  }

  getPlace(placeId) {
    const place = Place.query().first().where('id', '=', placeId)
    return place
  }

  getPlaces() {
    return Place.query().select()
  }

  getTwitterClientForUser(user) {
    return new Promise((resolve) => {
      this.getSettings().then((settings) => {
        resolve(
          new Twitter({
            consumerKey: settings.appKey,
            consumerSecret: settings.appSecret,
            accessToken: user.twitterAccessToken,
            accessTokenSecret: user.twitterAccessTokenSecret
          })
        )
      })
    })
  }

  async createSearch(search) {
    search.updated = new Date()
    const s1 = await Search.query()
      .upsertGraphAndFetch(search, {relate: true, unrelate: true, insertMissing: true})

    const s2 = await Search.query()
      .select()
      .where('search.id', s1.id)
      .withGraphJoined('creator')
      .withGraphJoined('queries')
      .first()

    return s2
  }

  async getSearch(searchId) {
    const search = await Search.query()
      .findById(searchId)
      .withGraphJoined('creator')
      .withGraphJoined('queries')

    if (! search) {
      return null
    }

    const stats = await this.getSearchStats(search)
    return {
      ...search,
      ...stats
    }
  }

  deleteSearch(search) {
    log.info('deleting search', {id: search.id})
    return Search.query().del().where('id', search.id)
  }

  async getUserSearches(user) {
    const results = await Search.query()
      .where({userId: user.id, saved: true})
      .withGraphJoined('creator')
      .withGraphJoined('queries')
      .orderBy('created', 'DESC')

    // add stats to each search
    const searches = []
    for (const search of results) {
      const stats = await this.getSearchStats(search)
      searches.push({
        ...search,
        ...stats
      })
    }

    return searches
  }

  async userOverQuota(user) {
    const searches = await this.getUserSearches(user)
    let total = 0
    for (const s of searches) {
      total += s.tweetCount
    }
    return total > user.tweetQuota
  }

  updateSearch(search) {
    // search properties are explicitly used to guard against trying
    // to persist properties that were added by getSearchSummary
    const safeSearch = this.removeStatsProps(search)
    return Search.query()
      .patch({...safeSearch, updated: new Date()})
      .where('id', safeSearch.id)
  }

  async getSearchSummary(search) {
    const results = await Tweet.query()
      .min('created')
      .max('created')
      .count('id')
      .where('searchId', search.id)

    this.convertCounts(results)
    const stats = await this.getSearchStats(search)

    return {
      ...search,
      ...stats,
      count: results[0].count,
      minDate: results[0].min,
      maxDate: results[0].max
    }
  }

  removeStatsProps(o) {
    const newO = Object.assign({}, o)
    const props = [
      'count',
      'minDate',
      'maxDate',
      'tweetCount',
      'userCount', 
      'videoCount',
      'imageCount',
      'urlCount'
    ]
    props.map(p => delete newO[p])
    return newO
  }

  async getSearchStats(search) {

    // Perhaps there could be views of this data or it could be cached?

    const results = await Tweet.query()
      .countDistinct('screenName', {as: 'users'})
      .count('tweetId', {as: 'tweets'})
      .where({searchId: search.id})
      .first()

    const rows = await Tweet.query()
      .join('tweetUrl', 'id', 'tweetUrl.tweetId')
      .select('type')
      .countDistinct('url')
      .where({searchId: search.id})
      .groupBy('type')

    const urlCounts = new Map(rows.map(r => [r.type, r.count]))

    return {
      tweetCount: parseInt(results.tweets, 10),
      userCount: parseInt(results.users, 10),
      imageCount: parseInt(urlCounts.get('image'), 10),
      videoCount: parseInt(urlCounts.get('video'), 10),
      urlCount: parseInt(urlCounts.get('page'), 10)
    }
  }

  async importFromSearch(search, maxTweets = 1000) {
    // get the a twitter client for the user
    const user = await this.getUser(search.creator.id)
    const twtr = await this.getTwitterClientForUser(user)

    // flag the search as active or running
    await this.updateSearch({id: search.id, active: true})
   
    // determine the query to run
    const lastQuery = search.queries[search.queries.length - 1]
    const q = lastQuery.searchQuery()

    // run the search!
    let maxTweetId = null
    let count = 0
    return new Promise((resolve, reject) => {
      twtr.search({q: q, sinceId: search.maxTweetId, count: maxTweets}, async (err, results) => {
        if (err) {
          reject(err)
        } else if (results.length === 0) {
          await this.updateSearch({
            id: search.id,
            maxTweetId: maxTweetId,
            active: false
          })
          resolve(count)
        } else {
          if (maxTweetId === null) {
            maxTweetId = results[0].id
          }
          await this.loadTweets(search, results)
          count += results.length
          log.info(`bulk loaded ${results.length} tweets`)
        }
      })
    })
  }

  async loadTweets(search, tweets) {

    const tweetRows = []
    for (const tweet of tweets) {

      for (const url of tweet.urls) {
        urlFetcher.add(search, url.long, tweet.id)
      }

      tweetRows.push({
        searchId: search.id,
        tweetId: tweet.id,
        created: tweet.created,
        screenName: tweet.user.screenName,
        text: tweet.text,
        retweetId: tweet.retweetId,
        quoteId: tweet.quoteId,
        retweetCount: tweet.retweetCount,
        replyCount: tweet.replyCount,
        quoteCount: tweet.quoteCount,
        likeCount: tweet.likeCount,
        replyToTweetId: tweet.replyToTweetId,
        replyToUserId: tweet.replyToUserId,
        imageCount: tweet.imageCount,
        videoCount: tweet.videoCount,
        language: tweet.language,
        json: tweet
      })
    }

    try {

      await Tweet.transaction(async trx => {

        const results = await Tweet.query(trx)
          .insert(tweetRows)
          .returning(['id', 'tweetId'])

        // now we have the tweet id we can attach relevant 
        // hashtags and urls

        const hashtagRows = []
        const urlRows = []
        for (const row of results) {

          // make sure the hashtags are unique!
          const hashtags = new Set(row.json.hashtags)
          for (const name of hashtags) {
            hashtagRows.push({name: name, tweetId: row.id})
          }

          const urls = new Set(row.json.urls.map(r => r.long))
          for (const url of urls) {
            urlRows.push({url: url, type: 'page', tweetId: row.id})
          }

          for (const url of new Set(row.json.images)) {
            urlRows.push({url: url, type: 'image', tweetId: row.id})
          }

          for (const url of new Set(row.json.videos)) {
            urlRows.push({url: url, type: 'video', tweetId: row.id})
          }

        }

        await TweetHashtag.query(trx).insert(hashtagRows)
        await TweetUrl.query(trx).insert(urlRows)

        return results.length
      })

    } catch (error) {
      console.log(`loadTweets transaction failed: ${error}`)
    }

  }

  getTweets(search, includeRetweets = true) {
    const where = {
      searchId: search.id
    }
    if (! includeRetweets) {
      where.retweetId = null
    }
    return this.pickJson(Tweet.query().select().where(where))
  }

  async getAllTweets(search) {
    return this.pickJson(Tweet.query().where('searchId', search.id))
  }

  async getTweetsForUrl(search, url, type = 'page') {
    return this.pickJson(
      Tweet.query()
        .where({searchId: search.id, url: url, type: type})
        .join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId')
        .select('json')
        .limit(100)
    )
  }

  getTweetsForImage(search, url) {
    return this.getTweetsForUrl(search, url, 'image')
  }

  getTweetsForVideo(search, url) {
    return this.getTweetsForUrl(search, url, 'video')
  }

  async getTweetsForUser(search, handle) {
    return this.pickJson(
      Tweet.query()
        .where({searchId: search.id, screenName: handle})
        .orderBy('id', 'DESC')
        .limit(100)
    )
  }

  async getTweetsByIds(search, ids) {
    return this.pickJson(
      Tweet.query()
        .where('search', search.id)
        .whereIn('tweetId', ids)
        .orderBy('id', 'DESC')
        .limit(100)
    )
  }

  async getTwitterUsers(search) {

    // maybe users should be modeled outside of the tweets they create?

    // first get the user counts for tweets

    let userCounts = await Tweet.query()
      .select('screenName')
      .count('* as total')
      .where('searchId', search.id)
      .groupBy('screenName')
      .orderBy('total', 'DESC')
      .limit(100)

    this.convertCounts(userCounts, 'total')

    // turn database results into a map of screename -> total
    userCounts = new Map(userCounts.map(r => [r.screenName, r.total]))

    // it might be more efficient to model users on import? 
    // but perhaps its better to pull them out adhoc until
    // we actually have a conversaton with them?

    const users = await Tweet.query()
      .select('json', 'screenName')
      .where('searchId', search.id)
      .whereIn('screenName', Array.from(userCounts.keys()))

    // seen is needed because we could get multiple tweets from the same user
    // and would end up with more than one results for a user 
    const seen = new Set()
    const results = []
    for (const u of users) {
      if (! seen.has(u.screenName)) {
        results.push({...u.json.user, tweetsInSearch: userCounts.get(u.screenName)})
        seen.add(u.screenName)
      } 
    }

    // sort them again
    results.sort((a, b) => b.tweetsInSearch - a.tweetsInSearch)

    return results
  }

  async getHashtags(search) {

    /*
      counts the number of times a hashtag appears in a search
      by joining tweets and hashtags. some of the wonkiness of 
      this query (the renaming name to hashtag) preserves the 
      previous elasticsearch output that the rest of the 
      application which expected:

        [{hashtag: "foo", count: 12}, ...] and not

      and not:

        [{name: "foo", count: 12}]
    */

    const results = await Tweet.query()
      .where('searchId', search.id)
      .join('tweetHashtag', 'tweet.id', 'tweetHashtag.tweetId')
      .select('name as hashtag')
      .count('name')
      .groupBy('hashtag')
      .orderBy('count', 'DESC')
    
    return this.convertCounts(results)
  }

  async getUrls(search) {
    const results = await Tweet.query()
      .where({searchId: search.id, type: 'page'})
      .join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId')
      .select('url')
      .count('url')
      .groupBy('url')
      .orderBy('count', 'DESC')

    return this.convertCounts(results)
  }

  async getImages(search) {
    const results = await Tweet.query()
      .where({searchId: search.id, type: 'image'})
      .join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId')
      .select('url')
      .count('url')
      .groupBy('url')
      .orderBy('count', 'DESC')

    return this.convertCounts(results)
  }

  async getVideos(search) {
    const results = await Tweet.query()
      .where({searchId: search.id, type: 'video'})
      .join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId')
      .select('url')
      .count('url')
      .groupBy('url')
      .orderBy('count', 'DESC')

    return this.convertCounts(results)
  }

  addUrl(search, url) {
    const job = {url, search}
    return this.redis.lpushAsync('urlqueue', JSON.stringify(job))
  }

  processUrl() {
    return new Promise((resolve, reject) => {
      this.redis.blpopAsync('urlqueue', 0)
        .then((result) => {
          const job = JSON.parse(result[1])
          resolve({
            url: job.url,
            title: 'Twitter'
          })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  getWebpages(search, start = 0, limit =  100) {
    return urlFetcher.getWebpages(search, start, limit)
  }

  queueStats(search) {
    return urlFetcher.queueStats(search)
  }

  selectWebpage(search, url) {
    return urlFetcher.selectWebpage(search, url)
  }

  deselectWebpage(search, url) {
    return urlFetcher.deselectWebpage(search, url)
  }

  async getSystemStats() {
    const tweets = await Tweet.query().count().first()
    const users = await User.query().count().first()
    return {
      tweetCount: Number.parseInt(tweets.count, 10),
      userCount: Number.parseInt(users.count, 10)
    }
  }

  async pickJson(query) {
    const results = await query
    return results.map(o => o.json)
  }

  async convertCounts(l, prop = 'count') {
    for (const o of l) {
      o[prop] = Number.parseInt(o[prop], 10)
    }
    return l
  }

}

