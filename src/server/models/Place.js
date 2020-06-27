const { Model } = require('objection')

class Place extends Model {
  static get tableName() {
    return 'place'
  }
}

module.exports = Place