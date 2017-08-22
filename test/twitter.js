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

  it('should get search results', (done) => {
    t.search({q: 'obama'}).then((tweets) => {
      ok(tweets.length > 0)
      const t = tweets[0]
      ok(t.text.match(/obama/i))
      ok(t.id)
      ok(t.screenName)
      ok(t.avatarUrl)
      ok(t.created)
      ok(t.twitterUrl)
      ok(t.likeCount >= 0)
      ok(t.retweetCount >= 0)
      ok(t._data.id_str)
      done()
    })
  })
})
