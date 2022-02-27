import redis from 'redis'
import bluebird from 'bluebird'
import log from './logger'

bluebird.promisifyAll(redis.RedisClient.prototype)

const env = process.env.NODE_ENV

export function getRedis(opts = {}) {
  if (env === 'production') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 0
  } else if (env === 'test') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 9
  } else if (env === 'development') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1'
    opts.db = 0
  }
  log.info('connecting to redis: ', opts)
  return redis.createClient(opts)
}

// Functions to help construct redis keys consistently.

// url to url mappings
export const urlKey = (url) => `url:${url}`

// url metadata
export const metadataKey = (url) => `metadata:${url}`

// a search's sorted set of url counts
export const urlsKey = (search) => `urls:${search.id}`

// the number of urls yet to be fetched for a search
export const queueCountKey = (search) => `queue:${search.id}`

// the total number of urls to be checked in a search
export const urlsCountKey = (search) => `urlscount:${search.id}`

// the set of tweet ids that mention a url in a search
export const tweetsKey = (search, url) => `tweets:${url}:${search.id}`

// the selected urls in a search
export const selectedUrlsKey = (search) => `urlsselected:${search.id}`

// the deselected urls in a search
export const deselectedUrlsKey = (search) => `urlsdeselected:${search.id}`

// metadata for wayback information for a url
export const waybackKey = (url) => `wayback:${url}`

// total number of tweets by user
export const userTweetsCountKey = (user) => `usertweetcount:${user.id}`

// a json blob of stats for a search
export const searchStatsKey = (search) => `searchstats:${search.id}` 

// a queue for search jobs to run
export const startSearchJobKey = `searchjob`

// a queue for video lookups
export const fetchVideoKey = 'videoqueue'
