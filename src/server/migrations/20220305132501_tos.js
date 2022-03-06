exports.up = async knex => {
  await knex.schema.alterTable('user', table => {
    table.boolean('termsOfService')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('termsOfService')
  })
}
