const passport = require("passport")

exports.up = async knex => {
  return knex.raw(`
    UPDATE tweet t1
    SET user_id = t2.json -> 'user' ->> 'id'
    FROM tweet t2
    WHERE t1.tweet_id = t2.tweet_id
  `)
}

exports.down = async knex => {
  return knex.raw('UPDATE tweet SET user_id = NULL')
}