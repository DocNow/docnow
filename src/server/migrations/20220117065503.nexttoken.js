exports.up = async knex => {
  return knex.schema.alterTable('search_job', table => {
    table.string('nextToken')
    table.dropColumn('tweets')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('search_job', table => {
    table.dropColumn('nextToken')
    table.integer('tweets')
  })
}
