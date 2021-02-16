exports.up = async knex => {
  return knex.schema.table('search', table => {
    table.datetime('public')
  })
}

exports.down = async knex => {
  return knex.schema.table('search', table => {
    table.dropColumn('public')
  })
}