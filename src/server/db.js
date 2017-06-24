import redis from 'redis'
import uuid from 'uuid/v4'
import bluebird from 'bluebird'

bluebird.promisifyAll(redis.RedisClient.prototype)

export class Database {

  constructor(opts) {
    this.db = redis.createClient(opts)
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.db.flushdbAsync()
        .then(() => resolve(true))
    })
  }

  addSettings(settings) {
    return new Promise((resolve, reject) => {
      this.db.hmsetAsync('settings', settings)
        .then((result) => resolve(result))
    })
  }

  getSettings() {
    return new Promise((resolve, reject) => {
      this.db.hgetallAsync('settings')
        .then((result) => resolve(result))
    })
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
    if (! twitterUserId.match(/^twitterUser:/)) {
      twitterUserId = 'twitterUser:' + twitterUserId
    }
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

  setUserLocations(userId, locations) {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  getUserLocations(userId) {
    return new Promise((resolve, reject) => {
      resolve([1,2,3])
    })
  }
}
