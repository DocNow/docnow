import { ok, equal } from 'assert'
import { memento, closest } from '../src/server/wayback'

describe('internet-archive', function() {

  it('should fetch history', async () => {
    const results = await memento('https://inkdroid.org')
    ok(results.length > 0, 'results.length')
    ok(results[0].url, 'url')
    ok(results[0].rel, 'rel')
    ok(results[0].time, 'timestamp')
  })

  it('should get latest', async () => {
    const result = await closest('https://inkdroid.org')
    ok(result.time, 'time')
    ok(result.url, 'url')
  })

  it('should return null', async () => {
    const result = await closest('https://inkdroid.org/lskdjf390jsf')
    equal(result, null)
  })

})
