exports.up = async knex => {
  await knex.schema.alterTable('tweet_url', table => {
    table.string('mediaId', 30)
    table.string('thumbnailUrl', 1024)
    table.index('mediaId')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('tweet_url', table => {
    table.dropIndex('mediaId')
    table.dropColumn('mediaId')
    table.dropColumn('thumbnailUrl')
  })
}
