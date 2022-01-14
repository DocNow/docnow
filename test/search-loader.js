import { Database } from '../src/server/db'
import { ok, equal } from 'assert'
import { SearchLoader } from '../src/server/search-loader'
import { timer } from '../src/server/utils'

let db = new Database({redis: {db: 9}})
let user = null
let search = null
let query = null

describe('search-loader', () => {

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
      title: 'Search Test',
      description: 'This is a test search!',
      active: true,
      queries: [
        {
          value: {
            or: [
              {
                type: 'keyword',
                value: 'music'
              }
            ],
            startDate: '2008-12-31',
            limit: 200
          }
        }
      ]
    })

    const tweets = await db.getTweets(search)
    equal(tweets.length, 0, 'search has no tweets')

    query = search.queries[0]
    ok(query.id, 'query id is set')

  })

  it('should load historical tweets', async () => {

    // start the search loader
    const loader = new SearchLoader(db)
    loader.start()

    // flag our search as starting
    await timer(1000)
    db.startSearch(search, '123')

    // wait 10 seconds for the search loader to load some tweets
    await timer(10000)

    // ensure we have the latest search object with search jobs
    search = await db.getSearch(search.id)

    // stop the search 
    await db.stopSearch(search)

    // stop the search loader
    await loader.stop()
  })

  /*
  it('should get saved tweets', async () => {
    await timer(5000)

    // stopping the stream above closes the db so we need to reopen
    db = new Database({redis: {db: 9}})

    const tweets = await db.getTweets(search)
    ok(tweets.length > 0, 'historical tweets were saved')
  })
  */

  it('should have created a SearchJob', async () => {
    await timer(6000)
    const q = await db.getQuery(query.id)

    ok(q, 'found query')
    ok(q.searchJobs, 'search jobs is defined')
    equal(q.searchJobs.length, 1, 'the query should have one search job')

    const job = q.searchJobs[0]
    ok(job.started, 'job started is set')
    ok(job.ended, 'job ended is set')
    ok(job.tweetId, 'job tweet id is set')
  })

  it('db should close', () => {
    db.close()
  })

})
