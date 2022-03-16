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

    // user client for Twitter v1.1 and v2 API endpoints
    if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessTokenSecret) {
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
    } else {
      log.warn('unable to configure user client since not all keys are present')
    }

    // app auth client for v1.1 and v2 endpoints
    if (this.consumerKey && this.consumerSecret) {
      this.twitterV2app = new TwitterV2({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
      })
      this.twitApp = new Twit({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        app_only_auth: true
      })
      log.info('configured app client for v1.1 and v2 endpoints')
    } else {
      log.warn('unable to configure app client since not all keys are present')
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

  /**
   * Gets search results from the Twitter API. Only opts.q and cb are required.
   * The callback function will be called with tweets whenever a certain set of
   * search results have been returned. The search function will keep fetching
   * results until it has fetched opts.count tweets or there are no more to
   * fetch.
   * @param {Object} opts  The options to use when doing the search
   * @param {function} cb  A callback that should receive three arguments: err, tweets, and nextToken
   * @param {string} opts.q  The query to use in the search
   * @param {string} opts.nextToken  A next token to use to get more results
   * @param {string} opts.count  The total number of tweets to fetch (100)
   * @param {boolean} opts.all  Whether to search the full archive (false)
   * @param {string} opts.startDate  A Date or string w/ optional time to search from
   * @param {string} opts.endDate  A Date or string w/ optional time to search until
   * @param {string} opts.sinceId  Get tweets that match query since a tweet id
   * @param {string} opts.maxId  Get tweets that match query until a tweet id
   * @param {boolean} opts.once  Just get one set of results, do not page
   * @returns {Promise}  A promise to indicate the search is complete.
   */

  search(opts, cb) {
    log.info('searching for', opts)

    // count is the total number of tweets to return across all API requests
    const count = opts.count || 101

    const params =  {
      ...EVERYTHING,
      "query": opts.q,
      "max_results": 100,
    }

    let endpoint = 'tweets/search/recent'

    if (opts.all) {
      endpoint = 'tweets/search/all'
      params.start_time = '2006-03-21T00:00:00Z'
    }

    if (opts.startDate) {
      const t = new Date(opts.startDate)
      params.start_time = t.toISOString().replace(/\.\d+Z$/, 'Z')
    }

    if (opts.endDate) {
      const t = new Date(opts.endDate) 
      if (t > new Date()) {
        log.info('ignoring search endDate in the future') 
      } else {
        params.end_time = t.toISOString().replace(/\.\d+Z$/, 'Z')
      }
    }

    if (opts.sinceId) {
      params.since_id = opts.sinceId
      delete params.start_time
    } 

    if (opts.maxId) {
      params.until_id = opts.maxId
    }

    if (opts.nextToken) {
      params.next_token = opts.nextToken
    }

    const recurse = (token, total) => {
      if (token) {
        params.next_token = token
      }
      log.info(`running search ${JSON.stringify(params)}`)
      this.twitterV2app.get(endpoint, params).then((resp) => {
        if (resp.data) {
          const nextToken = resp.meta.next_token
          const tweets = flatten(resp).data
          const newTotal = total + tweets.length
          cb(null, tweets.map(t => this.extractTweet(t)), nextToken)
            .then(() => {
              if (! opts.once && newTotal < count && nextToken) {
                recurse(nextToken, newTotal)
              } else {
                cb(null, [], null)
              }
            })
        } else {
          log.warn(`received search response with no data stanza`)
          cb(null, [], null)
        }
      })
      .catch(err => {
        log.error(`error during search: ${err.message}`)
        cb(err.message, null, null)
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
    log.info('starting filter stream ...')

    let err = 0
    while (true) {
      try {
        this.stream = this.twitterV2app.stream('tweets/search/stream', EVERYTHING)
        break
      } catch (e) {
        err += 1
        const secs = err ** 2
        log.info(`caught ${e} while connecting to stream, sleeping ${secs}`)
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
        await timer(1000)
        this.filter(cb)
      }
    } catch (error) {
      if (error.message && error.message.match(/stream unresponsive/i)) {
        log.warn(`caught stream unresponsive error, sleeping and reconnecting`)
        await timer(1000)
        this.filter(cb)
      } else {
        log.error(`unexpected stream error, unable to reconnect ${error}`)
      }
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
    if (t.geo) {
      place = {
        id: t.geo.place_id,
        coordinates: t.geo.coordinates
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
          // It would be nice to get the mp4 URL here but Twitter's V2 API
          // doesn't make that available for now we can look it up
          // using the tweet id and the media_key against the v1.1 API
          videos.push(e.media_key)
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

  async hydrate(tweetIds) {
    // note: at some point it might be useful to be able to hydrate for v2 as well
    if (! tweetIds || tweetIds.length == 0) {
      return null
    }
    try {
      const resp = await this.twitApp.get('statuses/lookup', {id: tweetIds.join(',')})
      if (resp.data && resp.data.length > 0) {
        return resp.data
      } else {
        return null
      }
    } catch (err) {
      // note: should raise quota exceeded error here?
      log.error(`caught error during statuses/lookup call: ${err}`)
      return null
    }
  }
}

export async function isAcademic(consumerKey, consumerSecret) {
  try {
    const twtr = new TwitterV2({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    })
    const endpoint = 'tweets/search/all'
    const params = {
      query: 'hi', 
      start_time: '2006-03-21T00:00:00Z',
      end_time: '2007-03-21T00:00:00Z'
    }
    log.info(endpoint, params)
    const resp = await twtr.get(endpoint, params)
    if (resp.data && resp.data.length > 0) {
      log.info('app keys have academic search')
      return true
    } else {
      log.info('app keys do not have academic search: no results') 
      return false
    }
  } catch (err) {
    log.info(`app keys do not have academic search turned on: ${err}`)
    return false
  }
}
