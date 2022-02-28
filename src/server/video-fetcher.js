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
    this.twtr = null
    this.active = false
  }

  async start() {
    log.info(`starting VideoFetcher`)

    await this.setupTwitterClient()
    this.active = true 

    while (this.active) {

      // get a search job from queue and make sure it hasn't been stopped
      const jobs = await this.fetchJobs()

      // note: lookup mediaIds before hydrating to reduce duplication?
      if (jobs.length > 0) {
        const tweetIds = Array.from(new Set(jobs.map(j => j.tweetId)))
        const tweets = await this.twtr.hydrate(tweetIds)
        // note: catch api quota exceeded errors here, and increment timer
        if (tweets) {
          const urlRows = []
          for (const tweet of tweets) {
            for (const job of jobs) {
              if (job.tweetId == tweet.id) {
                const videoUrl = this.getVideoUrl(tweet)
                if (videoUrl) {
                  urlRows.push({
                    tweetId: job.tweetRowId,
                    url: videoUrl.url,
                    thumbnailUrl: videoUrl.thumbnailUrl,
                    type: 'video',
                    mediaId: job.mediaId
                  })
                }
              }
            }
          }
          if (urlRows.length > 0) {
            await this.db.insertUrls(urlRows)
          }
        }
      }

      // v1 status/lookup endpoint can take 300 req / 15 minutes 
      // which is 1 every 3 seconds we play it safe with 5 seconds 
      // wait between requests
      await timer(5000)
    }

    log.info(`VideoFetcher event loop stopping`)
  }

  async fetchJobs() {
    // get up to 100 tweet video lookups
    const item = await this.db.redis.lpopAsync(fetchVideoKey, 100)
    if (item) {
      return item.map(s => JSON.parse(s))
    } else {
      return []
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

  getVideoUrl(tweet) {
    if (tweet.extended_entities && tweet.extended_entities.media) {
      for (const media of tweet.extended_entities.media) {
        if (media.video_info && media.video_info.variants) {
          for (const variant of media.video_info.variants) {
            // note: maybe should pick video with highest bitrate?
            if (variant.content_type == 'video/mp4') {
              return {
                url: variant.url,
                thumbnailUrl: media.media_url_https
              }
            }
          }
        }
      }
    }
    return null
  }

}
