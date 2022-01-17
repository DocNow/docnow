import log from './logger'
import { timer } from './utils'
import { Database } from './db'

/*
 * StreamLoader connects to the filter stream and writes any new tweets 
 * it receives to the database using the associated search id.
 */

export class StreamLoader {

  constructor(db = null) {
    this.db = db || new Database()
    this.twtr = null
  }

  async start() {
   
    // twtr will be our twitter client but we need to wait for it to be come
    // available. when the application first starts up it doesn't have keys yet,
    // so attempting to connect to the filter stream will fail.

    while (this.twtr === null) {
      log.info('attempting to get twitter client')
      this.twtr = await this.db.getTwitterClientForApp()
      if (! this.twtr) {
        await timer(20000)
      } else {
        log.info('got twitter client!')
      }
    }

    // flag to indicate data is loading
    let isLoading = false

    // accumulate tweets to be loaded by search id
    let tweets = new Map()

    // keep a track of how many tweets are waiting to load
    let totalTweets = 0

    // keep track of when tweets were last loaded
    let lastUpdate = new Date()

    // start the filter stream and give it a call back that will receive 
    // a tweet and any tags that the tweet matches

    this.twtr.filter(async (tweet, tags) => {
      totalTweets += 1

      if (! this.twtr) {
        return false
      }

      // unpack search ids from the tags and add the tweet to the appropriate searches
      // a tweet could be added to multiple searches
      for (const tag of tags) {
        // guard against tags that aren't from the docnow app
        if (tag.match(/^search-\d+/)) {
          const searchId = tag.split('-')[1]
          if (! tweets.has(searchId)) {
            tweets.set(searchId, [])
          }
          tweets.get(searchId).push(tweet)
        }
      }

      // load the tweets as long as an update isn't underway and either there are 
      // more than 100 tweets to load, or there are some tweets to load and more 
      // than 5 seconds have passed since the last load

      const elapsed = new Date() - lastUpdate
      if (! isLoading && (totalTweets >= 100 || (totalTweets > 0 && elapsed > 5000))) {
        isLoading = true

        for (const [searchId, searchTweets] of tweets.entries()) {
          await this.db.loadTweets({id: searchId}, searchTweets)
        }

        // reset these so we can collect more tweets to insert
        tweets = new Map()
        totalTweets = 0
        lastUpdate = new Date()
        isLoading = false
      }

      return true
    })

  }

  async stop() {
    log.info('stopping StreamLoader')
    await this.db.close()
    await this.twtr.closeFilter()
  }

}
