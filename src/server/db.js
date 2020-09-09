import '../env'

import knex from 'knex'
import elasticsearch from 'elasticsearch'
import { getRedis, usersCountKey, videosCountKey, imagesCountKey,
         tweetsCountKey, urlsKey } from './redis'
import { Model } from 'objection'
import Setting from './models/Setting'
import Place from './models/Place'
import User from './models/User'
import Trend from './models/Trend'
import Search from './models/Search'
import Tweet from './models/Tweet'

import log from './logger'
import { Twitter } from './twitter'
import { UrlFetcher } from './url-fetcher'
import { addPrefix, stripPrefix } from './utils'
import knexfile from '../../knexfile'

// elasticsearch doc types

const TREND = 'trend'
const TWEET = 'tweet'

const urlFetcher = new UrlFetcher()

// const db = knex(knexfile)
// Model.knex(db)

export class Database {

  constructor(opts = {}) {
    // setup redis
    this.redis = getRedis()

    const pg = knex(knexfile)
    Model.knex(pg)
    this.pg = pg

    // setup elasticsearch
    const esOpts = opts.es || {}
    esOpts.host = esOpts.host || process.env.ES_HOST || '127.0.0.1:9200'
    log.info('connecting to elasticsearch:', esOpts)
    if (process.env.NODE_ENV === 'test') {
      this.esPrefix = 'test'
    } else {
      this.esPrefix = 'docnow'
    }
    this.es = new elasticsearch.Client(esOpts)
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
    await this.deleteIndexes()
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

    const u = await User.query()
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
    return users
  }

  async getSuperUser() {
    const user = await User.query().first().where('isSuperUser', '=', true)
    return user
  }

  getUserByTwitterUserId(userId) {
    return User.query().first().where('twitter_user_id', '=', userId)
  }

