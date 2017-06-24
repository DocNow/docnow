import { ok, equal } from 'assert'
import { Twitter } from '../src/server/twitter'

describe('docnow', () => {

  const t = new Twitter()

  describe('twitter', () => {

    it('should construct', () => {
      ok(t)
      ok(t.consumerKey)
      ok(t.consumerSecret)
      ok(t.accessToken)
      ok(t.accessTokenSecret)
      ok(t.twit)
    })

    it('should fetch trends by place', (done) => {
      t.getTrendsAtPlace(1)
        .then((place) => {
          equal(place.id, 1)
          equal(place.name, 'Worldwide')
          ok(place.trends.length > 0)
          ok(place.trends[0].name)
          ok(place.trends[0].tweets)
          done()
        })
    })

    it('should fetch all places', (done) => {
      t.getPlaces().then((places) => {
        ok(places.length > 0)
        done()
      })
    })
  })
})
