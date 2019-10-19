import metaweb from 'metaweb'
import log from './logger'

import {
  getRedis,
  urlKey,
  metadataKey,
  urlsKey,
  queueCountKey,
  urlsCountKey,
  tweetsKey,
  selectedUrlsKey,
  deselectedUrlsKey,
  waybackKey
} from './redis'

export class UrlFetcher {

  constructor(concurrency = 5) {
    this.concurrency = concurrency
    this.redis = getRedis()
    this.redisBlocking = this.redis.duplicate()
    this.active = false
  }

  async start() {
    this.active = true
    while (this.active) {
      const promises = []
      for (let i = 0; i < this.concurrency; i++) {
        promises.push(this.fetchJob())
      }
      log.info('waiting to process ' + this.concurrency + ' urls')
      await Promise.all(promises)
    }
    return true
  }

  async stop() {
    this.active = false
    await this.redis.quit()
    await this.redisBlocking.quit()
  }

  add(search, url, tweetId) {
    if (this.redis.connected) {
      const job = {search, url, tweetId}
      this.incrSearchQueue(search)
      this.incrUrlsCount(search)
      return this.redis.lpushAsync('urlqueue', JSON.stringify(job))
    }
  }

  async fetchJob() {
    // wait 10 seconds for a new job
    let result = null
    const item = await this.redisBlocking.blpopAsync('urlqueue', 10)
    if (item) {
      const job = JSON.parse(item[1])
      log.info('got job', job)
      result = await this.processJob(job)
    }
    return result
  }

  async processJob(job) {

    // see if we have metadata for this url already. if we don't
    // have it got out to the web to fetch it

    let metadata = await this.getMetadata(job.url)
    if (metadata) {
      log.info('found cached metadata', job.url)
    } else {
      log.info('looking up url', job.url)
      try {
        metadata = await metaweb.get(job.url)
        if (metadata) {

          // use the canonical url if it is present
          metadata.url = metadata.canonical || metadata.url
          delete metadata.canonical

          await this.saveMetadata(job, metadata)
        }
      } catch (error) {
        log.error(`metaweb.get error for ${job.url}`, error.message)
      }
    }

    if (metadata) {
      await this.tally(job, metadata)
    }

    this.decrSearchQueue(job.search)
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
    const url = metadata.url

    // key/value lookups for determining the url that
    // metadata is stored under

    await this.redis.setAsync(urlKey(job.url), url)
    await this.redis.setAsync(urlKey(url), url)

    // save the metadata

    await this.redis.setAsync(
      metadataKey(url),
      JSON.stringify(metadata)
    )
  }

  async tally(job, metadata) {
    // increment the number of times we've seen the url in this search
    await this.redis.zincrbyAsync(urlsKey(job.search), 1, metadata.url)
    // remember the tweet
    await this.redis.saddAsync(tweetsKey(job.search, metadata.url), job.tweetId)
  }

  async queueStats(search) {
    const total = await this.redis.getAsync(urlsCountKey(search))
    const remaining = await this.redis.getAsync(queueCountKey(search))
    return {
      total: parseInt(total, 10),
      remaining: parseInt(remaining, 10)
    }
  }

  incrUrlsCount(search) {
    return this.redis.incrAsync(urlsCountKey(search))
  }

  incrSearchQueue(search) {
    return this.redis.incrAsync(queueCountKey(search))
  }

  decrSearchQueue(search) {
    return this.redis.decrAsync(queueCountKey(search))
  }

  async getWebpages(search, start = 0, limit = 100) {
    const key = urlsKey(search)

    const urlCounts = await this.redis.zrevrangeAsync(key, start, start + limit, 'withscores')
    const selected = await this.redis.smembersAsync(selectedUrlsKey(search))
    const deselected = await this.redis.smembersAsync(deselectedUrlsKey(search))

    const counts = {}
    const commands = []
    for (let i = 0; i < urlCounts.length; i += 2) {
      const url = urlCounts[i]
      const count = parseInt(urlCounts[i + 1], 10)
      counts[url] = count
      commands.push(['get', metadataKey(url)])
      commands.push(['get', waybackKey(url)])
    }

    // redis does not have a multiAsync command so we return a Promise
    // that will execute all the metadata gets and then build up a list
    // of webpage metadata annotated with the counts we collected above

    return new Promise((resolve) => {
      this.redis.multi(commands).exec((err, results) => {
        const webpages = []
        for (let i = 0; i < results.length; i += 2) {
          const metadata = JSON.parse(results[i])
          metadata.count = counts[metadata.url]
          metadata.selected = selected.indexOf(metadata.url) >= 0
          metadata.deselected = deselected.indexOf(metadata.url) >= 0
          metadata.archive = JSON.parse(results[i + 1])

          webpages.push(metadata)
        }
        resolve(webpages)
      })
    })

  }

  async getWebpage(search, url) {
    const json = await this.redis.getAsync(metadataKey(url))
    const metadata = JSON.parse(json)

    metadata.count = await this.redis.zscoreAsync(urlsKey(search), url)

    const selected = await this.redis.smembersAsync(selectedUrlsKey(search))
    metadata.selected = selected.indexOf(url) >= 0

    const deselected = await this.redis.smembersAsync(deselectedUrlsKey(search))
    metadata.deselected = deselected.indexOf(url) >= 0

    metadata.archive = JSON.parse(await this.redis.getAsync(waybackKey(url)))

    return metadata
  }

  async selectWebpage(search, url) {
    await this.redis.sremAsync(deselectedUrlsKey(search), url)
    return this.redis.saddAsync(selectedUrlsKey(search), url)
  }

  async deselectWebpage(search, url) {
    await this.redis.sremAsync(selectedUrlsKey(search), url)
    return this.redis.saddAsync(deselectedUrlsKey(search), url)
  }

  getTweetIdentifiers(search, url) {
    return this.redis.smembersAsync(tweetsKey(search, url))
  }

}
