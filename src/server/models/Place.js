const { Model } = require('objection')
const Trend = require('./Trend')

class Place extends Model {
  static get tableName() {
    return 'place'
  }

  static get relationMappings() {
    return {
      trends: {
        relation: Model.HasManyRelation,
        modelClass: Trend,
        join: {
          from: 'place.id',
          to: 'trend.place_id'
        }
      }
    }
  }

}

module.exports = Place