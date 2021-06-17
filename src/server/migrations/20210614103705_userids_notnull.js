exports.up = async knex => {
  return knex.schema.alterTable('tweet', table => {
    table.index('userId')
    table.string('userId', 30).notNullable().alter()
  })
}

exports.down = async knex => {
  return knex.schema
    .alterTable('tweet', table => {
      table.dropIndex('userId')
      table.string('userId', 30).nullable().alter()
    })
}