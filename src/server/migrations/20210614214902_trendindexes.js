exports.up = async knex => {
  return knex.schema.alterTable('trend', table => {
    table.index('placeId')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('trend', table => {
    table.dropIndex('placeId')
  })
}
