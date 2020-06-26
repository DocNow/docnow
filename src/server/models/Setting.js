const { Model } = require('objection')

class Setting extends Model {
  static get tableName() {
    return 'setting'
  }
}

module.exports = Setting