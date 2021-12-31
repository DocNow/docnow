exports.up = async knex => {
  return knex.schema.alterTable('tweet', table => {
    table.index(['searchId', 'screenName'])
    // this index is no longer needed with the new one above
    table.dropIndex(['searchId'])
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('tweet', table => {
    table.dropIndex(['searchId', 'screenName'])
    table.index(['searchId'])
  })
}
