import log from './logger'
import { timer } from './utils'
import { Database } from './db'
import { fetchVideoKey } from './redis'

/*
 * VideoFetcher looks up MP4 URLs for video tweets.
 */

export class VideoFetcher {

  constructor(db = null) {
    this.db = db || new Database()
    this.redisBlocking = this.db.redis.duplicate()
    this.twtr = null
    this.active = false
  }

  async start() {
    log.info(`starting VideoFetcher`)

    await this.setupTwitterClient()
    this.active = true 

    while (this.active) {

      // get a search job from queue and make sure it hasn't been stopped
      const job = await this.fetchJob()
      if (job) {
        //  hydrate tweet and insert video info into the tweet_url table
      }

      await timer(3000)
    }

    log.info(`VideoFetcher event loop stopping`)
  }

  async fetchJob() {
    // wait up to 30 seconds for a new job
    const item = await this.redisBlocking.blpopAsync(fetchVideoKey, 30)
    if (item) {
      return JSON.parse(item[1])
    } else {
      return null
    }
  }

  async stop() {
    this.active = false
    this.db.close()
    this.redisBlocking.quit()
    log.info(`stopping VideoFetcher`)
  }

  async setupTwitterClient() {
     while (this.twtr === null) {
      log.info('video-fetcher attempting to get twitter client')
      this.twtr = await this.db.getTwitterClientForApp()
      if (! this.twtr) {
        await timer(20000)
      } else {
        log.info('video-fetcher got twitter client!')
      }
    }
  }

}