  getUserByTwitterScreenName(twitterScreenName) {
    return this.query().first().where('twitterScreeName', '=', twitterScreenName)
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

  saveTrends(trends) {
    const body = []
    for (const trend of trends) {
      trend.id = addPrefix('trend', trend.id)
      trend.placeId = addPrefix('place', stripPrefix(trend.id))
      body.push(
        {
          index: {
            _index: this.getIndex(TREND),
            _type: 'trend',
            _id: trend.id
          },
          refresh: 'wait_for'
        },
        trend
      )
    }
    return new Promise((resolve, reject) => {
      this.es.bulk({body: body, refresh: 'wait_for'})
        .then(() => {resolve(trends)})
        .catch((err) => {
          log.error('bulk insert failed', err)
          reject(err)
        })
    })
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

  createSearch(search) {
    search.updated = new Date()
    const newSearch = Search.query()
      .upsertGraph(search, {relate: true, unrelate: true, insertMissing: true})
    return newSearch
  }

  async getSearch(searchId) {
    const search = await Search.query()
      .findById(searchId)
      .withGraphJoined('creator')
      .withGraphJoined('queries')
    const stats = await this.getSearchStats(search)
    return {
      ...search,
      ...stats
    }
  }

  deleteSearch(search) {
    log.info('deleting search', {id: search.id})
    return Search.query().del(search.id)
  }

  async getUserSearches(user) {
    const results = await Search.query()
      .where('userId', '=', user.id)
      .withGraphJoined('creator')
      .withGraphJoined('queries')

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
    search.updated = new Date()
    return Search.query().upsertGraphAndFetch(
      search, 
      {relate: true, unrelate: true}
    )
  }

  async getSearchSummary(search) {
    const results = await Tweet.query()
      .min('created')
      .max('created')
      .count('id')
      .where('searchId', search.id)

    const stats = await this.getSearchStats(search)

    return {
      ...search,
      ...stats,
      count: results[0].count,
      minDate: results[0].min,
      maxDate: results[0].max
    }
  }

  async getSearchStats(search) {
    const tweetCount = await this.redis.getAsync(tweetsCountKey(search))
    const userCount = await this.redis.zcardAsync(usersCountKey(search))
    const videoCount = await this.redis.zcardAsync(videosCountKey(search))
    const imageCount = await this.redis.zcardAsync(imagesCountKey(search))
    const urlCount = await this.redis.zcardAsync(urlsKey(search))

    return {
      tweetCount: parseInt(tweetCount || 0, 10),
      imageCount: imageCount,
      videoCount: videoCount,
      userCount: userCount,
      urlCount: urlCount
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
    const queryParts = []
    for (const term of lastQuery.value.or) {
      if (term.type === 'keyword') {
        queryParts.push(term.value)
      } else if (term.type === 'user') {
        queryParts.push('@' + term.value)
      } else if (term.type === 'phrase') {
        queryParts.push(`"${term.value}"`)
      } else if (term.type === 'hashtag') {
        queryParts.push(term.value)
      } else {
        log.warn('search is missing a type: ', search)
        queryParts.push(term.value)
      }
    }
    const q = queryParts.join(' OR ')

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

    // const users = new Map()
    const tweetRows = []
    // to do: need to insert users
    // const userRows = []

    for (const tweet of tweets) {

      this.tallyTweet(search, tweet)

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

      // users[tweet.user.id] = tweet.user
    }

    const results = await Tweet.query().insert(tweetRows)

    return results.length
  }

  tallyTweet(search, tweet) {
    this.redis.incr(tweetsCountKey(search))
    this.redis.zincrby(usersCountKey(search), 1, tweet.user.screenName)
    for (const video of tweet.videos) {
      this.redis.zincrby(videosCountKey(search), 1, video)
    }
    for (const image of tweet.images) {
      this.redis.zincrby(imagesCountKey(search), 1, image)
    }
  }

  // getTweets(search, includeRetweets = true, offset = 0) {
  getTweets(search, includeRetweets = true) {
    const where = {
      searchId: search.id
    }
    if (! includeRetweets) {
      where.retweetId = null
    }
    return Tweet.query().select().where(where)
  }

  async getAllTweets(search) {
    return Tweet.query().where('searchId', search.id)
  }

  async getTweetsForUrl(search, url) {
    const ids = await urlFetcher.getTweetIdentifiers(search, url)
    const body = {
      size: 100,
      query: {
        bool: {
          must: [{match: {search: search.id}}],
          filter: {terms: {id: ids}}
        }
      },
      sort: [{id: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })
    return resp.hits.hits.map((h) => {return h._source})
  }

  async getTweetsForImage(search, url) {
    const body = {
      size: 100,
      query: {
        bool: {
          must: [{match: {search: search.id}}],
          filter: {terms: {images: [url]}}
        }
      },
      sort: [{id: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })
    return resp.hits.hits.map((h) => {return h._source})
  }

  async getTweetsForUser(search, handle) {
    const body = {
      size: 100,
      query: {
        bool: {
          must: [
            {match: {search: search.id}},
            {match: {'user.screenName': handle}}
          ],
        }
      },
      sort: [{id: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })
    return resp.hits.hits.map((h) => {return h._source})
  }

  async getTweetsForVideo(search, url) {
    const body = {
      size: 100,
      query: {
        bool: {
          must: [{match: {search: search.id}}],
          filter: {terms: {videos: [url]}}
        }
      },
      sort: [{id: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })
    return resp.hits.hits.map((h) => {return h._source})
  }

  async getTweetsByIds(search, ids) {
    const body = {
      size: 100,
      query: {
        bool: {
          must: [{match: {search: search.id}}],
          filter: {terms: {id: ids}}
        }
      },
      sort: [{id: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })
    return resp.hits.hits.map((h) => {return h._source})
  }

  async getTwitterUsers(search) {

    // first get the user counts for tweets

    let userCounts = await Tweet.query()
      .select('screenName')
      .count('* as total')
      .where('searchId', search.id)
      .groupBy('screenName')
      .orderBy('total', 'DESC')
      .limit(100)

    // turn database results into a map of screename -> total
    userCounts = new Map(userCounts.map(r => [r.screenName, r.total]))

    // it might be more efficient to model users on import? 
    // but perhaps its better to pull them out adhoc until
    // we actually have a conversaton with them?

    const users = await Tweet.query()
      .select('json', 'screenName')
      .where('searchId', search.id)
      .whereIn('screenName', Array.from(userCounts.keys()))
      .limit(100)

    const results = []
    for (const u of users) {
      results.push({...u.json.user, tweetsInSearch: userCounts.get(u.screenName)})
    }

    return results
  }

  getHashtags(search) {
    const body = {
      size: 0,
      query: {match: {search: search.id}},
      aggregations: {hashtags: {terms: {field: 'hashtags', size: 100}}}
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response) => {
        const hashtags = response.aggregations.hashtags.buckets.map((ht) => {
          return {hashtag: ht.key, count: ht.doc_count}
        })
        resolve(hashtags)
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  }

  getUrls(search) {
    const body = {
      size: 0,
      query: {match: {search: search.id}},
      aggregations: {urls: {terms: {field: 'urls.long', size: 100}}}
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response) => {
        const urls = response.aggregations.urls.buckets.map((u) => {
          return {url: u.key, count: u.doc_count}
        })
        resolve(urls)
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  }

  getImages(search) {
    const body = {
      size: 0,
      query: {match: {search: search.id}},
      aggregations: {
        images: {
          terms: {field: 'images', size: 100}
        }
      }
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response) => {
        const images = response.aggregations.images.buckets.map((u) => {
          return {url: u.key, count: u.doc_count}
        })
        resolve(images)
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  }

  getVideos(search) {
    const body = {
      size: 0,
      query: {match: {search: search.id}},
      aggregations: {
        videos: {
          terms: {field: 'videos', size: 100}
        }
      }
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response) => {
        const videos = response.aggregations.videos.buckets.map((u) => {
          return {url: u.key, count: u.doc_count}
        })
        resolve(videos)
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
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

  /* elastic search index management */

  setupIndexes() {
    return this.es.indices.exists({index: this.getIndex(TWEET)})
      .then((exists) => {
        if (! exists) {
          log.info('adding indexes')
          this.addIndexes()
        } else {
          log.warn('indexes already present, not adding')
        }
      })
      .catch((e) => {
        log.error(e)
      })
  }

  addIndexes() {
    const indexMappings = this.getIndexMappings()
    const promises = []
    for (const name of Object.keys(indexMappings)) {
      promises.push(this.addIndex(name, indexMappings[name]))
    }
    return Promise.all(promises)
  }

  addIndex(name, map) {
    const prefixedName = this.getIndex(name)
    const body = {mappings: {}}
    body.mappings[name] = map
    log.info(`creating index: ${prefixedName}`)
    return this.es.indices.create({
      index: prefixedName,
      body: body
    })
  }

  updateIndexes() {
    const indexMappings = this.getIndexMappings()
    const promises = []
    for (const name of Object.keys(indexMappings)) {
      promises.push(this.updateIndex(name, indexMappings[name]))
    }
    return Promise.all(promises)
  }

  updateIndex(name, map) {
    const prefixedName = this.getIndex(name)
    log.info(`updating index: ${prefixedName}`)
    return this.es.indices.putMapping({
      index: prefixedName,
      type: name,
      body: map
    })
  }

  deleteIndexes() {
    log.info('deleting all elasticsearch indexes')
    return new Promise((resolve) => {
      this.es.indices.delete({index: this.esPrefix + '*'})
        .then(() => {
          log.info('deleted indexes')
          resolve()
        })
        .catch((err) => {
          log.warn('indexes delete failed: ' + err)
          resolve()
        })
    })
  }

  getIndexMappings() {
    return {

      settings: {
        properties: {
          type: {type: 'keyword'},
          appKey: {type: 'keyword'},
          appSecret: {type: 'keyword'}
        }
      },

      user: {
        properties: {
          type: {type: 'keyword'},
          places: {type: 'keyword'}
        }
      },

      search: {
        properties: {
          id: {type: 'keyword'},
          type: {type: 'keyword'},
          title: {type: 'text'},
          description: {type: 'text'},
          created: {type: 'date', format: 'date_time'},
          creator: {type: 'keyword'},
          active: {type: 'boolean'},
          saved: {type: 'boolean'},
          'query.type': {type: 'keyword'},
          'query.value': {type: 'keyword'},
        }
      },

      place: {
        properties: {
          id: {type: 'keyword'},
          type: {type: 'keyword'},
          name: {type: 'text'},
          country: {type: 'text'},
          countryCode: {type: 'keyword'},
          parentId: {type: 'keyword'}
        }
      },

      trend: {
        properties: {
          id: {type: 'keyword'},
          type: {type: 'keyword'},
          'trends.name': {type: 'keyword'},
          'trends.tweets': {type: 'integer'}
        }
      },

      twuser: {
        properties: {
          id: {type: 'keyword'},
          type: {type: 'keyword'},
          screenName: {type: 'keyword'},
          created: {type: 'date', format: 'date_time'},
          updated: {type: 'date', format: 'date_time'}
        }
      },

      tweet: {
        properties: {
          id: {type: 'keyword'},
          type: {type: 'keyword'},
          search: {type: 'keyword'},
          retweetCount: {type: 'integer'},
          likeCount: {type: 'integer'},
          created: {type: 'date', format: 'date_time'},
          client: {type: 'keyword'},
          hashtags: {type: 'keyword'},
          mentions: {type: 'keyword'},
          geo: {type: 'geo_shape'},
          videos: {type: 'keyword'},
          images: {type: 'keyword'},
          animatedGifs: {type: 'keyword'},
          emojis: {type: 'keyword'},

          country: {type: 'keyword'},
          countryCode: {type: 'keyword'},
          boundingBox: {type: 'geo_shape'},

          'urls.short': {type: 'keyword'},
          'urls.long': {type: 'keyword'},
          'urls.hostname': {type: 'keyword'},
          'user.screenName': {type: 'keyword'},
          'quote.user.screenName': {type: 'keyword'},
          'retweet.user.screenName': {type: 'keyword'}
        }
      }
    }
  }

  async mergeIndexes() {
    const results = await this.es.indices.forcemerge({index: '_all'})
    return results
  }

  async getSystemStats() {
    const tweets = await Tweet.query().count().first()
    const users = await User.query().count().first()
    return {
      tweetCount: tweets.count,
      userCount: users.count
    }
  }

}
