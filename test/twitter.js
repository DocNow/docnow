import { ok, strictEqual as equal } from 'assert'
import { Twitter } from '../src/server/twitter'
import { timer } from '../src/server/utils'

const now = new Date()
const tag = `test-${now / 100000}`

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

  it('should fetch trends by place', async () => {
    const trends = await t.getTrendsAtPlace(1)
    ok(trends.length > 0, 'place.trends')
    ok(trends[0].name, 'place.trends[].name')
    ok(trends[0].count >= 0, 'place.trends[].count')
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
    t.search({q: 'obama'}, async (err, tweets) => {
      ok(err === null)
      if (tweets.length == 0) {
        done()
      } else {
        const t = tweets[0]
        ok(t.text, 'text')
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
        ok(t.mentions.length >= 0, 'mentions')
        ok(t.urls.length >= 0, 'urls')

        ok(t.videos.length >= 0, 'videos')
        ok(t.images.length >= 0, 'images')
        ok(t.animatedGifs.length >= 0, 'animatedGifs')

        ok('retweet' in t, 'retweet')
        if (t.retweet) {
          ok(t.retweet.id, 'retweet.id')
        }
        ok('quote' in t, 'quote')
      }
    })
  })

  it('should get > 100 search results', (done) => {
    let callbackCount = 0
    t.search({q: 'obama', count: 300}, async (err, tweets) => {
      callbackCount += 1
      if (callbackCount === 3) {
        done()
        return
      } else if (tweets.length > 0) {
        ok(tweets[0].id, 'check id in searched tweet')
        ok(tweets[0].text, 'check text in searched tweet')
      }
    })
  })

  it('should add filter rule', async () => {
    ok(await t.addFilterRule('music', tag))
  })

  it('should list filter rules', async () => {
    const rules = await t.getFilterRules()
    equal(rules.length, 1)
    equal(rules[0].value, 'music')
    equal(rules[0].tag, tag)
    ok(rules[0].id)
  })

  it('should filter', async () => {
    let count = 0
    await t.filter(async (tweet, tags) => {
      count += 1
      ok(tweet.id, 'check id in streamed tweet')
      ok(tweet.text, 'check text in streamed tweet')
      ok(tags, 'tweet has stream tags')
      ok(tags.indexOf(tag) != -1, `tweet has tag ${tag}`)
      if (count > 5) {
        t.closeFilter()
        return false
      }
      return true
    })

    await timer(5000)
    ok(count > 1)
  })

  it('should remove filter rule', async () => {

    // delete all the filter rules with the test tag
    let didDelete = false
    for (const rule of await t.getFilterRules()) {
      if (rule.tag === tag) {
        await t.deleteFilterRule(rule.id)
        didDelete = true
      }
    }
    ok(didDelete)

    // make sure the filter rules are all gone
    let isDeleted = true
    for (const rule of await t.getFilterRules()) {
      if (rule.tag === tag) {
        isDeleted = false
      }
    }
    ok(isDeleted)

  })

})
