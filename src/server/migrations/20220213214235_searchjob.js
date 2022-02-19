exports.up = async knex => {
  await knex.schema.alterTable('search_job', table => {
    table.datetime('tweetsStart')
    table.datetime('tweetsEnd')
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('search_job', table => {
    table.dropColumn('tweetsStart')
    table.dropColumn('tweetsEnd')
  })
}
