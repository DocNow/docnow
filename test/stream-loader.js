import { Database } from '../src/server/db'
import { ok, equal, deepEqual } from 'assert'
import { StreamLoader, StreamLoaderController } from '../src/server/stream-loader'

let db = new Database({redis: {db: 9}})
let user = null
let search = null

describe('stream-loader', () => {

  it('should setup', async () => {

    await db.clear()

    await db.addSettings({
      appKey: process.env.CONSUMER_KEY,
      appSecret: process.env.CONSUMER_SECRET,
      defaultTweetQuota: 10000
    })

    user = await db.addUser({
      name: "Ed Summers",
      location: "Silver Spring, MD",
      twitterScreenName: "edsu",
      twitterUserId: "1234",
      active: true,
      twitterAccessToken: process.env.ACCESS_TOKEN,
      twitterAccessTokenSecret: process.env.ACCESS_TOKEN_SECRET
    })

    search = await db.createSearch({
      userId: user.id,
      title: 'Stream Test',
      description: 'This is a test stream!',
      active: true,
      queries: [{value: {or: [{type: 'keyword', value: 'obama'}]}}]
    })

    const tweets = await db.getTweets(search)
    ok(tweets.length === 0, 'search has no tweets')

    query = search.queries[0]
    ok(query.id, 'query id is set')

  })

  it('should load tweets', (done) => {
    const loader = new StreamLoader(db)
    const controller = new StreamLoaderController()

    loader.start()

    setTimeout(() => {
      controller.startStream(search.id)
    }, 1000)

    setTimeout(() => {
      controller.stopStream(search.id)
    }, 10000)

    setTimeout(() => {
      controller.stop()
      loader.stop()
      done()
    }, 15000)
  })

  it('should have saved tweets', (done) => {
    setTimeout(async () => {

      // stopping the stream above closes the db so we need to reopen
      db = new Database({redis: {db: 9}, es: {prefix: 'test'}})

      const tweets = await db.getTweets(search)
      ok(tweets.length > 0, 'streamed tweets were saved')

      db.close()
      done()
    }, 5000)
  })

  it('should have created a SearchJob', (done) => {
    setTimeout(async () => {

      const query = await db.getQuery(queryId)
      ok(query, 'found query')
      ok(query.searchJobs, 'search jobs is defined')
      ok(query.searchJobs.length == 1, 'the query should have one search job')

      const job = query.searchJobs[0]
      ok(job.started, 'job started is set')
      ok(job.ended, 'job ended is set')
      ok(job.tweetId, 'job tweet id is set')
      ok(job.tweets > 0, 'job number of tweets is set')

      db.close()
      done()
    }, 6000)
  })

})