const { Model } = require('objection')
const User = require('./User')
const Query = require('./Query')

class Search extends Model {

  static get tableName() {
    return 'search'
  }

  static get relationMappings() {
    return {
      queries: {
        relation: Model.HasManyRelation,
        modelClass: Query, 
        join: {
          from: 'search.id',
          to: 'query.search_id'
        }
      },
      creator: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'search.user_id',
          to: 'user.id'
        }
      }
    }
  }

}

module.exports = Search