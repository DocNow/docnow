exports.up = async knex => {

  // create the user_id column (allow nulls) 
  await knex.schema.alterTable('tweet', table => {
    table.string('userId', 30).nullable()
    table.index('userId')
  })

  // populate the user_id using the tweet JSON
  await knex.raw(`
    UPDATE tweet AS t1 
    SET user_id = (
      SELECT json -> 'user' ->> 'id' 
      FROM tweet AS t2 
      WHERE t1.tweet_id = t2.tweet_id 
      LIMIT 1
    )
  `)

  // make user_ud not null
  return knex.schema.alterTable('tweet', table => {
    table.dropIndex('userId')
    table.string('userId', 30).notNullable().alter()
  })

}

exports.down = async knex => {
  return knex.schema
    .alterTable('tweet', table => {
      table.dropColumn('userId')
    })
}
