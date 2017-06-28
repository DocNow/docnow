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
    return new Promise((resolve, reject) => {
      const userId = 'user:' + uuid()
      const newUser = {...user, id: userId}
      this.db.hmsetAsync(userId, newUser)
        .then((result) => {
          const twitterId = 'twitterUser:' + user.twitterUserId
          this.db.setAsync(twitterId, userId)
            .then((result) => {
              resolve(userId)
            })
          })
      })
  }

  getUser(userId) {
    return new Promise((resolve, reject) => {
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
    twitterUserId = this.addPrefix(twitterUserId, 'twitterUser')
    return new Promise((resolve, reject) => {
      this.db.getAsync(twitterUserId)
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
    return new Promise((resolve, reject) => {
      this.db.saddAsync('places:' + userId, this.addPrefixes(placeIds, 'place'))
        .then(resolve)
    })
  }

  getUserPlaces(userId) {
    return new Promise((resolve, reject) => {
      this.db.smembersAsync('places:' + userId)
        .then((places) => resolve(places))
    })
  }

  getUserIds() {
    return this.db.keysAsync("user:*")
  }

  importLatestTrends() {
    return new Promise((resolve, reject) => {
      this.getUserIds()
        .then((userIds) => {
          for (let userId of userIds) {
            // TODO: get keys for this user
            const twtr = new Twitter()
            this.getUserPlaces(userId)
              .then((placeIds) => {
                placeIds = placeIds.map(this.stripPrefix, this)
                return Promise.all(placeIds.map(twtr.getTrendsAtPlace, twtr))
              })
              .then(this.saveTrendsAtPlaces.bind(this))
              .then(resolve)
          }
        })
    })
  }

  getTrends(placeId) {
    placeId = this.addPrefix(placeId, 'place')
    let trendsId = this.addPrefix(placeId, 'trends')
    return new Promise((resolve, reject) => {
      let trends = {
        id: trendsId,
        placeId: placeId,
        trends: []
      }
      this.db.zrevrangeAsync(trendsId, 0, -1, 'WITHSCORES')
        .then((result) => {
          for (let i=0; i < result.length; i += 2) {
            trends.trends.push({name: result[i], tweets: result[i+1]})
          }
          resolve(trends)
        })
    })
  }

  saveTrendsAtPlaces(trendsAtPlaces) {

    // build up a list of redis zadd commands to add the trends at each place
    const m = this.db.multi()
    for (let trends of trendsAtPlaces) {
      let placeId = this.addPrefix(trends.id, 'place')
      let trendId = this.addPrefix(placeId, 'trends')
      let args = [trendId]
      for (let trend of trends.trends) {
        if (trend.tweets > 0) {
          args.push(trend.tweets, trend.name)
        }
      }
      m.zadd(args)
    }

    // return a promise that executes all of the commands and returns trends
    return new Promise((resolve, reject) => {
      return m.exec((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(trendsAtPlaces)
        }
      })
    })
  }

  addPrefix(id, prefix) {
    id = String(id)
    if (! id.match('^' + prefix + ':')) {
      id = prefix + ':' + id
    }
    return id
  }

  addPrefixes(ids, prefix) {
    return ids.map((id) => { return this.addPrefix(id, prefix) })
  }

  stripPrefix(s) {
    return String(s).replace(/^.+:/, '')
  }

}
