import { ok, equal, deepEqual } from 'assert'
import { Database } from '../src/server/db'

const db = new Database({db: 9})

describe('database', () => {

  let testUserId = null

  it('should clear', (done) => {
    db.clear().then(done())
  })

  it('should add settings', (done) => {
    db.addSettings({appKey: 'abc', appSecret: '123'}).then(done())
  })

  it('should get settings', (done) => {
    db.getSettings()
      .then((settings) => {
        equal(settings.appKey, 'abc')
        equal(settings.appSecret, '123')
        done()
      })
  })

  it('should add user', (done) => {
    const user = {
      name: "Ed Summers",
      location: "Silver Spring, MD",
      twitterScreenName: "edsu",
      twitterUserId: "1234"
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
          // equal(result.id, 'trends:place:1')
          ok(result.trends.length > 0)
          ok(result.trends[0].name)
          ok(result.trends[0].tweets)
          done()
        })
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

})
