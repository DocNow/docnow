const { Model } = require('objection')
const Place = require('./Place')

class Trend extends Model {

  static get tableName() {
    return 'trend'
  }

  static get relationMappings() {
    return {
      place: {
        relation: Model.BelongsToOneRelation,
        modelClass: Place,
        join: {
          from: 'trend.place_id',
          to: 'place.id'
        }
      }
    }
  }

}

module.exports = Trend