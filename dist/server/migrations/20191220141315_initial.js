"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

exports.up = function (knex) {
  return knex.schema.createTable('setting', function (table) {
    table.increments('id').primary();
    table.string('name').unique();
    table.string('value');
    table.timestamp('created');
  }).createTable('user', function (table) {
    table.increments('id').primary();
    table.datetime('created').defaultsTo(knex.fn.now());
    table.datetime('updated').defaultsTo(knex.fn.now());
    table.string('name');
    table["boolean"]('active').defaultsTo(false);
    table["boolean"]('admin').defaultsTo(false);
    table["boolean"]('isSuperUser').defaultsTo(false);
    table.integer('tweetQuota').defaultsTo(50000);
    table.string('location');
    table.string('email');
    table.string('description');
    table.integer('twitterUserId').notNullable();
    table.string('twitterScreenName').notNullable();
    table.string('twitterAccessToken').notNullable();
    table.string('twitterAccessTokenSecret').notNullable();
    table.string('twitterAvatarUrl');
  }).createTable('place', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable();
    table.string('country');
    table.string('countryCode');
    table.string('parentId');
  }).createTable('trend', function (table) {
    table.increments('id').primary(); // don't let pg assign created because we need to query it precisely 
    // and pg's precision is greater than the js Date object.

    table.datetime('created').notNullable();
    table.string('name').notNullable();
    table.integer('count').notNullable();
    table.integer('placeId').notNullable();
    table.foreign('placeId').references('id').inTable('place');
  }).createTable('userPlace', function (table) {
    table.increments('id').primary();
    table.integer('position').notNullable();
    table.integer('userId').notNullable();
    table.integer('placeId').notNullable();
    table.foreign('userId').references('id').inTable('user');
    table.foreign('placeId').references('id').inTable('place');
  }).createTable('search', function (table) {
    table.increments('id').primary();
    table.datetime('created').defaultsTo(knex.fn.now());
    table.datetime('updated').notNullable();
    table.integer('user_id').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table["boolean"]('saved').defaultsTo(false);
    table["boolean"]('active').defaultTo(false);
    table["boolean"]('archived').defaultTo(false);
    table["boolean"]('archiveStarted').defaultTo(false);
    table.string('maxTweetId', 30);
    table.foreign('user_id').references('id').inTable('user');
  }).createTable('query', function (table) {
    table.increments('id').primary();
    table.integer('searchId').notNullable();
    table.datetime('created').defaultsTo(knex.fn.now());
    table.json('value').notNullable();
    table.foreign('searchId').references('id').inTable('search').onDelete('CASCADE');
  }).createTable('tweet', function (table) {
    table.increments('id').primary();
    table.string('tweetId', 30).notNullable();
    table.integer('searchId').notNullable();
    table.datetime('created').notNullable();
    table.string('screenName').notNullable();
    table.text('text').notNullable();
    table.string('retweetId', 30);
    table.string('quoteId', 30);
    table.integer('retweetCount').defaultsTo(0);
    table.integer('replyCount').defaultsTo(0);
    table.integer('quoteCount').defaultsTo(0);
    table.integer('likeCount').defaultsTo(0);
    table.string('replyToTweetId', 30);
    table.string('replyToUserId', 30);
    table.integer('imageCount').defaultsTo(0);
    table.integer('videoCount').defaultsTo(0);
    table.string('language', 10).notNullable();
    table.jsonb('json').notNullable();
    table.foreign('searchId').references('id').inTable('search').onDelete('CASCADE');
  }).createTable('tweetHashtag', function (table) {
    table.integer('tweetId').notNullable();
    table.string('name', 255).notNullable();
    table.primary(['tweetId', 'name']);
    table.index('name');
    table.foreign('tweetId').references('id').inTable('tweet').onDelete('CASCADE');
  }).createTable('tweetUrl', function (table) {
    table.integer('tweetId').notNullable();
    table.string('url', 1024).notNullable();
    table.enu('type', ['page', 'image', 'video']).notNullable();
    table.primary(['tweetId', 'url', 'type']);
    table.index('url');
    table.foreign('tweetId').references('id').inTable('tweet').onDelete('CASCADE');
  }).createTable('webpage', function (table) {
    table.increments('id').primary();
    table.text('url').notNullable();
    table.integer('status').notNullable();
    table.text('title');
    table.text('description');
    table.text('image');
  });
};

exports.down = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(knex) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", knex.schema.table('user_place', function (table) {
              table.dropForeign(null, 'userplace_placeid_foreign');
              table.dropForeign(null, 'userplace_userid_foreign');
            }).table('trend', function (table) {
              table.dropForeign(null, 'trend_placeid_foreign');
            }).table('query', function (table) {
              table.dropForeign(null, 'query_searchid_foreign');
            }).table('search', function (table) {
              table.dropForeign(null, 'search_user_id_foreign');
            }).table('tweet', function (table) {
              table.dropForeign(null, 'tweet_searchid_foreign');
            }).table('tweet_url', function (table) {
              table.dropForeign(null, 'tweeturl_tweetid_foreign');
            }).table('tweet_hashtag', function (table) {
              table.dropForeign(null, 'tweethashtag_tweetid_foreign');
            }).dropTable('setting').dropTable('userPlace').dropTable('place').dropTable('user').dropTable('trend').dropTable('search').dropTable('query').dropTable('tweet').dropTable('webpage').dropTable('tweetHashtag').dropTable('tweetUrl'));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();