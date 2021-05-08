exports.up = async knex => {
  return knex.schema.alterTable('tweet', t => {
    t.index(['searchId', 'screenName'])
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('tweet', t => {
    t.dropIndex(['searchId', 'screenName'])
  })
}
