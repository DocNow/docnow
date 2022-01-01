import { equal, deepEqual, ok } from 'assert'
import { timer } from '../src/server/utils'

describe('utils', () => {

  it('should timer', async () => {
    const t0 = new Date()
    await timer(2000)
    const t1 = new Date()
    ok(t1 - t0 >= 2000, 'timer works')
  })

})
