const { Model } = require('objection')
const Place = require('./Place')

class User extends Model {

  static get tableName() {
    return 'user'
  }

  static get relationMappings() {
    return {
      places: {
        relation: Model.ManyToManyRelation,
        modelClass: Place,
        join: {
          from: 'user.id',
          through: {
            from: 'user_place.user_id',
            to: 'user_place.place_id',
            extra: ['position']
          },
          to: 'place.id'
        }
      }
    }
  }

}

module.exports = User