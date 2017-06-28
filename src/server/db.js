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
            const twtr = new Twitter()
            this.getUserPlaces(userId)
              .then((placeIds) => {
                placeIds = placeIds.map(this.stripPrefix, this)
                Promise.all(placeIds.map(twtr.getTrendsAtPlace, twtr))
                  .then(resolve)
              })
          }
        })
    })
  }

  getTrends(placeId) {
    const woeId = this.stripPrefix(placeId)
    const t = new Twitter()
    return new Promise((resolve, reject) => {
      resolve({
        name: 'World',
        trends: [
          {
            text: 'foo',
            tweets: 123
          }
        ]
      })
    })
  }

  addPrefix(id, prefix) {
    id = String(id)
    if (! id.match('^' + prefix + ':')) {
      return prefix + ':' + id
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
