import '../env'
import url from 'url'
import Twit from 'twit'
import log from './logger'
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
    this.twit = new Twit({
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      access_token: this.accessToken,
      access_token_secret: this.accessTokenSecret
    })
    this.twitterV2 = new TwitterV2({
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      access_token_key: this.accessToken,
      access_token_secret: this.accessTokenSecret
    })
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
      console.log(`error when fetching trends: ${e}`)
    }
    return trends
  }

  search(opts, cb) {
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

    const endpoint = opts.all ? 'tweets/search/all' : 'tweets/search/recent'

    const recurse = (nextToken, total) => {
      if (nextToken) {
        params.next_token = nextToken
      }
      this.twitterV2.get(endpoint, params).then((resp) => {
        if (resp.data) {
          const tweets = flatten(resp).data
          const newTotal = total + tweets.length
          cb(null, tweets.map(t => this.extractTweet(t)))
          if (newTotal < count && resp.meta.next_token) {
            recurse(resp.meta.next_token, newTotal)
          } else {
            cb(null, [])
          }
        }
      })
      .catch(err => {
        console.log(err)
        cb(err, null)
      })
    }

    recurse(null, 0)
  }

  filter(opts, cb) {
    const params = {
      track: opts.track,
      tweet_mode: 'extended',
      include_entities: true
    }
    log.info('starting stream for: ', {stream: params})
    const stream = this.twit.stream('statuses/filter', params)
    stream.on('tweet', async (tweet) => {
      const result = await cb(this.extractTweet(tweet))
      if (result === false) {
        log.info('stopping stream for: ', {stream: params})
        stream.stop()
      }
    })
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
    if (t.geo) {
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