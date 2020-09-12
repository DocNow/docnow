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

  searchQuery() {
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

  trackQuery() {
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
    return queryParts.join(',')
  }

}

module.exports = Query