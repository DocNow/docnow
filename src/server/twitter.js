import '../env'
import url from 'url'
import Twit from 'twit'
import log from './logger'
import { timer } from './utils'
import TwitterV2 from 'twitter-v2'
import emojiRegex from 'emoji-regex'
import { AllHtmlEntities } from 'html-entities'
import { flatten, EVERYTHING } from 'flatten-tweet'

const emojiMatch = emojiRegex()
const entities = new AllHtmlEntities()

function decode(s) {
  return entities.decode(s)
}

export class Twitter {

  constructor(keys = {}) {
    this.consumerKey = keys.consumerKey || process.env.CONSUMER_KEY
    this.consumerSecret = keys.consumerSecret || process.env.CONSUMER_SECRET
    this.accessToken = keys.accessToken || process.env.ACCESS_TOKEN
    this.accessTokenSecret = keys.accessTokenSecret || process.env.ACCESS_TOKEN_SECRET

    // a client for v1.1 endpoints
    if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessTokenSecret) {
      this.twit = new Twit({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        access_token: this.accessToken,
        access_token_secret: this.accessTokenSecret
      })

      // a client for v2 endpoints
      this.twitterV2 = new TwitterV2({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        access_token_key: this.accessToken,
        access_token_secret: this.accessTokenSecret
      })

      // a client for v2 endpoints
      this.twitterV2App = new TwitterV2({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret
      })


    } else {
      log.warn('not configuring user client for v1.1 and v2 endpoints since not all keys are present')
    }

