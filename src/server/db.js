import redis from 'redis'
import uuid from 'uuid/v4'
import bluebird from 'bluebird'
import elasticsearch from 'elasticsearch'

import log from './logger'
import { Twitter } from './twitter'

bluebird.promisifyAll(redis.RedisClient.prototype)

export class Database {

  constructor(opts = {}) {
    // setup redis
    const redisOpts = opts.redis || {}
    redisOpts.host = redisOpts.host || process.env.REDIS_HOST || '127.0.0.1'
    log.info('connecting to redis: ' + redisOpts)
    this.db = redis.createClient(redisOpts)

    // setup elasticsearch
    const esOpts = opts.es || {}
    esOpts.host = esOpts.host || process.env.ES_HOST || '127.0.0.1:9200'
    log.info('connecting to elasticsearch: ' + esOpts)
    this.esPrefix = esOpts.prefix || 'docnow'
    this.esTweetIndex = this.esPrefix + ':tweets'
    this.es = new elasticsearch.Client(esOpts)
    log.info('setting up index')
    this.setupIndexes()
  }

  close() {
    this.db.quit()
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.db.flushdbAsync()
        .then((didSucceed) => {
          if (didSucceed === 'OK') {
            this.deleteIndexes()
              .then(() => {this.addIndexes()})
              .then(resolve)
              .catch(reject)
          } else {
            reject('redis flushdb failed')
          }
        })
    })
  }

  addSettings(settings) {
    return this.db.hmsetAsync('settings', settings)
  }

  getSettings() {
    return this.db.hgetallAsync('settings')
  }

  addUser(user) {
    return new Promise((resolve) => {
      const userId = 'user:' + uuid()
      this.getUserIds().then((userIds) => {
        const isSuperUser = userIds.length === 0 ? true : false
        const newUser = {...user, id: userId, isSuperUser}
        log.info('adding user', {user: newUser})
        this.db.hmsetAsync(userId, newUser)
          .then(() => {
            const twitterId = 'twitterUser:' + user.twitterUserId
            this.db.setAsync(twitterId, userId)
              .then(() => {
                if (isSuperUser) {
                  this.db.set('superUser', userId)
                  this.loadPlaces().then(() => {
                    resolve(userId)
                  })
                } else {
                  resolve(userId)
                }
              })
          })
      })
    })
  }

  updateUser(userId, data) {
    return this.db.hmsetAsync(userId, ['name', data.name, 'email', data.email])
  }

  getUser(userId) {
    return new Promise((resolve) => {
      this.db.hgetallAsync(userId)
        .then((result) => {
          if (result) {
            resolve(result)
          } else {
            resolve(null)
          }
        })
    })
  }

  getSuperUser() {
    return new Promise((resolve) => {
      this.db.getAsync('superUser')
        .then((userId) => {
          resolve(this.getUser(userId))
        })
    })
  }

  getUserByTwitterUserId(twitterUserId) {
    const prefixedId = this.addPrefix(twitterUserId, 'twitterUser')
    return new Promise((resolve) => {
      this.db.getAsync(prefixedId)
        .then((userId) => {
          if (userId) {
            this.getUser(userId)
              .then((user) => {
                resolve(user)
              })
          } else {
            resolve(null)
          }
        })
    })
  }

  setUserPlaces(userId, placeIds) {
    return new Promise((resolve) => {
      const key = this.addPrefix(userId, 'places')
      this.db.del(key)
      if (placeIds.length > 0) {
        this.db.saddAsync(key, this.addPrefixes(placeIds, 'place'))
          .then(resolve)
      } else { resolve() }
    })
  }

  getUserPlaces(userId) {
    return new Promise((resolve) => {
      this.db.smembersAsync('places:' + userId)
        .then((places) => resolve(places))
    })
  }

  getUserIds() {
    return this.db.keysAsync('user:*')
  }

  importLatestTrends() {
    log.info('importing trends')
    return new Promise((resolve) => {
      this.getUserIds()
        .then((userIds) => {
          for (const userId of userIds) {
            this.importLatestTrendsForUser(userId).then(resolve)
          }
        })
    })
  }

  importLatestTrendsForUser(userId) {
    log.info('importing trends for ' + userId)
    return new Promise((resolve) => {
      this.getTwitterClientForUser(userId)
        .then((twtr) => {
          this.getUserPlaces(userId)
            .then((placeIds) => {
              const prefixed = placeIds.map(this.stripPrefix, this)
              return Promise.all(prefixed.map(twtr.getTrendsAtPlace, twtr))
            })
            .then(this.saveTrendsAtPlaces.bind(this))
            .then(resolve)
        })
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

  getTrends(placeId) {
    const prefixedPlaceId = this.addPrefix(placeId, 'place')
    const trendsId = this.addPrefix(prefixedPlaceId, 'trends')
    return new Promise((resolve) => {
      this.getPlace(placeId).then((place) => {
        const trends = {
          id: trendsId,
          name: place.name,
          placeId: placeId,
          trends: []
        }
        this.db.zrevrangeAsync(trendsId, 0, -1, 'WITHSCORES')
          .then((result) => {
            for (let i = 0; i < result.length; i += 2) {
              trends.trends.push({name: result[i], tweets: result[i + 1]})
            }
            resolve(trends)
          })
      })
    })
  }

  getUserTrends(userId) {
    return new Promise((resolve) => {
      this.getUserPlaces(userId)
        .then((placeIds) => {
          Promise.all(placeIds.map(this.getTrends, this))
            .then((result) => {
              resolve(result)
            })
        })
    })
  }

  saveTrendsAtPlaces(trendsAtPlaces) {
    // build up a list of redis zadd commands to add the trends at each place
    const m = this.db.multi()
    for (const trends of trendsAtPlaces) {
      const placeId = this.addPrefix(trends.id, 'place')
      const trendId = this.addPrefix(placeId, 'trends')
      const args = [trendId]
      for (const trend of trends.trends) {
        if (trend.tweets > 0) {
          args.push(trend.tweets, trend.name)
        }
      }
      m.del(trendId)
      m.zadd(args)
      m.hmset(placeId, 'name', trends.name)
    }

    // return a promise that executes all of the commands and returns trends
    return new Promise((resolve, reject) => {
      return m.exec((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(trendsAtPlaces)
        }
      })
    })
  }

  loadPlaces() {
    const addPrefix = this.addPrefix.bind(this)
    return new Promise((resolve, reject) => {
      this.getUserIds()
        .then((userIds) => {
          if (userIds.length > 0) {
            this.getTwitterClientForUser(userIds[0])
              .then((t) => {
                t.getPlaces().then((places) => {
                  const m = this.db.multi()
                  for (const place of places) {
                    place.id = addPrefix(place.id, 'place')
                    m.hmset(place.id, place)
                    m.sadd('places', place.id)
                  }
                  m.exec((err) => {
                    if (! err) {
                      resolve(places)
                    } else {
                      reject(err)
                    }
                  })
                })
              })
          }
        })
    })
  }

  getPlace(placeId) {
    const prefixed = this.addPrefix(placeId, 'place')
    return this.db.hgetallAsync(prefixed)
  }

  getPlaces() {
    return new Promise((resolve) => {
      this.db.smembersAsync('places')
        .then((placeIds) => {
          const m = this.db.multi()
          for (const placeId of placeIds) {
            m.hgetall(placeId)
          }
          m.exec((err, result) => {
            const places = {}
            for (const place of result) {
              places[place.id] = place
            }
            resolve(places)
          })
        })
    })
  }

  getTwitterClientForUser(userId) {
    return new Promise((resolve) => {
      this.getSettings().then((settings) => {
        this.getUser(userId)
          .then((user) => {
            resolve(new Twitter({
              consumerKey: settings.appKey,
              consumerSecret: settings.appSecret,
              accessToken: user.twitterAccessToken,
              accessTokenSecret: user.twitterAccessTokenSecret
            }))
          })
      })
    })
  }

  addPrefix(id, prefix) {
    let idString = String(id)
    if (! idString.match('^' + prefix + ':')) {
      idString = prefix + ':' + idString
    }
    return idString
  }

  addPrefixes(ids, prefix) {
    return ids.map((id) => { return this.addPrefix(id, prefix) })
  }

  stripPrefix(s) {
    return String(s).replace(/^.+:/, '')
  }

  /* ElasticSearch */

  /*
   * setupIndex() will look to see if the ElasticSearch indexes have
   * been setup. If they haven't then they will be added.
   */

  setupIndexes() {
    this.es.indices.exists({index: this.esTweetIndex})
      .then((exists) => {
        if (! exists) {
          log.info('adding indexes')
          this.addIndexes()
        } else {
          log.info('indexes already present, not adding')
        }
      })
  }

  addIndexes() {
    return this.es.indices.create({
      index: this.esTweetIndex,
      body: {
        mappings: {
          search: {
            properties: {
              id: {type: 'keyword'},
              created: {type: 'date', format: 'date_time'},
              creator: {type: 'keyword'},
              query: {type: 'text'},
              active: {type: 'boolean'},
            }
          },
          user: {
            properties: {
              id: {type: 'keyword'},
              screenName: {type: 'keyword'},
              created: {type: 'date', format: 'date_time'},
              updated: {type: 'date', format: 'date_time'},
            }
          },
          tweet: {
            properties: {
              id: {type: 'keyword'},
              search: {type: 'keyword'},
              retweetCount: {type: 'integer'},
              likeCount: {type: 'integer'},
              created: {type: 'date', format: 'date_time'},
              client: {type: 'keyword'},
              hashtags: {type: 'keyword'},
              mentions: {type: 'keyword'},
              geo: {type: 'geo_point'},
              videos: {type: 'keyword'},
              photos: {type: 'keyword'},
              animatedGifs: {type: 'keyword'},
              emojis: {type: 'keyword'},
              'place.id': {type: 'keyword'},
              'place.name': {type: 'keyword'},
              'place.boundingBox': {type: 'geo_shape'},
              'place.country': {type: 'keyword'},
              'place.countryCode': {type: 'keyword'},
              'urls.short': {type: 'keyword'},
              'urls.full': {type: 'keyword'},
              'urls.hostname': {type: 'keyword'},
              'user.screenName': {type: 'keyword'},
              'quote.user.screenName': {type: 'keyword'},
              'retweet.user.screenName': {type: 'keyword'}
            }
          }
        }
      }
    })
  }

  deleteIndexes() {
    return new Promise((resolve) => {
      const indexes = this.esPrefix + ':*'
      this.es.indices.delete({index: indexes})
        .then(() => {
          log.info('deleted indexes: ' + indexes)
          resolve()
        })
        .catch((err) => {
          log.warn('indexes delete failed: ' + err)
          // if any of the indexes aren't there this will fail
          // but that's ok because we're deleting them
          resolve()
        })
    })
  }

  createSearch(userId, q) {
    return new Promise((resolve, reject) => {
      const search = {
        id: 'search:' + uuid(),
        creator: userId,
        query: q,
        created: new Date().toISOString()
      }
      this.es.create({
        index: this.esTweetIndex,
        type: 'search',
        id: search.id,
        body: search
      }).then((resp) => {
        if (resp.created) {
          resolve(search)
        } else {
          reject('search not created!')
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }

  getSearch(searchId) {
    return new Promise((resolve, reject) => {
      this.es.get({
        index: this.esTweetIndex,
        type: 'search',
        id: searchId
      }).then((resp) => {
        resolve(resp._source)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  getSearchSummary(search) {
    return new Promise((resolve, reject) => {
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
      this.es.search({
        index: this.esTweetIndex,
        type: 'tweet',
        body: body
      }).then((resp) => {
        resolve({
          ...search,
          minDate: new Date(resp.aggregations.minDate.value),
          maxDate: new Date(resp.aggregations.maxDate.value),
          count: resp.hits.total
        })
      })
      .catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  }

  importFromSearch(search) {
    let count = 0
    return new Promise((resolve, reject) => {
      this.getTwitterClientForUser(search.creator)
        .then((twtr) => {
          twtr.search({q: search.query}, (err, results) => {
            if (err) {
              reject(err)
            } else if (results.length === 0) {
              resolve(count)
            } else {
              count += results.length
              const bulk = []
              const seenUsers = new Set()
              for (const tweet of results) {
                tweet.search = search.id
                const id = search.id + ':' + tweet.id
                bulk.push(
                  {
                    index: {
                      _index: this.esTweetIndex,
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
                        _index: this.esTweetIndex,
                        _type: 'user',
                        _id: tweet.user.id,
                      }
                    },
                    tweet.user
                  )
                  seenUsers.add(tweet.user.id)
                }
              }
              this.es.bulk({
                body: bulk
              }).then((resp) => {
                if (resp.errors) {
                  reject('indexing error check elasticsearch log')
                } else {
                  resolve(results)
                }
              }).catch((elasticErr) => {
                log.error(elasticErr.message)
                reject(elasticErr.message)
              })
            }
          })
        })
    })
  }

  getTweets(search) {
    const body = {
      size: 100,
      query: {match: {search: search.id}},
      sort: [{created: 'desc'}]
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.esTweetIndex,
        type: 'tweet',
        body: body
      }).then((response) => {
        resolve(response.hits.hits.map((h) => {return h._source}))
      }).catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  }

  getUsers(search) {

    // first get the user counts for tweets

    let body = {
      query: {match: {search: search.id}},
      aggregations: {users: {terms: {field: 'user.screenName', size: 100}}}
    }
    return new Promise((resolve, reject) => {
      this.es.search({
        index: this.esTweetIndex,
        type: 'tweet',
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
          index: this.esTweetIndex,
          type: 'user',
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
        index: this.esTweetIndex,
        type: 'tweet',
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

  getPhotos(searchId) {
    log.debug(searchId)
    return new Promise((resolve) => {
      resolve()
    })
  }

  getVideos(searchId) {
    log.debug(searchId)
    return new Promise((resolve) => {
      resolve()
    })
  }

}
