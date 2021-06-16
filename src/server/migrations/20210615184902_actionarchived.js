exports.up = async knex => {
  return knex.schema.alterTable('action', table => {
    table.datetime('archived').nullable()
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('action', table => {
    table.dropColumn('archived')
  })
}