    // a app auth client for v2 endpoints
    if (this.consumerKey && this.consumerSecret) {
      this.twitterV2app = new TwitterV2({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
      })
    } else {
      log.warn('unable to configure app client for v2 endpoint since not all keys are present')
    }
  }

  getPlaces() {
    return new Promise((resolve) => {
      this.twit.get('trends/available').
        then((resp) => {
          const places = []
          for (const place of resp.data) {
            places.push({
              id: place.woeid,
              name: place.name,
              type: place.placeType.name,
              country: place.country || '',
              countryCode: place.countryCode || '',
              parentId: place.parentid || ''
            })
          }
          resolve(places)
        })
    })
  }

  async getTrendsAtPlace(id) {
    log.info('fetching trends for ' + id)
    const trends = []
    try {
      const resp = await this.twit.get('trends/place', {id: id})
      for (const trend of resp.data[0].trends) {
        trends.push({name: trend.name, count: trend.tweet_volume})
      }
    } catch (e) {
      log.error(`error when fetching trends: ${e}`)
    }
    return trends
  }

  search(opts, cb) {
    log.info('searching for', opts)
    // count is the total number of tweets to return across all API requests
    const count = opts.count || 100

    const params =  {
      ...EVERYTHING,
      "query": opts.q,
      "max_results": 100,
    }

    if (opts.sinceId) {
      params.since_id = opts.sinceId
    } 

    if (opts.maxId) {
      params.until_id = opts.maxId
    }

    // const endpoint = opts.all ? 'tweets/search/all' : 'tweets/search/recent'
    const endpoint = 'tweets/search/all'
    params.start_time = '2006-03-21T00:00:00+00:00'

    const recurse = (nextToken, total) => {
      if (nextToken) {
        params.next_token = nextToken
      }
      this.twitterV2App.get(endpoint, params).then((resp) => {
        if (resp.data) {
          const tweets = flatten(resp).data
          const newTotal = total + tweets.length
          cb(null, tweets.map(t => this.extractTweet(t)))
            .then(() => {
              if (newTotal < count && resp.meta.next_token) {
                recurse(resp.meta.next_token, newTotal)
              } else {
                cb(null, [])
              }
            })
        } else {
          log.warn(`received search response with no data stanza`)
          cb(null, [])
        }
      })
      .catch(err => {
        log.error(`error during search: ${err}`)
        cb(err, null)
      })
    }

    recurse(null, 0)
  }

  async addFilterRule(value, tag) {
    log.info(`adding filter rule value=${value} tag=${tag}`)
    const payload = {"add": [{value, tag}]}
    const results = this.twitterV2app.post('tweets/search/stream/rules', payload)
    return results
  }

  async getFilterRules() {
    log.info('getting filter rules')
    const results = await this.twitterV2app.get('tweets/search/stream/rules')
    if (results.data) {
      return results.data
    } else {
      return []
    }
  }

  async deleteFilterRule(id) {
    log.info(`deleting filter rule ${id}`)
    const payload = {"delete": {"ids": [id]}}
    const results = this.twitterV2app.post('tweets/search/stream/rules', payload)
    return results
  }

  async filter(cb) {
    log.info('starting filter stream')

    let err = 0
    while (true) {
      try {
        this.stream = this.twitterV2app.stream('tweets/search/stream', EVERYTHING)
        break
      } catch (e) {
        err += 1
        const secs = err ** 2
        log.error(`caught ${e} while connecting to stream, sleeping ${secs}`)
        await timer(secs * 1000)
      }
    }

    try {
      for await (const response of this.stream) {
        if (response.data) {
          // when streaming response.data is an object, instead of a list
          // flatten ensures that response.data is always a list 
          // so we want to get the first and only element in the list
          const tweet = flatten(response).data[0]
          const tags = response.matching_rules
            ? response.matching_rules.map(r => r.tag)
            : []

          // if the callback result is not true then we are being told to stop 
          const result = await cb(this.extractTweet(tweet), tags)
          if (! result) {
            log.info('callback returned false so stopping filter stream')
            break
          }
        } else {
          log.error(`unexpected filter response: ${JSON.stringify(response)}`)
        }
      }
      // if stream is undefined that means closeFilter() has been called 
      if (this.stream) {
        log.error(`stream disconnected normally by Twitter, reconnecting`)
        this.filter(cb)
      }
    } catch (error) {
      log.warn(`stream disconnected with error, retrying`, error)
      this.filter(cb)
    }
  }

  closeFilter() {
    if (this.stream) {
      log.info('closing filter stream')
      this.stream.close()
      this.stream = null
    }
  }

  lookup(o, includes) {
    return {
      ...o,
      ...includes.find(i => o.id === i.id)
    }
  }

  lookupList(list, includes) {
    return list ? list.map(o => this.lookup(o, includes)) : []
  }

  extractTweet(t) {
    let retweet = null
    let quote = null
    for (const ref of t.referenced_tweets || []) {
      if (ref.type == 'retweeted') {
        retweet = ref
      } else if (ref.type === 'quoted') {
        quote = ref
      }
    }

    const hashtags = t.entities && t.entities.hashtags
      ? t.entities.hashtags.map(ht => ht.tag.toLowerCase())
      : []

    const mentions = t.entities && t.entities.mentions
      ? t.entities.mentions.map(m => m.username)
      : []

    let place = null
    if (t.geo && t.geo.place_id) {
      place = {
        name: t.geo.full_name,
        type: t.geo.place_type,
        id: t.geo.place_id,
        country: t.geo.country,
        countryCode: t.geo.country_code,
        boundingBox: t.geo.geo.bbox
      }
    }

    const urls = []
    if (t.entities && t.entities.urls) {
      for (const e of t.entities.urls) {
        const u = url.parse(e.expanded_url)
        // not interested in pointers back to Twitter which
        // happens during quoting
        if (u.hostname === 'twitter.com') {
          continue
        }
        urls.push({
          short: e.url,
          long: e.expanded_url,
          hostname: u.hostname
        })
      }
    }

    const images = []
    const videos = []
    const animatedGifs = []
    if (t.attachments && t.attachments.media) {
      for (const e of t.attachments.media) {
        if (e.type === 'photo') {
          images.push(e.url)
        } else if (e.type === 'video') {
          videos.push(e.preview_image_url)
        } else if (e.type === 'animated_gif') {
          animatedGifs.push(e.preview_image_url)
        }
      }
    }

    return {
      id: t.id,
      created: new Date(t.created_at),
      twitterUrl: `https://twitter.com/${t.author.username}/status/${t.id}`,
      text: decode(t.text),
      language: t.lang,
      client: t.source,
      likeCount: t.public_metrics.like_count,
      retweetCount: t.public_metrics.retweet_count,
      quoteCount: t.public_metrics.quote_count,
      replyCount: t.public_metrics.quote_count,
      retweetId: retweet ? retweet.id : null,
      quoteId: quote ? quote.id : null,
      quote: quote,
      retweet: retweet,
      emojis: emojiMatch.exec(t.text),
      hashtags: hashtags,
      mentions: mentions,
      place: place,
      urls: urls,
      videos: videos,
      images: images,
      animatedGifs: animatedGifs,
      user: {
        id: t.author.id,
        created: new Date(t.author.created_at),
        screenName: t.author.username,
        name: decode(t.author.name),
        description: decode(t.author.description),
        location: decode(t.author.location),
        avatarUrl: t.author.profile_image_url,
        url: t.author.url,
        followersCount: t.author.public_metrics.followers_count,
        friendsCount: t.author.public_metrics.following_count,
        tweetsCount: t.author.public_metrics.tweet_count,
        listedCount: t.author.public_metrics.listed_count,
      },
    }

  }

  async sendTweet(text) {
    const result = await this.twit.post('statuses/update', {
      status: text
    })
    return result.data.id_str
  }

}
