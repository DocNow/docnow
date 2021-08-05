exports.up = async knex => {
  return knex.schema
    .createTable('searchJob', table => {
      table.increments('id').primary()
      table.integer('queryId').notNullable()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.datetime('updated').defaultsTo(knex.fn.now())
      table.datetime('started')
      table.datetime('ended')
      table.string('tweetId')
      table.integer('tweets')
      table.foreign('queryId')
        .references('id')
        .inTable('query')
        .onDelete('CASCADE')
    })
}

exports.down = async knex => {
  return knex.schema
    .dropTable('searchJob')
}