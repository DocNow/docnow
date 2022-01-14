import log from './logger'
import { timer } from './utils'
import { Database } from './db'
import { startSearchJobKey, stopSearchJobKey } from './redis'

/*
 * SearchLoader connects will fetch search jobs from the queue and run them.
 */

export class SearchLoader {

  constructor(db = null) {
    this.db = db || new Database()
    this.twtr = null
    this.active = false
    this.stopSearches = new Set()
  }

  async start() {
    log.info(`starting SearchLoader`)
    await this.setupTwitterClient()
    this.active = True
    
    while (this.active) {

      // get a search job from queue
      const job = await this.fetchSearchJob()
      if (job) {

        const query = job.query

        this.twtr.search({
          q: q,
          startDate: job.startDate,
          endDate: job.endDate,
          nextToken: job.nextToken
        }, async (err, results) => {

    /*
    // flag the search as active or running
    await this.updateSearch({id: search.id, active: true})

    // determine the query to run
    const lastQuery = search.queries[search.queries.length - 1]
    const q = lastQuery.twitterQuery()

    // run the search!
    let maxTweetId = null
    let count = 0
    return new Promise((resolve, reject) => {
      twtr.search({q: q, sinceId: search.maxTweetId, count: maxTweets}, async (err, results) => {
        if (err) {
          log.error(`caught error during search: ${err}`)
          reject(err)
        } else if (results.length === 0) {
          await this.updateSearch({
            id: search.id,
            maxTweetId: maxTweetId,
            active: false
          })
          log.info(`no more search results, returning ${count}`)
          resolve(count)
        } else {
          if (maxTweetId === null) {
            maxTweetId = results[0].id
          }
          await this.loadTweets(search, results)
          count += results.length
          log.info(`bulk loaded ${results.length} tweets, with total=${count}`)
        }
      })
    })
    */
         
        // load the tweets
        if (this.stopSearches.has(job.id)) {
          this.stopSearches.delete(job.id)
        } else {
          await timer(1000)

          this.redis.lpushAsync(startSearchJobKey, job.id)
          // queue next job
        }
      }

      // drain all the stop search job ids
      while (true) {
        const jobId = await this.fetchStopSearchJob()
        if (jobId === null) {
          break
        } else {
          this.stopSearches.add(jobId)
        }
      }

    }

    log.info(`SearchLoader event loop stopping`)
  }

  async fetchSearchJob() {
    // wait up to 30 seconds for a new job
    let job = null
    const item = await this.redisBlocking.blpopAsync(startSearchJobKey, 30)
    if (item) {
      const info = JSON.parse(item[1])
      job = await this.db.getSearchJob(info.jobId)
      job.nextToken = info.nextToken
    }
    return job
  }

  async fetchStopSearchJob() {
    let jobId = null
    const item = await this.redis.lpopAsync(stopSearchJobKey)
    if (item) {
      jobId = parseInt(item[1], 10)
    }
    return jobId
  }

  async stop() {
    this.active = false
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
