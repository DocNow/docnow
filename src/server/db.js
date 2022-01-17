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
import Action from './models/Action'

import log from './logger'
import { Twitter } from './twitter'
import { UrlFetcher } from './url-fetcher'
import knexfile from '../../knexfile'
import Query from './models/Query'
import SearchJob from './models/SearchJob'
import { getRedis, searchStatsKey, startSearchJobKey } from './redis'

const urlFetcher = new UrlFetcher()

export class Database {

  constructor() {
    this.redis = getRedis()
    this.pg = knex(knexfile)
    Model.knex(this.pg)
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

    if (! settings.instanceTweetText) {
      settings.instanceTweetText = "I'm creating a collection of tweets that match {query}. You can learn more about why I'm creating it and specify your terms of your consent here {collection-url}"
    }

    return settings
  }

  async addUser(user) {
    const settings = await this.getSettings()
    user.tweetQuota = user.tweetQuota || settings.defaultQuota

    // first user is the super user (and an admin)
    const su = await this.getSuperUser()
    user.isSuperUser = su ? false : true
    user.admin = user.isSuperUser
  
    try {
      const newUser = await User.query().insert(user)

      // once we have the first user we have keys to load places from Twitter
      if (newUser.isSuperUser) {
        await this.loadPlaces()
      }

      return newUser
    } catch (e) { 
      log.error(e)
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

    // don't update searches as they could be stale
    delete user.searches

    // don't set tweetCount since it's not a column in user and is
    // added by the API
    delete user.tweetCount

    const u = await User.query()
      .allowGraph('places')
      .upsertGraph(user, {relate: true, unrelate: true})

    return u
  }

  async getUser(userId) {
    const users = await User.query()
      .withGraphJoined('places')
      .where('user.id', Number(userId))
    return users.length > 0 ? users[0] : null
  }

  async getUsers() {
    const users = await User.query()
      .withGraphJoined('places')
      .withGraphJoined('searches')
      .orderBy('user.twitterScreenName')

    for (const user of users) {
      user.tweetCount = await this.getUserTweetCount(user)
    }

    return users
  }

  getSuperUser() {
    return User.query().where('isSuperUser', '=', true).first()
  }

  getAdminUsers() {
    return User.query()
      .where('admin', '=', true)
      .orWhere('isSuperUser', '=', true)
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

  async getTwitterClientForUser(user) {
    const settings = await this.getSettings()
    return new Twitter({
      consumerKey: settings.appKey,
      consumerSecret: settings.appSecret,
      accessToken: user.twitterAccessToken,
      accessTokenSecret: user.twitterAccessTokenSecret
    })
  }

  async getTwitterClientForApp() {
    const settings = await this.getSettings()
    if (settings.appKey && settings.appSecret) {
      return new Twitter({
        consumerKey: settings.appKey,
        consumerSecret: settings.appSecret,
      })
    } else {
      return null
    }
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

  /**
   * Fetches a search from the database.
   * @param {number} searchId the search id to look up
   * @param {boolean} includeSummary whether to calcuate summary statistics
   * @param {number} ttl how many seconds to cache summary stats for 
   * @returns a search object
   */

  async getSearch(searchId, includeSummary = false, ttl = 60) {
    let search = await Search.query()
      .findById(searchId)
      .withGraphJoined('creator')
      .withGraphJoined('queries.searchJobs')

    if (! search) {
      return null
    }

    if (includeSummary) {
      const stats = await this.getSearchStats(search, ttl)
      search = {
        ...search,
        ...stats
      }
    }

    return search
  }

  async getPublicSearch(searchId) {
    const search = await Search.query()
      .findById(searchId)
      .whereNotNull("public")
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

    for (const search of results) {
      search.tweetCount = await this.getSearchTweetCount(search)
    }

    return results
  }

  async getActiveSearches() {
    const results = await Search.query()
      .where({"search.active": true, "saved": true})
      .withGraphJoined('creator')
      .withGraphJoined('queries.searchJobs')
      .orderBy('created', 'DESC')

    for (const search of results) {
      search.tweetCount = await this.getSearchTweetCount(search)
    }

    return results
  }

  async getSearchTweetCount(search) {
    const result = await this.pg('tweet')
      .join('search', 'tweet.search_id', '=', 'search.id')
      .where('search.id', '=', search.id)
      .count()
      .first()
    return parseInt(result.count, 10)
  }

  async getUserTweetCount(user) {
    const result = await this.pg('tweet')
      .join('search', 'tweet.search_id', '=', 'search.id')
      .join('user', 'search.user_id', '=', 'user.id')
      .where({
        'user.id': user.id,
        'search.saved': true
      })
      .count()
      .first()
    return parseInt(result.count, 10)
  }

  async getSearchCounts(searchIds) {
    const results = await this.pg('tweet')
      .select('search_id')
      .whereIn('search_id', searchIds)
      .groupBy('search_id')
      .count('tweet.id')
    const counts = {}
    for (const r of results) {
      counts[r.searchId] = parseInt(r.count, 10)
    }
    return counts
  }

  async getPublicSearches() {
    const results = await Search.query()
      .whereNotNull("public")
      .withGraphJoined('creator')
      .withGraphJoined('queries')
      .orderBy('created', 'DESC')

    // remove all info except for the creator's name and id
    results.map(s => {
      s.creator = {
        id: s.creator.id,
        name: s.creator.name,
        email: s.creator.email,
        twitterScreenName: s.creator.twitterScreenName
      }
    })

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
    const count = await this.getUserTweetCount(user)
    return count > user.tweetQuota
  }

  async updateSearch(search) {
    // search properties are explicitly used to guard against trying
    // to persist properties that were added by getSearchStats
    const safeSearch = this.removeStatsProps(search)
    await Search.query()
      .patch({...safeSearch, updated: new Date()})
      .where('id', safeSearch.id)
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

  async getSearchStats(search, ttl = 60) {

    const key = searchStatsKey(search)
    return this.cache(key, ttl, async () => {

      const dates = await Tweet.query()
        .min('created')
        .max('created')
        .where({'searchId': search.id})

      const users = await Tweet.query()
        .countDistinct('screenName')
        .where({searchId: search.id})
        .first()

      const tweets = await Tweet.query()
        .count('tweetId')
        .where({searchId: search.id})
        .first()

      const urls = await Tweet.query()
        .join('tweetUrl', 'id', 'tweetUrl.tweetId')
        .select('type')
        .countDistinct('url')
        .where({searchId: search.id})
        .groupBy('type')

      const urlCounts = new Map(urls.map(r => [r.type, r.count]))

      return {
        minDate: dates[0].min,
        maxDate: dates[0].max,
        tweetCount: parseInt(tweets.count, 10),
        userCount: parseInt(users.count, 10),
        imageCount: parseInt(urlCounts.get('image'), 10),
        videoCount: parseInt(urlCounts.get('video'), 10),
        urlCount: parseInt(urlCounts.get('page'), 10)
      }
    })

  }

  async importFromSearch(search, maxTweets = 1000) {
    // get the a twitter client for the user
    const user = await this.getUser(search.creator.id)
    const twtr = await this.getTwitterClientForUser(user)

    // flag the search as active or running
    await this.updateSearch({id: search.id, active: true})

    // determine the query to run
    const lastQuery = search.queries[search.queries.length - 1]
    const q = lastQuery.twitterQuery()

    // run the search!
    let maxTweetId = null
    let count = 0
    return new Promise((resolve, reject) => {
      twtr.search({q: q, sinceId: search.maxTweetId, count: maxTweets}, async (err, results) => {
        if (err) {
          log.error(`caught error during search: ${err}`)
          reject(err)
        } else if (results.length === 0) {
          await this.updateSearch({
            id: search.id,
            maxTweetId: maxTweetId,
            active: false
          })
          log.info(`no more search results, returning ${count}`)
          resolve(count)
        } else {
          if (maxTweetId === null) {
            maxTweetId = results[0].id
          }
          await this.loadTweets(search, results)
          count += results.length
          log.info(`bulk loaded ${results.length} tweets, with total=${count}`)
        }
      })
    })
  }

  async startStream(search, tweetId) {
    log.info(`starting stream for ${search.id}`)
    const lastQuery = search.queries[search.queries.length - 1]
    const q = lastQuery.twitterQuery()
    const job = await this.createSearchJob({
      type: 'stream',
      queryId: lastQuery.id, 
      tweetId: tweetId,
      started: new Date()
    })
    log.info(`created job ${job.id}`)

    const twtr = await this.getTwitterClientForApp()
    return twtr.addFilterRule(q, `search-${search.id}`)
  }

  async stopStream(search) {
    log.info(`stopping stream for search ${search.id}`)

    // remove all filter rules for this search
    const twtr = await this.getTwitterClientForApp()
    for (const rule of await twtr.getFilterRules()) {
      if (rule.tag == `search-${search.id}`) {
        await twtr.deleteFilterRule(rule.id)
        log.info(`removing filter rule ${rule.id} for ${search.id}`)
      }
    }

    // need a better way to identify the search job that needs to 
    // be ended but for now just mark any search job that has no 
    // ended time. once we can do historical collection it will be 
    // important to only end the filter stream job

    const query = search.queries[search.queries.length - 1]
    for (const job of query.searchJobs) {
      if (! job.ended) {
        await this.updateSearchJob({
          id: job.id,
          ended: new Date()
        })
      }
    }

    return this.updateSearch({...search, active: false, archived: false})
  }

  async startSearch(search, tweetId) {
    log.info(`starting search for ${search.id}`)
    await this.updateSearch({id: search.id, active: true})

    const lastQuery = search.queries[search.queries.length - 1]
    const job = await this.createSearchJob({
      type: 'search',
      queryId: lastQuery.id, 
      tweetId: tweetId,
      started: new Date()
    })

    log.info(`adding job ${job.id} to search job queue`)
    return this.redis.lpushAsync(startSearchJobKey, job.id)
  }

  async stopSearch(search) {
    log.info(`stopping search ${search.id}`)

    // need a better way to identify the search job that needs to 
    // be ended but for now just mark any search job that has no 
    // ended time. 

    const query = search.queries[search.queries.length - 1]
    for (const job of query.searchJobs) {
      if (! job.ended) {
        await this.updateSearchJob({
          id: job.id,
          ended: new Date()
        })
      }
    }

    return this.updateSearch({...search, active: false, archived: false})
  }

  async loadTweets(search, tweets) {
    log.info(`loading ${tweets.length} tweets for searchId=${search.id}`)

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
        userId: tweet.user.id,
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
      log.error(`loadTweets transaction failed: ${error}`)
    }

  }

  getTweets(search, includeRetweets = true, offset = 0, limit = 100) {
    const where = {
      searchId: search.id
    }
    if (! includeRetweets) {
      where.retweetId = null
    }
    return this.pickJson(
      Tweet
        .query()
        .select()
        .where(where)
        .offset(offset)
        .limit(limit)
    )
  }

  deleteTweets(searchId, tweetIds, twitterUserId) {
    return Tweet
      .query()
      .delete()
      .where('tweetId', 'in', tweetIds)
      .andWhere({
        searchId: searchId,
        userId: twitterUserId
      })
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

  async getTweetsForUser(search, userId) {
    return this.pickJson(
      Tweet.query()
        .where({searchId: search.id, userId: userId})
        .whereNull('retweetId')
        .orderBy('id', 'DESC')
        .limit(100)
    )
  }

  async getTweetsByIds(search, ids) {
    return this.pickJson(
      Tweet.query()
        .where({searchId: search.id})
        .whereIn('tweetId', ids)
        .orderBy('id', 'DESC')
        .limit(100)
    )
  }

  async getTwitterUsers(search, offset = 0, limit = 100) {

    // maybe users should be modeled outside of the tweets they create?

    // first get the user counts for tweets

    let userCounts = await Tweet.query()
      .select('screenName')
      .count('* as total')
      .where('searchId', search.id)
      .groupBy('screenName')
      .orderBy('total', 'DESC')
      .offset(offset)
      .limit(limit)

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

  async getSearchesWithUser(twitterScreenName) {
    const results = await Tweet.query()
      .where({screenName: twitterScreenName})      
      .whereNull('retweetId')
      .select('searchId', 'tweetId')
      .groupBy('searchId', 'tweetId')

    const counts = new Map()
    for (const row of results) {
      const tweets = counts.get(row.searchId) || []
      tweets.push(row.tweetId)
      counts.set(row.searchId, tweets)
    }
    return Object.fromEntries(counts)
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

  async getActions(search, user = null, includeArchived = false) {
    const q = {
      'action.searchId': search.id
    }

    if (user) {
      q['action.userId'] = user.id
    }

    if (includeArchived) {
      return Action.query()
        .withGraphFetched('tweet')
        .withGraphFetched('user')
        .where(q)
        .orderBy('created', 'desc')
    } else {
      return Action.query()
        .withGraphFetched('tweet')
        .withGraphFetched('user')
        .where(q)
        .whereNull('archived')
        .orderBy('created', 'desc')
    }
  }

  async setActions(search, user, tweetIds, name, remove = false) {

    // get the local tweet ids for these tweets
    const results = await Tweet.query()
      .where('searchId', search.id)
      .andWhere('tweetId', 'in', tweetIds)
    const localTweetIds = results.map(t => t.id)

    // archive existing label actions for these tweet ids
    await Action.query()
      .patch({archived: new Date()})
      .where({searchId: search.id, userId: user.id, name: name})
      .andWhere('tweetId', 'in', localTweetIds)

    // now add new labels for these tweets as long as as remove is not true
    if (! remove) {
      for (const tweetId of localTweetIds) {
        await Action.query().insert({
          searchId: search.id,
          userId: user.id,
          tweetId: tweetId,
          name: name 
        })
      }
    }

  }

  async getUserActions(user, includeArchived = false) {
    const q = {'action.userId': user.id}
    if (includeArchived) {
      return Action.query()
        .withGraphFetched('tweet')
        .withGraphFetched('user')
        .where(q)
        .orderBy('created', 'desc')
    } else {
      return Action.query()
        .withGraphFetched('tweet')
        .withGraphFetched('user')
        .where(q)
        .whereNull('archived')
        .orderBy('created', 'desc')
    }
  }

  async getQuery(queryId) {
    const query = await Query.query()
      .findById(queryId)
      .withGraphJoined('search')
      .withGraphJoined('searchJobs')
      .withGraphJoined('search.creator')
      .orderBy('searchJobs.created', 'ASC')
    return query
  }

  createSearchJob(job) {
    return SearchJob.query().insertAndFetch(job)
  }

  async getSearchJob(searchJobId) {
    const job = await SearchJob.query()
      .findById(searchJobId)
      .withGraphJoined('query.search')
    return job
  }

  async updateSearchJob(job) {
    await SearchJob.query()
      .patch({...job, updated: new Date()})
      .where('id', job.id)
  }

  async cache(key, ttl = 60, f) {
    let value = await this.redis.getAsync(key) 
    if (value) {
      return JSON.parse(value)
    } else {
      // this would be a good place to prevent thundering herd problem
      // by setting a semaphore key in redis to indicate that the query
      // is being run, and then waiting till it has stopped
      value = await f()
      await this.redis.setAsync(key, JSON.stringify(value), "EX", ttl)
      return value
    }
  }
}
