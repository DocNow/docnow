exports.up = async knex => {
  await knex.schema.alterTable('search_job', table => {
    table.string('type').defaultTo('stream')
  })
  return knex.schema.alterTable('search_job', table => {
    table.string('type').notNullable().alter()
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('search_job', table => {
    table.dropColumn('type')
  })
}
