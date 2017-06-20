import assert from 'assert'
import { Database } from '../src/server/db'

const db = new Database({db: 9})
global.userId = null

describe('docnow', () => {
  describe('database', () => {

    it('should clear', (done) => {
      db.clear( () => {
        done()
      })
    })

    it('should add settings', (done) => {
      db.addSettings({appKey: 'abc', appSecret: '123'}, () => done())
    })

    it('should get settings', (done) => {
      db.getSettings((settings) => {
        assert.equal(settings.appKey, 'abc')
        assert.equal(settings.appSecret, '123')
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
      db.addUser(user, (userId) => {
        if (userId) {
          global.userId = userId
          done()
        }
      })
    })

    it('should get user by id', (done) => {
      db.getUser(global.userId, (user) => {
        assert.equal(user.id, global.userId)
        assert.equal(user.name, 'Ed Summers')
        assert.equal(user.twitterScreenName, 'edsu')
        assert.equal(user.twitterUserId, '1234')
        assert.equal(user.location, 'Silver Spring, MD')
        done()
      })
    })

    it('should look up by twitter user id', (done) => {
      db.getUserByTwitterUserId('twitterUser:1234', (user) => {
        assert.equal(user.id, global.userId)
        done()
      })
    })

    it('should look up twitter user id without prefix', (done) => {
      db.getUserByTwitterUserId('1234', (user) => {
        assert.equal(user.id, global.userId)
        done()
      })
    })

    it('should handle missing user', (done) => {
      db.getUser('foo', (user) => {
        assert.equal(user, null)
        done()
      })
    })

    it('should handle missing twitter user id', (done) => {
      db.getUserByTwitterUserId('foo', (user) => {
        assert.equal(user, null)
        done()
      })
    })

  })
})
