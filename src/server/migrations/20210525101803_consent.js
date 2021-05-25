exports.up = async knex => {
  return knex.schema
    .createTable('action', table => {
      table.increments('id').primary()
      table.integer('userId').notNullable()
      table.integer('searchId').notNullable()
      table.integer('tweetId').notNullable()
      table.string('name').notNullable()
      table.text('comment')
      table.datetime('created').defaultsTo(knex.fn.now())
      table.foreign('tweetId').references('id').inTable('tweet')
      table.foreign('searchId').references('id').inTable('search')
      table.foreign('userId').references('id').inTable('user')
    })
}

exports.down = async knex => {
  return knex.schema
    .table('action', table => {
      table.dropForeign(null, 'action_tweetid_foreign')
      table.dropForeign(null, 'action_userid_foreign')
      table.dropForeign(null, 'action_searchid_foreign')
     })
    .dropTable('action')
}
