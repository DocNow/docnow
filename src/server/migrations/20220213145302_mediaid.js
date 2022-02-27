exports.up = async knex => {
  await knex.schema.alterTable('tweet_url', table => {
    table.string('mediaId', 30)
    table.index('mediaId')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('search_job', table => {
    table.dropIndex('mediaId')
    table.dropColumn('mediaId')
  })
}
