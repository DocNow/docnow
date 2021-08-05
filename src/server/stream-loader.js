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

  startStream(searchId, tweetId) {
    this.redis.rpush(START_STREAM, JSON.stringify({searchId, tweetId}))
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
      const result = await this.redisBlocking.blpopAsync(START_STREAM, 10)
      if (result) {
        const info = JSON.parse(result[1])
        this.startStream(info.searchId, info.tweetId)
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

  async startStream(searchId, tweetId) {
    log.info(`starting stream search ${searchId}`)

    const search = await this.db.getSearch(searchId)
    const query = search.queries[search.queries.length - 1]
    const job = await this.db.createSearchJob({
      queryId: query.id, 
      tweetId: tweetId,
      started: new Date()
    })

    const user = search.creator
    const track = query.trackQuery()

    const t = await this.db.getTwitterClientForUser(user)

    let tweets = []
    let lastUpdate = new Date()
    let totalTweets = 0

    this.activeStreams.add(String(searchId))

    t.filter({track: track}, async tweet => {
      tweets.push(tweet)

      if (! (this.active === true && this.activeStreams.has(String(searchId)))) {
        log.info(`stream for search ${searchId} has been closed`)
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
        } else if (await this.db.userOverQuota(updatedUser)) {
          log.info(`user is over quota ${updatedUser.twitterScreenName}`)
          this.stopStream(searchId)
          return false
        }

        await this.db.loadTweets(search, tweets)

        totalTweets += tweets.length
        await this.db.updateSearchJob({
          id: job.id,
          tweets: totalTweets
        })

        tweets = []
        lastUpdate = new Date()
      }

      return true
    })

  }

  async stopStream(searchId) {
    log.info(`stopping stream for search ${searchId}`)
    const search = await this.db.getSearch(searchId)
    this.db.updateSearch({...search, active: false, archived: false})

    const query = search.queries[search.queries.length - 1]

    // need a better way to identify the search job that needs to 
    // be ended but for now just mark any search job that has no 
    // ended time. once we can do historical collection it will be 
    // important to only end the filter stream job

    for (const job of query.searchJobs) {
      if (! job.ended) {
        await this.db.updateSearchJob({
          id: job.id,
          ended: new Date()
        })
      }
    }

    this.activeStreams.delete(String(searchId))
  }

}
