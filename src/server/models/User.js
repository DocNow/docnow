const path = require('path')
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
      },
      searches: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Search'), 
        join: {
          from: 'user.id',
          to: 'search.user_id'
        }
      }
    }
  }

  isAdmin() {
    return this.admin || this.isSuperUser
  }

}

module.exports = User
