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

      // get a search job from queue and make sure it hasn't been stopped
      const job = await this.fetchSearchJob()
      if (job && job.ended === null && job.query.search.active) {

        // Twitter requires sleeping at least a second between searches
        // sleeping only 1 second seems to trigger errors, so lets sleep 2 
        await timer(2000)

        const opts = {
          q: job.query.twitterQuery(),
          all: true,
          once: true
        }

        if (job.query.value.startDate) {
          opts.startDate = job.query.value.StartDate
        }

        if (job.query.value.endDate) {
          opts.endDate = job.query.value.endDate
        }

        if (job.nextToken) {
          opts.nextToken = job.nextToken
        }

        this.twtr.search(opts, async (err, tweets, nextToken) => {

          if (err) {
            log.error(err)
            return
          }

          if (tweets == 0) {
            return
          }

          // this callback could get called after the searchloader is no longer 
          // active, so make sure it's still running
          
          if (this.active) {

            await this.db.loadTweets(job.query.search, tweets)

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
              log.info(`no more search results for search job ${job.id}`)
              await this.db.updateSearchJob({
                id: job.id,
                ended: new Date()
              })
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
