exports.up = async knex => {
  return knex.schema
    .alterTable('action', table => {
      table.integer('tweetId').nullable().alter()
      table.dropForeign(null, 'action_tweetid_foreign')
      table.foreign('tweetId')
        .references('id')
        .inTable('tweet')
        .onDelete('SET NULL')
    })
}

exports.down = async knex => {
  return knex.schema
    .alterTable('action', table => {
      table.dropForeign(null, 'action_tweetid_foreign')
      table.integer('tweetId').notNullable().alter()
      table.foreign('tweetId')
        .references('id')
        .inTable('tweet')
    })
}