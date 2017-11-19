import getRedis from './redis'
import metaweb from 'metaweb'
import log from './logger'

// helper functions for normalizing redis key names

const urlKey = (url) => {return `url:${url}`}
const metadataKey = (url) => {return `metadata:${url}`}
const searchUrlsKey = (search) => {return `search:urls:${search.id}`}
const searchQueueCount = (job) => {return `search:queue:${job.search.id}`}

export class UrlFetcher {

  constructor(opts = {}) {
    this.redis = getRedis(opts)
    this.redisBlocking = this.redis.duplicate()
    this.active = false
  }

  async start() {
    this.active = true
    while (this.active) {
      await this.fetchJob()
    }
    return true
  }

  stop() {
    this.active = false
    this.redis.quit()
    this.redisBlocking.quit()
  }

  add(search, url) {
    const job = {search, url}
    this.incrSearchQueue(job)
    return this.redis.lpushAsync('urlqueue', JSON.stringify(job))
  }

  async fetchJob() {
    // wait 10 seconds for a new job
    const item = await this.redisBlocking.blpopAsync('urlqueue', 10)
    if (item) {
      const job = JSON.parse(item[1])
      log.info('got job', job)
      this.processJob(job)
    }
    return item
  }

  async processJob(job) {
    let metadata = await this.getMetadata(job.url)

    // first time we've seen the url so get it and save metadata
    if (metadata) {
      log.info('found cached metadata', job.url)
    } else {
      log.info('looking up url', job.url)
      try {
        metadata = await metaweb.get(job.url)
        if (metadata) {
          await this.saveMetadata(job, metadata)
        }
      } catch (error) {
        log.error(`metaweb.get error for ${job.url}`, error.message)
      }
    }

    if (metadata) {
      await this.tally(job, metadata)
    }

    this.decrSearchQueue(job)
    return metadata
  }

  async getMetadata(url) {
    let metadata = null
    const val = await this.redis.getAsync(urlKey(url))
    if (val) {
      const json = await this.redis.getAsync(metadataKey(val))
      if (json) {
        metadata = JSON.parse(json)
      }
    }
    return metadata
  }

  async saveMetadata(job, metadata) {

    // save lookups for urls
    const url = metadata.canonical || metadata.url
    await this.redis.setAsync(urlKey(job.url), url)
    await this.redis.setAsync(urlKey(url), url)

    // save metadata
    await this.redis.setAsync(metadataKey(url), JSON.stringify(metadata))

    return metadata
  }

  async tally(job, metadata) {
    const url = metadata.canonical || metadata.url
    const key = searchUrlsKey(job.search)
    log.info('tallying', key, url)
    await this.redis.zincrbyAsync(key, 1, url)
  }

  incrSearchQueue(job) {
    this.redis.incr(searchQueueCount(job))
  }

  decrSearchQueue(job) {
    this.redis.decr(searchQueueCount(job))
  }

  async getWebPages(search, start = 0, limit = 100) {
    const key = searchUrlsKey(search)

    // get the list of urls and their counts while building up
    // a list of redis commands to get metadata for the urls

    const counts = {}
    const commands = []
    const urlCounts = await this.redis.zrevrangeAsync(key, start, limit, 'withscores')
    for (let i = 0; i < urlCounts.length; i += 2) {
      const url = urlCounts[i]
      const count = urlCounts[i + 1]
      counts[url] = count
      commands.push(['get', metadataKey(url)])
    }

    // redis does not have a multiAsync command so we return a Promise
    // that will execute all the metadata gets and then build up a list
    // of webpage metadata annotated with the counts we collected above

    return new Promise((resolve) => {
      this.redis.multi(commands).exec((err, urlMetadata) => {
        const webpages = []
        for (const json of urlMetadata) {
          const metadata = JSON.parse(json)
          metadata.count = counts[metadata.url]
          webpages.push(metadata)
        }
        resolve(webpages)
      })
    })

  }

}
