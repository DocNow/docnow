import { Database } from '../src/server/db'
import { ok, equal } from 'assert'
import { SearchLoader } from '../src/server/search-loader'
import { timer } from '../src/server/utils'
import moment from 'moment'

const db = new Database({redis: {db: 9}})
let user = null
let search = null
let query = null
let loader = null

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

    const now = moment()
    const start = moment().subtract(4, 'days').toDate()
    const end  = moment().subtract(2, 'days').toDate()

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
            startDate: start,
            endDate: end,
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
    loader = new SearchLoader(db)
    loader.start()

    // flag our search as starting
    await timer(1000)
    const job = await db.startSearch(search, '123')
    ok(job, 'startSearch returned a job')
    ok(job.id, 'job.id is set')

    // wait 10 seconds for the search loader to load some tweets
    await timer(10000)

    // ensure we have the latest search object with search jobs
    search = await db.getSearch(search.id)

    // stop the search 
    await db.stopSearch(search)
  })

  it('should get saved tweets', async () => {
    const tweets = await db.getTweets(search)
    ok(tweets.length > 0, 'historical tweets were saved')
  })

  it('should have created a SearchJob', async () => {
    const q = await db.getQuery(query.id)

    ok(q, 'found query')
    ok(q.searchJobs, 'search jobs is defined')
    equal(q.searchJobs.length, 1, 'the query should have one search job')

    const job = q.searchJobs[0]
    ok(job.started, 'job started is set')
    ok(job.ended, 'job ended is set')
    ok(job.tweetId, 'job tweet id is set')
  })

  it('db should close', async () => {
    await loader.stop()
  })

})
