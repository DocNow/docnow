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
    t.search({q: 'obama'}, (err, tweets) => {
      ok(err === null)
      if (tweets.length == 0) {
        done()
      } else {
        const t = tweets[0]
        ok(t.text.match(/obama/i), 'text')
        ok(t.id, 'id')
        ok(t.user.id, 'user.id')
        ok(t.user.screenName, 'user.screenName')
        ok(t.user.followersCount >= 0, 'user.followersCount')
        ok(t.user.friendsCount >= 0, 'user.friendsCount')
        ok(t.user.tweetsCount >= 0, 'user.tweetsCount')
        ok(t.user.avatarUrl, 'user.avatarUrl')
        ok(t.user.created, 'user.created')
        ok(t.created, 'created')
        ok(t.twitterUrl, 'twitterUrl')
        ok(t.likeCount >= 0, 'likeCount')
        ok(t.retweetCount >= 0, 'retweetCount')
        ok(t.client, 'client')
        ok('videos' in t, 'videos')
        ok('photos' in t, 'photos')
        ok('animatedGifs' in t, 'animatedGifs')

        ok('retweet' in t, 'retweet')
        if (t.retweet) {
          ok(t.retweet.id, 'retweet.id')
        }

        ok('quote' in t, 'quote')
        if (t.quote) {
          ok(t.quote.id, 'quote.id')
        }
      }
    })
  })

  it('should get > 100 search results', (done) => {
    let callbackCount = 0
    t.search({q: 'obama', count: 300}, (err, tweets) => {
      callbackCount += 1
      if (callbackCount === 3) {
        done()
      } else if (tweets.length > 0) {
        ok(tweets[0].id, 'check id')
      }
    })
  })
})
