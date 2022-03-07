exports.up = async knex => {
  await knex.schema.alterTable('user', table => {
    table.boolean('termsOfService').defaultsTo(false)
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('termsOfService')
  })
}
