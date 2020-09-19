import log from './logger'
import { Database } from './db'
import { getRedis } from './redis'

const START_STREAM = 'start-stream'
const STOP_STREAM = 'stop-stream'


/*
 * StreamLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

export class StreamLoaderController {

  constructor() {
    this.redis = getRedis()
  }

  stop() {
    log.info('stopping StreamLoaderController')
    this.redis.quit()
  }

  startStream(searchId) {
    this.redis.rpush(START_STREAM, searchId)
  }

  stopStream(searchId) {
    this.redis.publish(STOP_STREAM, searchId)
  }

}


/*
 * StreamLoader will listen to a queue of commands to start streaming
 * jobs and will subscribe for messages to stop those jobs. The queue is
 * used to make sure only one worker picks up the streaming job. the
 * pub/sub channel is used to notify all workers to stop the stream
 * since we don't really know which worker picked it up.
 */

export class StreamLoader {

  constructor(db = null, concurrency = 5) {
    this.concurrency = concurrency
    this.db = db || new Database()
    this.redis = getRedis()
    this.redisBlocking = this.redis.duplicate()
    this.active = false
    this.activeStreams = new Set()
  }

  async start() {

    this.redis.subscribe(STOP_STREAM)

    this.redis.on('message', (channel, searchId) => {
      this.stopStream(searchId)
    })

    this.redis.on('disconnect', () => {
      this.stop()
    })

    this.active = true
    while (this.active) {
      const item = await this.redisBlocking.blpopAsync(START_STREAM, 10)
      if (item) {
        this.startStream(item[1])
      }
    }
  }

  stop() {
    this.active = false
    log.info('stopping StreamLoader')
    this.redis.quit()
    this.redisBlocking.quit()
    this.db.close()
  }

  async startStream(searchId) {
    log.info('starting stream', {searchId})

    const search = await this.db.getSearch(searchId)
    if (! search) {
      log.error('unable to find search for ' + searchId)
      return
    }

    const user = search.creator
    const t = await this.db.getTwitterClientForUser(user)

    const lastQuery = search.queries[search.queries.length - 1]
    const track = lastQuery.trackQuery()
    let tweets = []

    this.activeStreams.add(searchId)

    let lastUpdate = new Date()

    t.filter({track: track}, async tweet => {
      tweets.push(tweet)

      if (! (this.active === true && this.activeStreams.has(searchId))) {
        log.info('stream for ' + searchId + ' has been closed')
        return false
      }

      const elapsed = new Date() - lastUpdate

      if (tweets.length >= 100 || (tweets.length > 0 && elapsed > 5000)) {

        // make sure we can continue to load tweets for this user
        const updatedUser = await this.db.getUser(user.id)
        if (! updatedUser.active) {
          log.info(`user is not active: ${updatedUser.twitterScreenName}`)
          this.stopStream(searchId)
          return false
        } else if (await this.db.userOverQuota(user)) {
          log.info(`user is over quota ${updatedUser.twitterScreenName}`)
          this.stopStream(searchId)
          return false
        }

        const numTweets = tweets.length
        this.db.loadTweets(search, tweets).then(() => {
          log.info('loaded ' + numTweets + ' tweets for ' + search.id)
        }).catch(e => {
          log.error(`error during stream loading: ${e}`)
        })
        tweets = []
        lastUpdate = new Date()
      }

      return true
    })

  }

  async stopStream(searchId) {
    log.info('stopping stream', {searchId})
    const search = await this.db.getSearch(searchId)
    this.db.updateSearch({...search, active: false, archived: false})
    this.activeStreams.delete(searchId)
  }

}
