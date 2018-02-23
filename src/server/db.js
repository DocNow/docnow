import fs from 'fs'
import path from 'path'
import uuid from 'uuid/v4'
import csv from 'csv-stringify/lib/sync'
import rimraf from 'rimraf'
import archiver from 'archiver'
import elasticsearch from 'elasticsearch'
import { getRedis, usersCountKey, videosCountKey, imagesCountKey,
         tweetsCountKey, urlsKey } from './redis'

import log from './logger'
import { Twitter } from './twitter'
import { UrlFetcher } from './url-fetcher'
import { addPrefix, stripPrefix } from './utils'

// elasticsearch doc types

const SETTINGS = 'settings'
const USER = 'user'
const PLACE = 'place'
const SEARCH = 'search'
const TREND = 'trend'
const TWEET = 'tweet'
const TWUSER = 'twuser'

const urlFetcher = new UrlFetcher()

export class Database {

  constructor(opts = {}) {
    // setup redis
    this.redis = getRedis()

    // setup elasticsearch
    const esOpts = opts.es || {}
    esOpts.host = esOpts.host || process.env.ES_HOST || '127.0.0.1:9200'
    log.info('connecting to elasticsearch:', esOpts)
    this.esPrefix = esOpts.prefix || 'docnow'
    this.es = new elasticsearch.Client(esOpts)
  }

  getIndex(type) {
    return this.esPrefix + '-' + type
  }

