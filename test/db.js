import { ok, equal, deepEqual } from 'assert'
import { Database } from '../src/server/db'
import { timer } from '../src/server/utils'

const db = new Database({redis: {db: 9}})

describe('database', () => {

  let testUser = null
  let testSearch = null
  let testVideoSearch = null

  it('should clear', (done) => {
    db.clear().then(done)
  })

  it('should add settings', (done) => {
    db.addSettings({
      appKey: process.env.CONSUMER_KEY,
      appSecret: process.env.CONSUMER_SECRET
    })
    .then(done())
  })

  it('should get settings', (done) => {
    setTimeout(() => {
      db.getSettings().then((settings) => {
        equal(settings.appKey, process.env.CONSUMER_KEY)
        equal(settings.appSecret, process.env.CONSUMER_SECRET)
        done()
      })
    }, 2000)
  })

  it('should add user', async () => {
    const user = {
      name: "Ed Summers",
      location: "Silver Spring, MD",
      twitterScreenName: "edsu",
      twitterUserId: "1234",
      twitterAccessToken: process.env.ACCESS_TOKEN,
      twitterAccessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      tweetQuota: 50000,
    }
    const newUser = await db.addUser(user)
    testUser = newUser
  })

  it('should get user by id', async () => {
    const user = await db.getUser(testUser.id)
    equal(user.id, testUser.id)
    equal(user.name, 'Ed Summers')
    equal(user.twitterScreenName, 'edsu')
    equal(user.twitterUserId, '1234')
    equal(user.location, 'Silver Spring, MD')
    equal(user.twitterAccessToken, process.env.ACCESS_TOKEN)
    equal(user.twitterAccessTokenSecret, process.env.ACCESS_TOKEN_SECRET)
    ok(user.isSuperUser)
  })

  it('should look up by twitter user id', (done) => {
    db.getUserByTwitterUserId('1234')
      .then((user) => {
        equal(user.id, testUser.id)
        done()
      })
  })

  it('should handle missing twitter user id', (done) => {
    db.getUserByTwitterUserId(0)
      .then((user) => {
        equal(user, null)
        done()
      })
  })

  it('should lookup by superUser', (done) => {
    db.getSuperUser()
      .then((user) => {
        equal(user.id, testUser.id)
        done()
      })
  })

  it('should load all places', (done) => {
    db.loadPlaces().then((places) => {
      ok(places.length > 0, 'places.length')
      ok(places[0].name)
      done()
    })
  })

  it('should get place', (done) => {
    db.getPlace(2514815).then((place) => {
      ok(place.name, 'Washington')
      done()
    })
  })

  it('should get places', (done) => {
    db.getPlaces().then((places) => {
      ok(places.length > 0, 'places.length')
      done()
    })
  })
  
  it('should add user places', async () => {
    const places = await db.getPlaces()
    testUser.places = places.slice(0, 3)
    await db.updateUser(testUser)
  })

  it('should get user places', async () => {
    const u = await db.getUser(testUser.id)
    equal(u.places.length, 3)
    ok(u.places[0].name)
  })

  it('should get all users', async () => {
    const users = await db.getUsers()
    equal(users.length, 1)
    equal(users[0].places.length, 3)
  })

  it('should import latest trends', async () => {
    const trends = await db.importLatestTrends()
    ok(trends.length > 0)
  })

  it('should get trends for place', async () => {
    const trends = await db.getRecentTrendsForPlace({id: 1})
    ok(trends.length > 0)
    ok(trends[0].name)
    ok(typeof(trends[0].count, 'number'))
    ok(trends[0].count)
  })

  it('should get user trends', async () => {
    const places = await db.getUserTrends(testUser)
    equal(places.length, 3)
    ok(places[0].trends.length > 0)
  })

  it('should create search', async () => {
    const search = await db.createSearch({
      userId: testUser.id,
      title: 'Test',
      description: 'This is a test search!',
      active: true,
      queries: [{value: {or: [{type: 'keyword', value: 'music'}]}}]
    })
    ok(search.id, 'search.id')
    testSearch = search
  })

  it('should get search', async () => {
    const search = await db.getSearch(testSearch.id)
    equal(search.id, testSearch.id, 'search.id')
    equal(search.creator.id, testUser.id, 'search.user')
    equal(search.active, true, 'search.active')
    equal(search.maxTweetId, null, 'search.maxTweetId')
    ok(search.created, 'search.created')
    deepEqual(
      search.queries[0].value, 
      {or: [{type: 'keyword', value: 'music'}]},
      'search.query'
    )
    testSearch = search
  })

  it('should update search', async () => {
    await db.updateSearch({
      id: testSearch.id,
      title: 'Test Updated!',
    })
    const search = await db.getSearch(testSearch.id)
    equal(search.title, 'Test Updated!')
    equal(search.description, 'This is a test search!')
  })

  it('should ignore summary stats in update', async () => {
    await db.updateSearch({
      id: testSearch.id,
      title: 'Test Updated!',
      tweetCount: 123
    })
  })

  it('should import from search', async () => {
    const numTweets = await db.importFromSearch(testSearch, 200)
    equal(numTweets, 200, 'search found 200 tweets')
  })

  it('should get tweets and retweets', async () => {
    const tweets = await db.getTweets(testSearch, true, 0, 200)
    equal(tweets.length, 200, 'got 200 tweets')
    ok(tweets[0].id, 'tweets[0].id')

    const retweets = await db.getTweets(testSearch, false)
    ok(retweets.length < tweets.length)
    ok(retweets[0].retweetId == null) 
  })

  it('should import more from search', function(done) {
    // assumes someone tweeted with keyword "music" in 5 seconds, but not more than 100
    setTimeout(async () => {
      const search = await db.getSearch(testSearch.id)
      const origMaxTweetId = search.maxTweetId
      ok(origMaxTweetId, 'maxTweetId is set')
      const numTweets = await db.importFromSearch(search, 100)
      ok(numTweets > 0, 'searching again brought in more results')
      const updatedSearch = await db.getSearch(testSearch.id)
      ok(updatedSearch.maxTweetId > origMaxTweetId, 'new maxTweetId is higer')
      done()
    }, 5000)
  })

  it('should get summary', (done) => {
    db.getSearch(testSearch.id).then((search) => {
      db.getSearchSummary(search).then((summ) => {
        ok(typeof(summ.count), 'number')
        ok(summ.count > 100, 'count')
        ok(summ.maxDate, 'maxDate')
        ok(summ.minDate, 'minDate')
        ok(summ.maxTweetId, 'maxTweetId')
        done()
      })
    })
  })

  it('should get twitter users', async () => {
    const users = await db.getTwitterUsers(testSearch)
    ok(users.length > 0, 'users.length')
    ok(users[0].screenName, 'users[0].screenName')
    ok(users[0].tweetsInSearch > 0, 'users[0].tweetsInSearch')
    ok(users[0].tweetsInSearch >= users[1].tweetsInSearch)
  })

  it('should get hashtags', (done) => {
    db.getHashtags(testSearch).then((hashtags) => {
      // hopefully the test search pulled in some tweets with hashtags?
      if (hashtags.length > 0) {
        ok(hashtags[0].hashtag, '.hashtag text')
        ok(typeof(hashtags[0].count) == 'number')
        ok(hashtags[0].count > 0, 'hashtag count')
      }
      done()
    })
  })

  it('should get urls', async () => {
    // assumes that the collected tweets had at least one url
    const urls = await db.getUrls(testSearch)
    ok(urls.length > 0, 'got a url')
    ok(urls[0].url.match(/^http/), 'looks like a url')
    ok(typeof(urls[0].count), 'number')
    ok(urls[0].count > 0, 'the url count is set')
  })

  it('should get images', async () => {
    // assumes that the collected tweets had at least one image 
    const images = await db.getImages(testSearch)
    ok(images.length > 0, 'got an image')
    ok(images[0].url, 'image.url')
    ok(typeof(images[0].count), 'number')
    ok(images[0].count > 0)
  })

  /*
  it('should get videos', async () => {

    // create a twitter query for some music videos?
    const q = {
      value: {
        or: [
          {type: 'keyword', value: 'music'},
          {type: 'keyword', value: 'filter:videos'}
        ]
      }
    }

    testVideoSearch = await db.createSearch({
      userId: testUser.id,
      title: 'Video Test',
      description: 'This is a test search for videos!',
      active: true,
      queries: [q]
    })

    // fetch full representation from the database
    testVideoSearch = await db.getSearch(testVideoSearch.id)

    // do a search
    const numTweets = await db.importFromSearch(testVideoSearch, 200)

    // get the videos
    const videos = await db.getVideos(testVideoSearch)

    ok(videos.length > 0)
    ok(videos[0].url, 'video.url')
    ok(typeof(videos[0].count), 'number')
    ok(videos[0].count, 'videos.count')
  })

  */

  it('should get tweets for url', async () => {
    // get a url to test with
    const urls = await db.getUrls(testSearch)
    const url = urls[0].url

    const tweets = await db.getTweetsForUrl(testSearch, url)
    ok(tweets.length > 0)
  })

  it('should get tweets for image', async () => {
    // get a url to test with
    const images = await db.getImages(testSearch)
    const image = images[0].url

    const tweets = await db.getTweetsForImage(testSearch, image)
    ok(tweets.length > 0)
  })

  /*

  it('should get tweets for video', async () => {
    // get a url to test with
    const videos = await db.getVideos(testVideoSearch)
    const video = videos[0].url

    const tweets = await db.getTweetsForVideo(testVideoSearch, video)
    ok(tweets.length > 0)
  })

  */

  it('should get users', async () => {
    const users = await db.getUsers()
    ok(users[0].id, 'user.id')
    ok(users[0].searches.length > 0, 'user.searches')
    ok(users[0].searches[0].id, 'search.id')
    ok(typeof(users[0].searches[0].tweetCount), 'number')
    ok(users[0].searches[0].tweetCount > 0, 'search.tweetCount')
  })

  it('should get stats', async() => {
    const stats = await db.getSystemStats()
    ok(typeof(stats.tweetCount), 'number')
    ok(stats.tweetCount > 0, 'stats.tweetCount')
    ok(typeof(stats.userCount), 'number')
    ok(stats.userCount > 0, 'stats.userCount')
  })

  it('should delete', async () => {
    const result = await db.deleteSearch(testSearch)
    ok(result, 'delete return value')
  })

  it('should be deleted', async () => {
    const result = await db.getSearch(testSearch.id)
    ok(result === null)
  })

  it('should close', async() => {
    await db.close()
  })

})
