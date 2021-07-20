const { Model } = require('objection')
const Tweet = require('./Tweet')
const User = require('./User')

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
      },
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'action.userId',
          to: 'user.id'
        }
      }
    }
  }

}

module.exports = Action