  close() {
    this.redis.quit()
    urlFetcher.stop()
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.redis.flushdbAsync()
        .then((didSucceed) => {
          if (didSucceed === 'OK') {
            this.deleteIndexes()
              .then(resolve)
              .catch(reject)
          } else {
            reject('redis flushdb failed')
          }
        })
    })
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

  addSettings(settings) {
    return this.add(SETTINGS, 'settings', settings)
  }

  getSettings() {
    return new Promise((resolve) => {
      this.get(SETTINGS, 'settings')
        .then((settings) => {
          resolve(settings)
        })
        .catch(() => {
          resolve({})
        })
    })
  }

  addUser(user) {
    user.id = uuid()
    user.places = []
    log.info('creating user: ', {user: user})
    return new Promise((resolve) => {
      this.getSuperUser()
        .then((u) => {
          user.isSuperUser = u ? false : true
          this.add(USER, user.id, user)
            .then(() => {
              if (user.isSuperUser) {
                this.loadPlaces().then(() => {resolve(user)})
              } else {
                resolve(user)
              }
            })
        })
    })
  }

  updateUser(user) {
    return this.add(USER, user.id, user)
  }

  getUser(userId) {
    return this.get(USER, userId)
  }

  getUsers() {
    return this.search(USER, '*')
  }

  getSuperUser() {
    return this.search(USER, 'isSuperUser:true', true)
  }

  getUserByTwitterUserId(twitterUserId) {
    return this.search(USER, `twitterUserId:${twitterUserId}`, true)
  }

  importLatestTrends() {
    log.debug('importing trends')
    return new Promise((resolve) => {
      this.getUsers()
        .then((users) => {
          for (const user of users) {
            this.importLatestTrendsForUser(user).then(resolve)
          }
        })
        .catch(() => {
          log.info('no users to import trends for')
          resolve()
        })
    })
  }

  importLatestTrendsForUser(user) {
    log.debug('importing trends', {user: user})
    return new Promise((resolve, reject) => {
      this.getTwitterClientForUser(user)
        .then((twtr) => {
          const placeIds = user.places.map(stripPrefix)
          if (placeIds.length === 0) {
            resolve([])
          } else {
            log.info('importing trends for ', {placeIds: placeIds})
            Promise.all(placeIds.map(twtr.getTrendsAtPlace, twtr))
              .then(this.saveTrends.bind(this))
              .then(resolve)
          }
        })
        .catch(reject)
    })
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

  getTrendsForPlace(placeId) {
    return new Promise((resolve) => {
      this.search('trend', `placeId:${placeId}`, true)
        .then((results) => {
          const filtered = results.trends.filter((t) => {
            return t.tweets > 0
          })
          filtered.sort((a, b) => {
            return b.tweets - a.tweets
          })
          results.trends = filtered
          resolve(results)
        })
    })
  }

  getUserTrends(user) {
    if (user && user.places) {
      return Promise.all(user.places.map(this.getTrendsForPlace, this))
    }
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

  loadPlaces() {
    return new Promise((resolve, reject) => {
      this.getSuperUser()
        .then((user) => {
          this.getTwitterClientForUser(user)
            .then((t) => {
              t.getPlaces().then((places) => {

                // bulk insert all the places as separate
                // documents in elasticsearch

                const body = []
                for (const place of places) {
                  place.id = addPrefix('place', place.id)
                  place.parentId = addPrefix('place', place.parent)
                  delete place.parent
                  body.push({
                    index: {
                      _index: this.getIndex(PLACE),
                      _type: 'place',
                      _id: place.id
                    }
                  })
                  body.push(place)
                }

                this.es.bulk({body: body, refresh: 'wait_for'})
                  .then(() => {
                    resolve(places)
                  })
                  .catch(reject)
              })
            })
            .catch(reject)
        })
        .catch(reject)
    })
  }

  getPlace(placeId) {
    return this.search(PLACE, placeId, true)
  }

  getPlaces() {
    return this.search(PLACE, '*')
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

  createSearch(user, query) {
    return new Promise((resolve, reject) => {
      const search = {
        id: uuid(),
        creator: user.id,
        query: query,
        created: new Date().toISOString(),
        updated: new Date(),
        maxTweetId: null,
        active: true
      }
      this.es.create({
        index: this.getIndex(SEARCH),
        type: SEARCH,
        id: search.id,
        body: search
      }).then(() => {
        resolve(search)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  async deleteSearch(search) {
    log.info('deleting search', {id: search.id})
    const resp = await this.es.delete({
      index: this.getIndex(SEARCH),
      type: SEARCH,
      id: search.id
    })
    return resp && resp.result === 'deleted'
  }

  async getUserSearches(user) {
    // const body = {query: {match: {creator: user.id, saved: true}}}
    const body = {
      query: {
        bool: {
          must: [
            {match: {creator: user.id}},
            {match: {saved: true}}
          ]
        }
      },
      sort: [{created: 'desc'}]
    }
    const resp = await this.es.search({
      index: this.getIndex(SEARCH),
      type: SEARCH,
      body: body
    })

    const searches = []

    for (const hit of resp.hits.hits) {
      const search = hit._source
      const stats = await this.getSearchStats(search)
      searches.push({
        ...search,
        ...stats
      })
    }

    return searches
  }

  getSearch(searchId) {
    return this.get(SEARCH, searchId)
  }

  updateSearch(search) {
    search.updated = new Date()
    return this.add(SEARCH, search.id, search)
  }

  async getSearchSummary(search) {
    const body = {
      query: {
        match: {
          search: search.id
        }
      },
      aggregations: {
        minDate: {min: {field: 'created'}},
        maxDate: {max: {field: 'created'}}
      }
    }

    const resp = await this.es.search({
      index: this.getIndex(TWEET),
      type: TWEET,
      body: body
    })

    const stats = await this.getSearchStats(search)

    return {
      ...search,
      ...stats,
      minDate: new Date(resp.aggregations.minDate.value),
      maxDate: new Date(resp.aggregations.maxDate.value)
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

  importFromSearch(search, maxTweets = 1000) {
    let count = 0
    let totalCount = search.count || 0
    let maxTweetId = null

    const queryParts = []
    for (const term of search.query) {
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

    return new Promise((resolve, reject) => {
      this.getUser(search.creator).then((user) => {
        this.updateSearch({...search, active: true})
          .then((newSearch) => {
            this.getTwitterClientForUser(user)
              .then((twtr) => {
                twtr.search({q: q, sinceId: search.maxTweetId, count: maxTweets}, (err, results) => {
                  if (err) {
                    reject(err)
                  } else if (results.length === 0) {
                    newSearch.count = totalCount
                    newSearch.maxTweetId = maxTweetId
                    newSearch.active = false
                    this.updateSearch(newSearch)
                      .then(() => {resolve(count)})
                  } else {
                    count += results.length
                    totalCount += results.length
                    if (maxTweetId === null) {
                      maxTweetId = results[0].id
                    }
                    this.loadTweets(search, results)
                      .then(() => {
                        log.info('bulk loaded ' + results.items + ' objects')
                      })
                  }
                })
              })
          })
          .catch((e) => {
            log.error('unable to update search: ', e)
          })
      })
    })
  }

  loadTweets(search, tweets) {
    return new Promise((resolve, reject) => {
      const bulk = []
      const seenUsers = new Set()

      for (const tweet of tweets) {

        this.tallyTweet(search, tweet)

        for (const url of tweet.urls) {
          urlFetcher.add(search, url.long, tweet.id)
        }

        tweet.search = search.id
        const id = search.id + ':' + tweet.id

        bulk.push(
          {
            index: {
              _index: this.getIndex(TWEET),
              _type: 'tweet',
              _id: id
            }
          },
          tweet
        )
        if (! seenUsers.has(tweet.user.id)) {
          bulk.push(
            {
              index: {
                _index: this.getIndex(TWUSER),
                _type: 'twuser',
                _id: tweet.user.id,
              }
            },
            tweet.user
          )
          seenUsers.add(tweet.user.id)
        }
      }

      this.es.bulk({
        body: bulk,
        refresh: 'wait_for'
      }).then((resp) => {
        if (resp.errors) {
          reject('indexing error check elasticsearch log')
        } else {
          resolve(resp)
        }
      }).catch((elasticErr) => {
        log.error(elasticErr.message)
        reject(elasticErr.message)
      })
    })
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

  getTweets(search, includeRetweets = true, offset = 0) {
    const body = {
      from: offset,
      size: 100,
      query: {
        bool: {
          must: {
            term: {
              search: search.id
            }
          }
        }
      },
      sort: {
        created: 'desc'
      }
    }

    // adjust the query and sorting if they don't want retweets
    if (! includeRetweets) {
      body.query.bool.must_not = {exists: {field: 'retweet'}}
      body.sort = [{retweetCount: 'desc'}, {created: 'desc'}]
    }

    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response) => {
        resolve(response.hits.hits.map((h) => {return h._source}))
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
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

  getTwitterUsers(search) {

    // first get the user counts for tweets

    let body = {
      query: {match: {search: search.id}},
      aggregations: {users: {terms: {field: 'user.screenName', size: 100}}}
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.getIndex(TWEET),
        type: TWEET,
        body: body
      }).then((response1) => {

        // with the list of users get the user information for them
        const counts = new Map()
        const buckets = response1.aggregations.users.buckets
        buckets.map((c) => {counts.set(c.key, c.doc_count)})
        const screenNames = Array.from(counts.keys())

        body = {
          size: 100,
          query: {
            constant_score: {
              filter: {
                terms: {
                  'screenName': screenNames
                }
              }
            }
          }
        }
        this.es.search({
          index: this.getIndex(TWUSER),
          type: TWUSER,
          body: body
        }).then((response2) => {
          const users = response2.hits.hits.map((h) => {return h._source})

          // add the tweet counts per user that we got previously
          for (const user of users) {
            user.tweetsInSearch = counts.get(user.screenName)
          }

          // sort them by their counts
          users.sort((a, b) => {return b.tweetsInSearch - a.tweetsInSearch})
          resolve(users)
        })
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
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
      aggregations: {images: {terms: {field: 'images', size: 100}}}
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
      aggregations: {videos: {terms: {field: 'videos', size: 100}}}
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

  async createArchive(search) {
    const projectDir = path.dirname(path.dirname(__dirname))
    const userDataDir = path.join(projectDir, 'userData')
    const archivesDir = path.join(userDataDir, 'archives')
    const searchDir = path.join(archivesDir, search.id)

    if (! fs.existsSync(searchDir)) {
      fs.mkdirSync(searchDir)
    }

    await this.saveTweetIds(search, searchDir)
    await this.saveUrls(search, searchDir)

    return new Promise((resolve) => {
      const zipPath = path.join(archivesDir, `${search.id}.zip`)
      const zipOut = fs.createWriteStream(zipPath)
      const archive = archiver('zip')
      archive.pipe(zipOut)
      archive.directory(searchDir, search.id)

      archive.on('finish', () => {
        rimraf(searchDir, {}, async () => {
          await this.updateSearch({
            ...search,
            archived: true,
            archiveStarted: false
          })
          resolve(zipPath)
        })
      })

      archive.finalize()
    })
  }

  async saveTweetIds(search, searchDir) {
    return new Promise(async (resolve) => {
      const idsPath = path.join(searchDir, 'ids.csv')
      const fh = fs.createWriteStream(idsPath)
      let offset = 0
      while (true) {
        const tweets = await this.getTweets(search, true, offset)
        if (tweets.length === 0) {
          break
        }
        for (const tweet of tweets) {
          fh.write(tweet.id + '\r\n')
        }
        offset += 100
      }
      fh.end('')
      fh.on('close', () => {resolve(idsPath)})
    })
  }

  async saveUrls(search, searchDir) {
    return new Promise(async (resolve) => {
      const urlsPath = path.join(searchDir, 'urls.csv')
      const fh = fs.createWriteStream(urlsPath)
      let offset = 0
      fh.write('url,title,count\r\n')

      while (true) {
        const webpages = await this.getWebpages(search, offset)
        if (webpages.length === 0) {
          break
        }
        const s = csv(webpages, {columns: ['url', 'title', 'count']})
        fh.write(s + '\r\n')
        offset += 100
      }
      fh.end('')
      fh.on('close', () => {resolve(urlsPath)})
    })
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

}
