import { Database } from '../src/server/db'
import { ok, equal, deepEqual } from 'assert'
import { StreamLoader, StreamLoaderController } from '../src/server/stream-loader'

let db = new Database({redis: {db: 9}})
let user = null
let search = null
let query = null

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
    loader.start()

    setTimeout(() => {
      db.startStream(search, '123')
    }, 1000)

    setTimeout(async () => {
      // get the latest search object that has searchJobs in it
      // the one we have is from before the stream started will not have it
      search = await db.getSearch(search.id)
      await db.stopStream(search)
    }, 10000)

    setTimeout(() => {
      loader.stop()
      done()
    }, 15000)
  })

  it('should have saved tweets', (done) => {
    setTimeout(async () => {

      // stopping the stream above closes the db so we need to reopen
      db = new Database({redis: {db: 9}})

      const tweets = await db.getTweets(search)
      ok(tweets.length > 0, 'streamed tweets were saved')

      done()
    }, 5000)
  })

  it('should have created a SearchJob', (done) => {
    setTimeout(async () => {
      const q = await db.getQuery(query.id)

      ok(q, 'found query')
      ok(q.searchJobs, 'search jobs is defined')
      ok(q.searchJobs.length == 1, 'the query should have one search job')

      const job = q.searchJobs[0]
      ok(job.started, 'job started is set')
      ok(job.ended, 'job ended is set')
      ok(job.tweetId, 'job tweet id is set')

      done()
    }, 6000)
  })

  it('db should close', async () => {
    await db.close()
  })

})
