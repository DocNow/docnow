import { ok, equal, deepEqual } from 'assert'
import { Database } from '../src/server/db'
import log from '../src/server/logger'

const db = new Database({redis: {db: 9}, es: {prefix: 'test'}})

describe('database', function() {

  this.timeout(10000)

  let testUserId = null
  let testSearch = null

  it('should have elasticsearch prefix set', () => {
    equal(db.esPrefix, 'test')
    equal(db.esTweetIndex, 'test:tweets')
  })

  it('should clear', (done) => {
    db.clear()
      .then(done)
      .catch((msg) => {log.error(msg)})
  })

  it('should add settings', (done) => {
    db.addSettings({
      appKey: process.env.CONSUMER_KEY,
      appSecret: process.env.CONSUMER_SECRET
    }).then(done())
  })

  it('should get settings', (done) => {
    db.getSettings()
      .then((settings) => {
        equal(settings.appKey, process.env.CONSUMER_KEY)
        equal(settings.appSecret, process.env.CONSUMER_SECRET)
        done()
      })
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
      .then((userId) => {
        if (userId) {
          testUserId = userId
          done()
        }
    })
  })

  it('should get user by id', (done) => {
    db.getUser(testUserId)
      .then((user) => {
        equal(user.id, testUserId)
        equal(user.name, 'Ed Summers')
        equal(user.twitterScreenName, 'edsu')
        equal(user.twitterUserId, '1234')
        equal(user.location, 'Silver Spring, MD')
        equal(user.twitterAccessToken, process.env.ACCESS_TOKEN)
        equal(user.twitterAccessTokenSecret, process.env.ACCESS_TOKEN_SECRET)
        ok(user.isSuperUser)
        done()
      })
  })

  it('should look up by twitter user id', (done) => {
    db.getUserByTwitterUserId('twitterUser:1234')
      .then((user) => {
        equal(user.id, testUserId)
        done()
      })
  })

  it('should look up twitter user id without prefix', (done) => {
    db.getUserByTwitterUserId('1234')
      .then((user) => {
        equal(user.id, testUserId)
        done()
      })
  })

  it('should handle missing user', (done) => {
    db.getUser('foo')
      .then((user) => {
        equal(user, null)
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
        equal(user.id, testUserId)
        done()
      })
  })

  it('should set/get places', (done) => {
    db.setUserPlaces(testUserId, [1,2459115,23424819]).then(() => {
      db.getUserPlaces(testUserId).then((places) => {
        equal(places.length, 3)
        ok(places[0].match(/^place:\d+$/))
        done()
      })
    })
  })

  it('should import latest trends', (done) => {
    db.importLatestTrends()
      .then((result) => {
        equal(result.length, 3)
        db.getTrends(1).then((result) => {
          ok(result.trends.length > 0)
          ok(result.trends[0].name)
          ok(result.trends[0].tweets)
          done()
        })
      })
  })

  it('should load all places', (done) => {
    db.loadPlaces()
      .then((result) => {
        db.getPlace('2514815').then((place) => {
          ok(place.name, 'Washington')
          db.getPlaces().then((places) => {
            ok(places)
            equal(places['place:90036018']['name'], 'Okayama')
            done()
          })
        })
      })
  })

  it('should load user trends', (done) => {
    db.getUserTrends(testUserId)
      .then((result) => {
        ok(result.length === 3)
        ok(result[0].trends.length > 0)
        ok(result[0].name)
        done()
      })
  })

  it('should add prefix', () => {
    equal(db.addPrefix('123', 'user'), 'user:123')
    equal(db.addPrefix('user:123', 'user'), 'user:123')
    deepEqual(db.addPrefixes(['1', '2'], 'user'), ['user:1', 'user:2'])
  })

  it('should strip prefix', () => {
    equal(db.stripPrefix('foo:bar'), 'bar')
    equal(db.stripPrefix('foobar'), 'foobar')
  })

  it('should create search', (done) => {
    db.createSearch(testUserId, 'obama')
      .then((search) => {
        ok(search.id, 'search.id')
        testSearch = search
        done()
      })
  })

  it('should get search', (done) => {
    db.getSearch(testSearch.id).then((search) => {
      equal(search.id, testSearch.id, 'search.id')
      equal(search.query, 'obama', 'search.query')
      equal(search.creator, testUserId, 'search.user')
      ok(search.created, 'search.created')
      done()
    })
  })

  it('should import from search', (done) => {
    db.importFromSearch(testSearch)
      .then((tweets) => {
        ok(tweets.length > 0, 'search found tweets')
        done()
      })
      .catch((err) => {
        console.log(err)
      })
  })

  it('should get tweets', (done) => {
    // wait for indices to sync before querying
    db.es.indices.refresh({index: '_all'})
      .then(() => {
        db.getTweets(testSearch).then((tweets) => {
          ok(tweets.length > 0, 'tweets.length')
          ok(tweets[0].id, 'tweets[0].id')
          done()
        })
      })
  })

  it('should get users', (done) => {
    db.getUsers(testSearch).then((users) => {
      ok(users.length > 0, 'users.length')
      ok(users[0].screenName, 'users[0].screenName')
      ok(users[0].tweetsInSearch > 0, 'users[0].tweetsInSearch')
      ok(users[0].tweetsInSearch >= users[1].tweetsInSearch)
      done()
    })
  })

  it('shoud get hashtags', (done) => {
    db.getHashtags(testSearch).then((hashtags) => {
      // hopefully the test search pulled in some tweets with hashtags?
      if (hashtags.length > 0) {
        ok(hashtags[0].hashtag, '.hashtag text')
        ok(hashtags[0].count > 0, 'hashtag count')
      }
      done()
    })
  })

  it('should get videos', (done) => {
    db.getVideos(testSearch).then((hashtags) => {
      done()
    })
  })

  it('should get photos', (done) => {
    db.getPhotos(testSearch).then((photos) => {
      done()
    })
  })

})
