const { Model } = require('objection')

class SearchJob extends Model {

  static get tableName() {
    return 'searchJob'
  }

  static get relationMappings() {
    const Query = require('./Query')
    return {
      query: {
        relation: Model.HasOneRelation,
        modelClass: Query,
        join: {
          from: 'searchJob.queryId',
          to: 'query.id'
        }
      }
    }
  }

}

module.exports = SearchJob
