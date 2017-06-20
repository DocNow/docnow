import redis from 'redis'
import uuid from 'uuid/v4'
import bluebird from 'bluebird'

bluebird.promisifyAll(redis.RedisClient.prototype)

export class Database {

  constructor(opts) {
    this.db = redis.createClient(opts)
  }

  clear(cb) {
    this.db.flushdb((err, result) => {
      if (err) {
        console.log(err)
      } else {
        cb(result)
      }
    })
  }

  addSettings(settings, cb) {
    this.db.hmset('settings', settings, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        cb(result)
      }
    })
  }

  getSettings(cb) {
    this.db.hgetall('settings', (err, result) => {
      if (err) {
        console.log(err)
      } else {
        cb(result)
      }
    })
  }

  addUser(user, cb) {
    const userId = 'user:' + uuid()
    const newUser = {...user, id: userId}
    this.db.hmset(userId, newUser, (err, result) => {
      const twitterId = 'twitterUser:' + user.twitterUserId
      this.db.set(twitterId, userId, (err, result) => {
        cb(userId)
      })
    })
  }

  getUser(userId, cb) {
    this.db.hgetall(userId, (err, result) => {
      if (err) {
        console.log(err)
      } else if (result) {
        cb(result)
      } else {
        cb(null)
      }
    })
  }

  getUserByTwitterUserId(twitterUserId, cb) {
    if (! twitterUserId.match(/^twitterUser:/)) {
      twitterUserId = 'twitterUser:' + twitterUserId
    }
    this.db.get(twitterUserId, (err, result) => {
      if (err) {
        console.log(err)
      } else if (result) {
        this.getUser(result, cb)
      } else {
        cb(null)
      }
    })
  }
}
