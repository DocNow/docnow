import log from './logger'
import { Database } from './db'

/*
 * QuotaChecker monitors active searches and stops them if the user 
 * is over their quota.
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
      const user = search.creator
      if (await this.db.userOverQuota(user)) {
        log.info(`user ${user.id} is over quota, stopping ${search.id}`)
        this.db.stopStream(search)
      } 
    }
  } 

  async stop() {
    log.info('stopping QuotaChecker')
    clearInterval(this.timerId)
    this.started = false
    await this.db.close()
  }

}