exports.up = async knex => {
  return knex.schema.alterTable('setting', t => {
    t.text('value').alter()
  })
}

exports.down = async knex => {
  return knex.schema.alterTable('setting', t => {
    t.string('value').alter()
  })
}
