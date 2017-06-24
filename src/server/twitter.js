import Twit from 'twit'

export class Twitter {

  constructor(keys={}) {
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

  getTrendsAtPlace(woeId) {
    return new Promise(
      (resolve, reject) => {
        this.twit.get('trends/place', {id: woeId})
          .then((resp) => {
            const place = {
              id: resp.data[0].locations[0].woeid,
              name: resp.data[0].locations[0].name,
              trends: []
            }
            for (let trend of resp.data[0].trends) {
              place.trends.push({name: trend.name, tweets: trend.tweet_volume})
            }
            resolve(place)
          })
      }
    )
  }
}
