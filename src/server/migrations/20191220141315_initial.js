exports.up = knex => {

  return knex.schema

    .createTable('setting', table => {
      table.increments('id').primary()
      table.string('name').unique()
      table.string('value')
      table.timestamp('created')
    })

    .createTable('user', table => {
      table.increments('id').primary()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.datetime('updated').defaultsTo(knex.fn.now())
      table.string('name')
      table.boolean('active').defaultsTo(false)
      table.boolean('admin').defaultsTo(false)
      table.boolean('isSuperUser').defaultsTo(false)
      table.integer('tweetQuota').defaultsTo(50000)
      table.string('location')
      table.string('email')
      table.string('description')
      table.integer('twitterUserId').notNullable()
      table.string('twitterScreenName').notNullable()
      table.string('twitterAccessToken').notNullable()
      table.string('twitterAccessTokenSecret').notNullable()
      table.string('twitterAvatarUrl')
    })

    .createTable('place', table => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('country')
      table.string('countryCode')
      table.string('parentId')
    })

    .createTable('trend', table => {
      table.increments('id').primary()
      // don't let pg assign created because we need to query it precisely 
      // and pg's precision is greater than the js Date object.
      table.datetime('created').notNullable()
      table.string('name').notNullable()
      table.integer('count').notNullable()
      table.integer('placeId').notNullable()
      table.foreign('placeId').references('id').inTable('place')
    })

    .createTable('userPlace', table => {
      table.increments('id').primary()
      table.integer('position').notNullable()
      table.integer('userId').notNullable()
      table.integer('placeId').notNullable()
      table.foreign('userId').references('id').inTable('user')
      table.foreign('placeId').references('id').inTable('place')
    })

    .createTable('search', table => {
      table.increments('id').primary()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.datetime('updated').notNullable()
      table.integer('user_id').notNullable()
      table.string('title').notNullable()
      table.text('description')
      table.boolean('saved').defaultsTo(false)
      table.boolean('active').defaultTo(false)
      table.boolean('archived').defaultTo(false)
      table.boolean('archiveStarted').defaultTo(false)
      table.string('maxTweetId', 30)
      table.foreign('user_id').references('id').inTable('user')
    })

    .createTable('query', table => {
      table.increments('id').primary()
      table.integer('searchId').notNullable()
      table.datetime('created').defaultsTo(knex.fn.now())
      table.json('value').notNullable()
      table.foreign('searchId').references('id').inTable('search')
    })

    .createTable('tweet', table => {
      table.increments('id').primary()
      table.string('tweetId', 30).notNullable()
      table.integer('searchId').notNullable()
      table.string('screenName').notNullable()
      table.text('text').notNullable()
      table.string('retweetId', 30)
      table.string('quoteId', 30)
      table.integer('retweetCount').defaultsTo(0)
      table.integer('replyCount').defaultsTo(0)
      table.integer('quoteCount').defaultsTo(0)
      table.integer('likeCount').defaultsTo(0)
      table.string('replyToTweetId', 30)
      table.string('replyToUserId', 30)
      table.integer('imageCount').defaultsTo(0)
      table.integer('videoCount').defaultsTo(0)
      table.string('language', 10).notNullable()
      table.jsonb('json').notNullable()
      table.foreign('searchId').references('id').inTable('search')
    })

    .createTable('webpage', table => {
      table.increments('id').primary()
      table.text('url').notNullable()
      table.integer('status').notNullable()
      table.text('title')
      table.text('description')
      table.text('image')
    })

    .createTable('tweetWebpage', table => {
      table.integer('tweetId').notNullable()
      table.integer('webpageId').notNullable()
      table.foreign('tweetId').references('id').inTable('tweet')
      table.foreign('webpageId').references('id').inTable('webpage')
      table.primary(['tweetId', 'webpageId'])
    })

    .createTable('hashtag', table => {
      table.string('name', 255).primary()
      table.datetime('created').defaultsTo(knex.fn.now())
    })

    .createTable('tweetHashtag', table => {
      table.integer('tweetId').notNullable()
      table.string('hashtagName', 255).notNullable()
      table.foreign('tweetId').references('id').inTable('tweet')
      table.foreign('hashtagName').references('name').inTable('hashtag')
      table.primary(['tweetId', 'hashtagName'])
    })
}

exports.down = async (knex) => {

  // need to disable all the foreign keys before deleting the tables

  return knex.schema
    .table('user_place', table => {
      table.dropForeign(null, 'userplace_placeid_foreign')
      table.dropForeign(null, 'userplace_userid_foreign')
    })
    .table('trend', table => {
      table.dropForeign(null, 'trend_placeid_foreign')
    })
    .table('query', table => {
      table.dropForeign(null, 'query_searchid_foreign')
    })
    .table('search', table => {
      table.dropForeign(null, 'search_user_id_foreign')
    })
    .table('tweet', table => {
      table.dropForeign(null, 'tweet_searchid_foreign')
    })
    .table('tweet_webpage', table => {
      table.dropForeign(null, 'tweetwebpage_tweetid_foreign')
      table.dropForeign(null, 'tweetwebpage_webpageid_foreign')
    })
    .table('tweet_hashtag', table => {
      table.dropForeign(null, 'tweethashtag_tweetid_foreign')
      table.dropForeign(null, 'tweethashtag_hashtagname_foreign')
    })
    .dropTable('setting')
    .dropTable('userPlace')
    .dropTable('place')
    .dropTable('user')
    .dropTable('trend')
    .dropTable('search')
    .dropTable('query')
    .dropTable('tweet')
    .dropTable('webpage')
    .dropTable('hashtag')
    .dropTable('tweetHashtag')
    .dropTable('tweetWebpage')
}
