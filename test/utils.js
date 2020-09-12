import { equal, deepEqual } from 'assert'
import { addPrefix, stripPrefix, addPrefixes } from '../src/server/utils'

describe('utils', () => {

  it('should addPrefix', () => {
    equal(addPrefix('foo', 'bar'), 'foo-bar')
  })

  it('should stripPrefix', () => {
    equal(stripPrefix('foo-bar'), 'bar')
  })

  it('should addPrefixes', () => {
    deepEqual(
      addPrefixes(['foo', 'bar', 'baz'], 'x'),
      ['x-foo', 'x-bar', 'x-baz']
    )
  })

})
