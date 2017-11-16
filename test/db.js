import { ok, equal, deepEqual } from 'assert'
import { Database } from '../src/server/db'
import log from '../src/server/logger'

const db = new Database({redis: {db: 9}, es: {prefix: 'test'}})

describe('database', function() {

  let testUser = null
  let testSearch = null

  it('should clear', (done) => {
    db.clear().then(done)
  })

  it('should setup indexes', (done) => {
    db.setupIndexes().then(done)
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
    }, 1000)
  })

  it('should add user', (done) => {
    const user = {
      name: "Ed Summers",
      location: "Silver Spring, MD",
      twitterScreenName: "edsu",
      twitterUserId: "1234",
      twitterAccessToken: process.env.ACCESS_TOKEN,
      twitterAccessTokenSecret: process.env.ACCESS_TOKEN_SECRET
    }
    db.addUser(user)
      .then((user) => {
        if (user) {
          testUser = user
          done()
        }
      })
      .catch((msg) => {
        console.log(msg)
      })
  })

  /*

  it('should get user by id', (done) => {
    db.getUser(testUser.id)
      .then((user) => {
        equal(user.id, testUser.id)
        equal(user.name, 'Ed Summers')
        equal(user.twitterScreenName, 'edsu')
        equal(user.twitterUserId, '1234')
        equal(user.location, 'Silver Spring, MD')
        equal(user.twitterAccessToken, process.env.ACCESS_TOKEN)
        equal(user.twitterAccessTokenSecret, process.env.ACCESS_TOKEN_SECRET)
        equal(user.places.length, 0)
        ok(user.isSuperUser)
        done()
      })
  })

  it('should look up by twitter user id', (done) => {
    db.getUserByTwitterUserId('1234')
      .then((user) => {
        equal(user.id, testUser.id)
        done()
      })
  })

  it('should handle missing twitter user id', (done) => {
    db.getUserByTwitterUserId('foo')
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
      ok(places[0].id.match(/place-\d+/), 'places[0].id')
      done()
    })
  })

  it('should get place', (done) => {
    db.getPlace('place-2514815').then((place) => {
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

  it('should add user places', (done) => {
    testUser.places = ['place-1', 'place-2459115', 'place-23424819']
    db.updateUser(testUser).then(() => {
      done()
    })
  })

  it('should get user places', (done) => {
    db.getUser(testUser.id).then((u) => {
      ok(u.places.length === 3)
      done()
    })
  })

  it('should import latest trends', (done) => {
    db.importLatestTrends()
      .then((result) => {
        equal(result.length, 3)
        done()
      })
      .catch(console.log)
  })

  it('should get trends for place', (done) => {
    db.getTrendsForPlace('place-1')
      .then((result) => {
        ok(result.trends.length > 0)
        ok(result.trends[0].name)
        ok(result.trends[0].tweets)
        done()
      })
      .catch(console.log)
  })

  it('should create search', (done) => {
    db.createSearch(testUser, [{type: 'keyword', value: 'obama'}])
      .then((search) => {
        ok(search.id, 'search.id')
        testSearch = search
        done()
      })
      .catch((err) => {
        console.log(err)
      })
  })

  it('should get search', (done) => {
    db.getSearch(testSearch.id).then((search) => {
      equal(search.id, testSearch.id, 'search.id')
      deepEqual(search.query, [{type: 'keyword', value: 'obama'}], 'search.query')
      equal(search.creator, testUser.id, 'search.user')
      equal(search.active, true, 'search.active')
      equal(search.maxTweetId, null, 'search.maxTweetId')
      ok(search.created, 'search.created')
      testSearch = search
      done()
    })
  })

  it('should import from search', function(done) {
    db.importFromSearch(testSearch)
      .then((num) => {
        ok(num > 0, 'search found tweets')
        done()
      })
      .catch((err) => {
        console.log(err)
      })
  })

  it('should import more from search', function(done) {
    // test assumes someone will tweet about obama aggregations
    // 5 seconds from now...
    db.getSearch(testSearch.id).then((search) => {
      db.importFromSearch(search)
        .then((num) => {
          ok(num > 0)
          done()
        })
      })
  })

  it('should get tweets', (done) => {
    // wait for indices to sync before querying
    setTimeout(() => {
      db.es.indices.refresh({index: '_all'})
        .then(() => {
          db.getTweets(testSearch).then((tweets) => {
            ok(tweets.length > 0, 'tweets.length')
            ok(tweets[0].id, 'tweets[0].id')
            done()
          })
        })
      }, 200)
  })

  it('should get summary', (done) => {
    db.getSearch(testSearch.id).then((search) => {
      db.getSearchSummary(search).then((summ) => {
        ok(summ.count > 100, 'count')
        ok(summ.maxDate, 'maxDate')
        ok(summ.minDate, 'minDate')
        ok(summ.maxTweetId, 'maxTweetId')
        done()
      })
    })
  })

  it('should get twitter users', (done) => {
    db.getTwitterUsers(testSearch).then((users) => {
      ok(users.length > 0, 'users.length')
      ok(users[0].screenName, 'users[0].screenName')
      ok(users[0].tweetsInSearch > 0, 'users[0].tweetsInSearch')
      ok(users[0].tweetsInSearch >= users[1].tweetsInSearch)
      done()
    })
  })

  it('should get hashtags', (done) => {
    db.getHashtags(testSearch).then((hashtags) => {
      // hopefully the test search pulled in some tweets with hashtags?
      if (hashtags.length > 0) {
        ok(hashtags[0].hashtag, '.hashtag text')
        ok(hashtags[0].count > 0, 'hashtag count')
      }
      done()
    })
  })

  it('should get urls', (done) => {
    db.getUrls(testSearch).then((urls) => {
      ok(urls.length > 0)
      ok(urls[0].url.match(/^http/))
      ok(urls[0].count > 0)
      done()
    })
  })

  it('should get images', (done) => {
    db.getImages(testSearch).then((images) => {
      ok(images.length > 0)
      ok(images[0].url)
      done()
    })
  })

  it('should get videos', (done) => {
    db.getVideos(testSearch).then((videos) => {
      ok(videos.length > 0)
      ok(videos[0].url)
      done()
    })
  })

  */

})
