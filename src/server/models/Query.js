const { Model } = require('objection')
const SearchJob = require('./SearchJob')

class Query extends Model {

  static get tableName() {
    return 'query'
  }

  static get relationMappings() {
    const Search = require('./Search')
    return {
      search: {
        relation: Model.HasOneRelation,
        modelClass: Search,
        join: {
          from: 'query.search_id',
          to: 'search.id'
        }
      },
      searchJobs: {
        relation: Model.HasManyRelation,
        modelClass: SearchJob, 
        join: {
          from: 'query.id',
          to: 'searchJob.queryId'
        }
      }
    }
  }

  twitterQuery() {
    const queryParts = []
    for (const term of this.value.or) {
      if (term.type === 'keyword') {
        queryParts.push(term.value)
      } else if (term.type === 'user') {
        queryParts.push('@' + term.value)
      } else if (term.type === 'phrase') {
        queryParts.push(`"${term.value}"`)
      } else if (term.type === 'hashtag') {
        queryParts.push(term.value)
      } else {
        queryParts.push(term.value)
      }
    }
    return queryParts.join(' OR ')
  }

}

module.exports = Query
