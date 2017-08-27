import url from 'url'
import Twit from 'twit'
import log from './logger'
import emojiRegex from 'emoji-regex'

const emojiMatch = emojiRegex()

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

  search(opts) {
    const params = {
      q: opts.q,
      tweet_mode: 'extended',
      result_type: opts.resultType || 'recent',
      count: opts.count || 100,
      since_id: opts.sinceId,
      max_id: opts.maxId,
      include_entities: true
    }
    return new Promise(
      (resolve) => {
        this.twit.get('search/tweets', params)
          .then((resp) => {
            resolve(resp.data.statuses.map(this.extractTweet))
          })
      }
    )
  }

  extractTweet(t) {
    const created = new Date(t.created_at).toISOString()
    const hashtags = t.entities.hashtags.map((ht) => {return ht.text.toLowerCase()})
    const mentions = t.entities.user_mentions.map((m) => {return m.screen_name})
    const geo = t.coordinates ? t.coordinates.coordinates : null
    const retweet = t.retweeted_status ? t.retweeted_status.id_str : null
    const emojis = emojiMatch.exec(t.full_text)

    let place = null
    if (t.place) {
      place = {
        name: t.place.full_name,
        type: t.place.place_type,
        id: t.place.id,
        country: t.place.country,
        countryCode: t.place.country_code,
        boundingBox: t.place.bounding_box[0]
      }
    }

    const urls = []
    if (t.entities.urls) {
      for (const e of t.entities.urls) {
        const u = url.parse(e.expanded_url)
        urls.push({
          short: e.url,
          long: e.expanded_url,
          hostname: u.hostname
        })
      }
    }

    const photos = []
    const videos = []
    const animatedGifs = []
    if (t.extended_entities && t.extended_entities.media) {
      for (const e of t.extended_entities.media) {
        if (e.type === 'photo') {
          photos.push(e.media_url_https)
        } else if (e.type === 'video') {
          videos.push(e.media_url_https)
        } else if (e.type === 'animated_gif') {
          animatedGifs.push(e.media_url_https)
        }
      }
    }

    return ({
      id: t.id_str,
      text: t.full_text,
      screenName: t.user.screen_name,
      avatarUrl: t.user.profile_image_url_https,
      twitterUrl: 'https://twitter.com/' + t.user.screen_name + '/status/' + t.id_str,
      likeCount: t.favorite_count,
      retweetCount: t.retweet_count,
      client: t.source.match(/>(.+?)</)[1],
      created,
      hashtags,
      mentions,
      geo,
      retweet,
      place,
      urls,
      photos,
      videos,
      animatedGifs,
      emojis
      // user info? id, created, followers, friends
    })
  }

}
