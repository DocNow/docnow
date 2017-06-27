import { ok, equal } from 'assert'
import { Twitter } from '../src/server/twitter'

describe('twitter', () => {

  const t = new Twitter()

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
      ok(places.length > 100)
      ok(places[0].id)
      ok(places[0].name)
      done()
    })
  })
})
