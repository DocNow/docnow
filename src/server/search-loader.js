import log from './logger'
import { timer } from './utils'
import { Database } from './db'
import { startSearchJobKey } from './redis'

/*
 * SearchLoader connects will fetch search jobs from the queue and run them.
 */

export class SearchLoader {

  constructor(db = null) {
    this.db = db || new Database()
    this.redisBlocking = this.db.redis.duplicate()
    this.twtr = null
    this.active = false
  }

  async start() {
    log.info(`starting SearchLoader`)
    await this.setupTwitterClient()
    this.active = true 

    while (this.active) {
      const job = await this.fetchSearchJob()
      if (job && job.ended === null && job.query.search.active) {
        // https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-all
        await timer(3000)

        const opts = {
          q: job.query.twitterQuery(),
          all: true,
          once: true
        }

        if (job.tweetsStart) {
          opts.startDate = job.tweetsStart
        }
        if (job.tweetsEnd) {
          opts.endDate = job.tweetsEnd
        }
        if (job.nextToken) {
          opts.nextToken = job.nextToken
        }

        this.twtr.search(opts, async (err, tweets, nextToken) => {
          if (err && err.match(/ECONNRESET/)) {
            log.error(`caught ECONNRESET: ${err}`)
            log.info(`requeueing ${job.id}`)
            this.db.redis.lpushAsync(startSearchJobKey, job.id)
          } else if (err) {
            log.error(`unexpected error for ${job.id} stopping`)
            this.stopJob(job)
          } else if (this.active) {
            // tweets can sometimes be empty even when nextToken is present
            if (tweets.length > 0) {
              await this.db.loadTweets(job.query.search, tweets)
            }

            // note: we rely on QuotaChecker to notice if this job needs to be
            // stopped because it has hit a limit set in the search. all we care
            // about is whether there are more results to get.

            if (nextToken) {
              log.info(`queueing next search job ${job.id}`)
              await this.db.updateSearchJob({
                id: job.id,
                nextToken: nextToken
              })
              this.db.redis.lpushAsync(startSearchJobKey, job.id)
            } else {
              this.stopJob(job)
            }
          } else {
            log.warn('search loader callback received tweets when no longer active')
          }
          return false
        })
      } else if (job) {
        log.info(`job ${job.id} is no longer active`)
      }
    }
    log.info(`SearchLoader event loop stopping`)
  }

  async fetchSearchJob() {
    // wait up to 30 seconds for a new job
    let job = null
    const item = await this.redisBlocking.blpopAsync(startSearchJobKey, 30)
    if (item) {
      const jobId = parseInt(item[1], 10)
      job = await this.db.getSearchJob(jobId)
    }
    return job
  }

  async stopJob(job) {
    log.info(`no more search results for search job ${job.id}`)
    await this.db.updateSearchJob({
      id: job.id,
      ended: new Date()
    })

    // determine if there's an active stream job for this search
    let activeStream = false
    const query = await this.db.getQuery(job.query.id)
    for (const j of query.searchJobs) {
      if (j.type == 'stream' && ! j.ended) {
        activeStream = true
      }
    }

    // set search to inactive if there's not an active stream
    if (! activeStream) {
      await this.db.updateSearch({
        id: query.search.id,
        active: false
      })
      log.info(`flagging search ${query.search.id} as inactive`)
    }
  }


  async stop() {
    this.active = false
    this.db.close()
    this.redisBlocking.quit()
    log.info(`stopping SearchLoader`)
  }

  async setupTwitterClient() {
     while (this.twtr === null) {
      log.info('attempting to get twitter client')
      this.twtr = await this.db.getTwitterClientForApp()
      if (! this.twtr) {
        await timer(20000)
      } else {
        log.info('got twitter client!')
      }
    }
  }

}
