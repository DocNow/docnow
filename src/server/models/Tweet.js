const { Model } = require('objection')

class Tweet extends Model {

  static get tableName() {
    return 'tweet'
  }

}

module.exports = Tweet