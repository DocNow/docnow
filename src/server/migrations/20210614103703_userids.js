exports.up = async knex => {
  return knex.schema.alterTable('tweet', table => {
    table.string('userId', 30).nullable()
  })
}

exports.down = async knex => {
  return knex.schema
    .alterTable('tweet', table => {
      table.dropColumn('userId')
    })
}
