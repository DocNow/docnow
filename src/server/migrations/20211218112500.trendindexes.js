exports.up = async knex => {
  return knex.schema.alterTable('trend', table => {
    table.index(['created', 'placeId'])
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('trend', table => {
    table.dropIndex(['created', 'placeId'])
  })
}
