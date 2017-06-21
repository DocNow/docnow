import assert from 'assert'
import { Database } from '../src/server/db'

const db = new Database({db: 9})

describe('docnow', () => {
  describe('trends', () => {
    it('should update', () => {
      assert.equal(true, true)
    })
  })
})
