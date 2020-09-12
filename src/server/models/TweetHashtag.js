const { Model } = require('objection')

class TweetHashtag extends Model {

  static get idColumn() {
    return ['tweetId', 'name']
  }

  static get tableName() {
    return 'tweetHashtag'
  }

}

module.exports = TweetHashtag