const { Model } = require('objection')
const Tweet = require('./Tweet')

class Action extends Model {

  static get tableName() {
    return 'action'
  }
 
  static get relationMappings() {
    return {
      tweet: {
        relation: Model.HasOneRelation,
        modelClass: Tweet,
        join: {
          from: 'action.tweetId',
          to: 'tweet.id'
        }
      }
    }
  }

}

module.exports = Action