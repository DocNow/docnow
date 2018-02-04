import log from './logger'
import { Database } from './db'
import { getRedis } from './redis'

const START_STREAM = 'start-stream'
const STOP_STREAM = 'stop-stream'


/*
 * TweetLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

export class TweetLoaderController {

  constructor() {
    this.redis = getRedis()
  }

  stop() {
    log.info('stopping TweetLoaderController')
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
 * TweetLoader will listen to a queue of commands to start streaming
 * jobs and will subscribe for messages to stop those jobs. The queue is
 * used to make sure only one worker picks up the streaming job. the
 * pub/sub channel is used to notify all workers to stop the stream
 * since we don't really know which worker picked it up.
 */

export class TweetLoader {

  constructor(db = null, concurrency = 5) {
    this.concurrency = concurrency
    this.active = false
    this.streams = {}
    this.db = db || new Database()
    this.redis = getRedis()
    this.redisBlocking = this.redis.duplicate()
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
    log.info('stopping TweetLoader')
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

    const user = await this.db.getUser(search.creator)
    if (! user) {
      log.error('unable to find user for ' + search.creator)
      return
    }

    const t = await this.db.getTwitterClientForUser(user)
    const track = search.query.map((term) => {return term.value}).join(',')

    t.filter({track: track}, (tweet) => {
      log.info('got tweet', {text: tweet.text})
      return this.active
    })

  }

  stopStream(searchId) {
    log.info('stopping stream', {searchId})
  }

}
