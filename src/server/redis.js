import redis from 'redis'
import bluebird from 'bluebird'
import log from './logger'

bluebird.promisifyAll(redis.RedisClient.prototype)

const env = process.env.NODE_ENV

export default function getRedis(opts = {}) {
  if (env === 'production') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 1
  } else if (env === 'test') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 9
  } else if (env === 'development') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 1
  }
  log.info('connecting to redis: ', opts)
  return redis.createClient(opts)
}
