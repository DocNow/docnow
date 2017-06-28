import redis from 'redis'
import uuid from 'uuid/v4'
import bluebird from 'bluebird'
import { Twitter } from './twitter'

bluebird.promisifyAll(redis.RedisClient.prototype)

export class Database {

  constructor(opts) {
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
      const newUser = {...user, id: userId}
      this.db.hmsetAsync(userId, newUser)
        .then(() => {
          const twitterId = 'twitterUser:' + user.twitterUserId
          this.db.setAsync(twitterId, userId)
            .then(() => {
              resolve(userId)
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
    return new Promise((resolve) => {
      this.getUserIds()
        .then((userIds) => {
          for (const userId of userIds) {
            // TODO: get keys for this user
            const twtr = new Twitter()
            this.getUserPlaces(userId)
              .then((placeIds) => {
                const mappedPlaceIds = placeIds.map(this.stripPrefix, this)
                return Promise.all(mappedPlaceIds.map(twtr.getTrendsAtPlace, twtr))
              })
              .then(this.saveTrendsAtPlaces.bind(this))
              .then(resolve)
          }
        })
    })
  }

  getTrends(placeId) {
    const prefixedPlaceId = this.addPrefix(placeId, 'place')
    const trendsId = this.addPrefix(prefixedPlaceId, 'trends')
    return new Promise((resolve) => {
      const trends = {
        id: trendsId,
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
      m.zadd(args)
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
