import redis from 'redis'
import uuid from 'uuid/v4'
import bluebird from 'bluebird'
import { Twitter } from './twitter'

bluebird.promisifyAll(redis.RedisClient.prototype)

export class Database {

  constructor(opts = {}) {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    this.db = redis.createClient(opts)
  }

  clear() {
    return this.db.flushdbAsync()
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
        this.db.hmsetAsync(userId, newUser)
          .then(() => {
            const twitterId = 'twitterUser:' + user.twitterUserId
            this.db.setAsync(twitterId, userId)
              .then(() => {
                if (isSuperUser) {
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
      this.db.del('places:' + userId)
      this.db.saddAsync('places:' + userId, this.addPrefixes(placeIds, 'place'))
        .then(resolve)
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
    // this is a scary bit of logic does a lot of things with Redis:
    // gets a list of user ids, gets user information for each one,
    // creates a Twitter client using the user's keys and then fetches
    // a list of the place ids that the user watches, and finally it
    // gets the trends for those locations.

    console.log('fetching trends')

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
    this.importLatestTrends()
    this.trendsWatcherId = setInterval(
      this.importLatestTrends.bind(this),
      opts.interval || 60 * 1000
    )
  }

  stopTrendsWatcher() {
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

}
