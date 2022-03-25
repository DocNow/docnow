exports.up = async knex => {
  await knex.schema.alterTable('action', table => {
    table.dropForeign('searchId')
    table.foreign('searchId')
      .references('id')
      .inTable('search')
      .onDelete('CASCADE')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('action', table => {
    table.dropForeign('searchId')
    table.foreign('searchId')
      .references('id')
      .inTable('search')
   })
}
