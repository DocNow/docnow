import url from 'url'
import Twit from 'twit'
import log from './logger'
import bigInt from 'big-integer'
import emojiRegex from 'emoji-regex'
import { AllHtmlEntities } from 'html-entities'

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
              parent: place.parentid || ''
            })
          }
          resolve(places)
        })
    })
  }

  getTrendsAtPlace(woeId) {
    log.info('fetching trends for ' + woeId)
    return new Promise(
      (resolve, reject) => {
        this.twit.get('trends/place', {id: woeId})
          .then((resp) => {
            const place = {
              id: resp.data[0].locations[0].woeid,
              name: resp.data[0].locations[0].name,
              trends: []
            }
            for (const trend of resp.data[0].trends) {
              place.trends.push({name: trend.name, tweets: trend.tweet_volume})
            }
            resolve(place)
          })
          .error((msg) => {
            reject(msg)
          })
      }
    )
  }

  search(opts, cb) {
    const count = opts.count || 100
    const params =  {
      q: opts.q,
      tweet_mode: 'extended',
      result_type: opts.resultType || 'recent',
      count: 100,
      since_id: opts.sinceId,
      include_entities: true
    }

    const recurse = (maxId, total) => {
      const newParams = Object.assign({max_id: maxId}, params)
      log.info('searching twitter', {params: newParams})
      this.twit.get('search/tweets', newParams).then((resp) => {
        if (resp.data.errors) {
          cb(resp.data.errors[0], null)
        } else {
          const tweets = resp.data.statuses
          const newTotal = total + tweets.length
          cb(null, tweets.map((s) => {return this.extractTweet(s)}))
          if (tweets.length > 0 && newTotal < count) {
            const newMaxId = String(bigInt(tweets[tweets.length - 1].id_str).minus(1))
            recurse(newMaxId, newTotal)
          } else {
            cb(null, [])
          }
        }
      })
    }

    recurse(opts.maxId, 0)
  }

  filter(opts, cb) {
    const params = {
      track: opts.track,
      tweet_mode: 'extended',
      include_entities: true
    }
    log.info('starting stream for: ', {stream: params})
    const stream = this.twit.stream('statuses/filter', params)
    stream.on('tweet', (tweet) => {
      const result = cb(this.extractTweet(tweet))
      if (result === false) {
        log.info('stopping stream for: ', {stream: params})
        stream.stop()
      }
    })
  }

  extractTweet(t) {
    const created = new Date(t.created_at)
    const userCreated = new Date(t.user.created_at)
    const hashtags = t.entities.hashtags.map((ht) => {return ht.text.toLowerCase()})
    const mentions = t.entities.user_mentions.map((m) => {return m.screen_name})

    let geo = null
    if (t.coordinates) {
      geo = t.coordinates
    }

    const emojis = emojiMatch.exec(t.full_text)

    let retweet = null
    if (t.retweeted_status) {
      retweet = this.extractTweet(t.retweeted_status)
    }

    let quote = null
    if (t.quoted_status) {
      quote = this.extractTweet(t.quoted_status)
    }

    let place = null
    if (t.place) {
      place = {
        name: t.place.full_name,
        type: t.place.place_type,
        id: t.place.id,
        country: t.place.country,
        countryCode: t.place.country_code,
        boundingBox: t.place.bounding_box
      }
    }

    const urls = []
    if (t.entities.urls) {
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

    let userUrl = null
    if (t.user.entities && t.user.entities.url) {
      userUrl = t.user.entities.url.urls[0].expanded_url
    }

    const images = []
    const videos = []
    const animatedGifs = []
    if (t.extended_entities && t.extended_entities.media) {
      for (const e of t.extended_entities.media) {
        if (e.type === 'photo') {
          images.push(e.media_url_https)
        } else if (e.type === 'video') {
          let maxBitRate = 0
          let videoUrl = null
          for (const v of e.video_info.variants) {
            if (v.content_type === 'video/mp4' && v.bitrate > maxBitRate) {
              videoUrl = v.url
              maxBitRate = v.bitrate
            }
          }
          if (videoUrl) {
            videos.push(videoUrl)
          }
        } else if (e.type === 'animated_gif') {
          animatedGifs.push(e.media_url_https)
        }
      }
    }

    let text = t.text
    if (retweet) {
      text = retweet.text
    } else if (t.extended_tweet) {
      text = t.extended_tweet.full_text
    } else if (t.full_text) {
      text = t.full_text
    }

    return ({
      id: t.id_str,
      text: decode(text),
      twitterUrl: 'https://twitter.com/' + t.user.screen_name + '/status/' + t.id_str,
      likeCount: t.favorite_count,
      retweetCount: t.retweet_count,
      client: t.source ? t.source.match(/>(.+?)</)[1] : null,
      user: {
        id: t.user.id_str,
        screenName: t.user.screen_name,
        name: decode(t.user.name),
        description: decode(t.user.description),
        location: decode(t.user.location),
        created: userCreated,
        avatarUrl: t.user.profile_image_url_https,
        url: userUrl,
        followersCount: t.user.followers_count,
        friendsCount: t.user.friends_count,
        tweetsCount: t.user.statuses_count,
        listedCount: t.user.listed_count
      },
      created,
      hashtags,
      mentions,
      geo,
      place,
      urls,
      images,
      videos,
      animatedGifs,
      emojis,
      retweet,
      quote
    })
  }

}
