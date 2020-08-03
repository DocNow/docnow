const { Model } = require('objection')
const Search = require('./Search')

class Query extends Model {

  static get tableName() {
    return 'query'
  }

  static get relationMappings() {
    return {
      search: {
        relation: Model.HasOneRelation,
        modelClass: Search,
        join: {
          from: 'query.search_id',
          to: 'search.id'
        }
      }
    }
  }

}

module.exports = Query