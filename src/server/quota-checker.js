import log from './logger'
import { Database } from './db'

/*
 * QuotaChecker monitors active searches and stops them if the user 
 * is over their quota, if the search is over its defined limit,
 * or if the stream should be stopped because it is past its end
 * date.
 */

export class QuotaChecker {

  constructor() {
    this.db = new Database()
    log.info(`created database connection: ${this.db}`)
    this.started = false
  }

  async start() {
    log.info(`starting QuotaChecker`)
    this.started = true
    this.timeId = setInterval(this.check.bind(this), 10 * 1000)
  }

  async check() {
    for (const search of await this.db.getActiveSearches()) {

      // is the user over their quota?
      const user = search.creator
      if (await this.db.userOverQuota(user)) {
        log.info(`user ${user.id} is over quota, stopping ${search.id}`)
        await this.db.stopStream(search)
        await this.db.stopSearch(search)
      } 

      // is the search over its limit?
      const lastQuery = search.queries[search.queries.length - 1]
      if (lastQuery.value.limit && search.tweetCount > lastQuery.value.limit) {
        log.info(`search ${search.id} exceeded its limit ${lastQuery.value.limit}`)
        await this.db.stopStream(search)
        await this.db.stopSearch(search)
      }

      // check if the search should stop streaming?
      const now = new Date()
      for (const job of lastQuery.searchJobs) {
        if (job.type === 'stream' && ! job.ended && now > new Date(job.tweetsEnd)) {
          log.info(`stopping stream for ${search.id} since it is past its end time`)
          await this.db.stopStream(search)
        }
      }
    }
  }

  async stop() {
    log.info('stopping QuotaChecker')
    clearInterval(this.timerId)
    this.started = false
    this.db.close()
  }

}
