import { equal, deepEqual, ok } from 'assert'
import { utils } from 'mocha'
import { addPrefix, stripPrefix, addPrefixes } from '../src/server/utils'

describe('utils', () => {

  it('should timer', async () => {
    const t0 = new Date()
    await utils.timer(2000)
    const t1 = new Date()
    ok(t1 - t0 >= 2000, 'timer works')
  })

})
