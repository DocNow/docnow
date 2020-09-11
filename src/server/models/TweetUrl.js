const { Model } = require('objection')

class TweetUrl extends Model {

  static get tableName() {
    return 'tweetUrl'
  }

  static get idColumn() {
    return ['tweetId', 'url', 'type']
  }

}

module.exports = TweetUrl