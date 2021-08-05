const { Model } = require('objection')

class SearchJob extends Model {

  static get tableName() {
    return 'searchJob'
  }

}

module.exports = SearchJob