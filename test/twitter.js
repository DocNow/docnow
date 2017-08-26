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
        equal(place.id, 1, 'place.id')
        equal(place.name, 'Worldwide', 'place.name')
        ok(place.trends.length > 0, 'place.trends')
        ok(place.trends[0].name, 'place.trends[].name')
        ok(place.trends[0].tweets >= 0, 'place.trends[].tweets')
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
      ok(t.text.match(/obama/i), 'text')
      ok(t.id, 'id')
      ok(t.screenName, 'screenName')
      ok(t.avatarUrl, 'avatarUrl')
      ok(t.created, 'created')
      ok(t.twitterUrl, 'twitterUrl')
      ok(t.likeCount >= 0, 'likeCount')
      ok(t.retweetCount >= 0, 'retweetCount')
      ok(t.client, 'client')
      done()
    })
  })

})
