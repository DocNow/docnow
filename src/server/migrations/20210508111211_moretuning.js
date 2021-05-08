exports.up = async knex => {
  return knex.schema.alterTable('tweet', t => {
    t.dropIndex(['searchId', 'screenName'])
    t.index('searchId')
    t.index('screenName')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('tweet', t => {
    t.dropIndex('searchId')
    t.dropIndex('screenName')
    t.index(['searchId', 'screenName'])
  })
}
