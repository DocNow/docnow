exports.up = function(knex) {
  return knex.schema

    .createTable('setting', table => {
      table.increments('id').primary()
      table.string('name')
      table.string('value')
    })

    .createTable('user', table => {
      table.increments('id').primary()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.datetime('updated').notNullable()
      table.string('email')
      table.boolean('admin').defaultsTo(false)
      table.integer('tweet_quota').notNullable()
      table.string('twitter_screen_name').notNullable()
      table.string('twitter_consumer_key').notNullable()
      table.string('twitter_consumer_secret').notNullable()
    })

    .createTable('place', table => {
      table.increments('id').primary()
      table.string('woe_id').notNullable()
      table.string('name').notNullable()
    })

    .createTable('trend', table => {
      table.increments('id').primary()
      table.integer('count').notNullable()
      table.integer('place_id').notNullable()
      table.foreign('place_id').references('id').inTable('place')
    })

    .createTable('user_place', table => {
      table.increments('id').primary()
      table.integer('position').notNullable()
      table.integer('user_id').notNullable()
      table.integer('place_id').notNullable()
      table.foreign('user_id').references('id').inTable('user')
      table.foreign('place_id').references('id').inTable('place')
    })

    .createTable('collection', table => {
      table.increments('id').primary()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.datetime('updated').notNullable()
      table.integer('user_id').notNullable()
      table.string('title').notNullable()
      table.text('description')
      table.boolean('active').defaultTo(false)
      table.foreign('user_id').references('id').inTable('user')
    })

    .createTable('query', table => {
      table.increments('id').primary()
      table.integer('collection_id').notNullable()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.text('text').notNullable()
      table.foreign('collection_id').references('id').inTable('collection')
    })

    .createTable('tweet', table => {
      table.increments('id').primary()
      table.string('tweet_id', 30).notNullable()
      table.integer('collection_id').notNullable()
      table.string('screen_name').notNullable()
      table.text('text').notNullable()
      table.string('retweet_id', 30)
      table.string('quote_id', 30)
      table.integer('retweet_count').defaultsTo(0)
      table.integer('reply_count').defaultsTo(0)
      table.integer('quote_count').defaultsTo(0)
      table.integer('like_count').defaultsTo(0)
      table.string('reply_to_tweet_id', 30)
      table.string('reply_to_user_id', 30)
      table.integer('image_count').defaultsTo(0)
      table.integer('video_count').defaultsTo(0)
      table.string('language', 10).notNullable()
      table.jsonb('json').notNullable()
      table.foreign('collection_id').references('id').inTable('collection')
    })

    .createTable('webpage', table => {
      table.increments('id').primary()
      table.text('url').notNullable()
      table.integer('status').notNullable()
      table.text('title')
      table.text('description')
      table.text('image')
    })

    .createTable('tweet_webpage', table => {
      table.integer('tweet_id').notNullable()
      table.integer('webpage_id').notNullable()
      table.foreign('tweet_id').references('id').inTable('tweet')
      table.foreign('webpage_id').references('id').inTable('webpage')
      table.primary(['tweet_id', 'webpage_id'])
    })

    .createTable('hashtag', table => {
      table.string('name', 255).primary()
      table.datetime('created').defaultsTo(knex.fn.now())
    })

    .createTable('tweet_hashtag', table => {
      table.integer('tweet_id').notNullable()
      table.string('hashtag_name', 255).notNullable()
      table.foreign('tweet_id').references('id').inTable('tweet')
      table.foreign('hashtag_name').references('name').inTable('hashtag')
      table.primary(['tweet_id', 'hashtag_name'])
    })
}

exports.down = function(knex) {
  return knex.schema 
    .dropTable('tweets') 
}
