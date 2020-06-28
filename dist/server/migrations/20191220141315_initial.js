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
    table.string('email');
    table.string('location');
    table["boolean"]('admin').defaultsTo(false);
    table.integer('tweetQuota').defaultsTo(50000);
    table.integer('twitterUserId').notNullable();
    table.string('twitterScreenName').notNullable();
    table.string('twitterAccessToken').notNullable();
    table.string('twitterAccessTokenSecret').notNullable();
    table["boolean"]('isSuperUser').defaultsTo(false);
    table["boolean"]('active').defaultsTo(false);
  }).createTable('place', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable();
    table.string('country');
    table.string('countryCode');
    table.string('parentId');
  }).createTable('trend', function (table) {
    table.increments('id').primary();
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
  }).createTable('collection', function (table) {
    table.increments('id').primary();
    table.datetime('created').defaultsTo(knex.fn.now());
    table.datetime('updated').notNullable();
    table.integer('userId').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table["boolean"]('active').defaultTo(false);
    table.foreign('userId').references('id').inTable('user');
  }).createTable('query', function (table) {
    table.increments('id').primary();
    table.integer('collectionId').notNullable();
    table.datetime('created').defaultsTo(knex.fn.now());
    table.text('text').notNullable();
    table.foreign('collectionId').references('id').inTable('collection');
  }).createTable('tweet', function (table) {
    table.increments('id').primary();
    table.string('tweetId', 30).notNullable();
    table.integer('collectionId').notNullable();
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
    table.foreign('collectionId').references('id').inTable('collection');
  }).createTable('webpage', function (table) {
    table.increments('id').primary();
    table.text('url').notNullable();
    table.integer('status').notNullable();
    table.text('title');
    table.text('description');
    table.text('image');
  }).createTable('tweetWebpage', function (table) {
    table.integer('tweetId').notNullable();
    table.integer('webpageId').notNullable();
    table.foreign('tweetId').references('id').inTable('tweet');
    table.foreign('webpageId').references('id').inTable('webpage');
    table.primary(['tweetId', 'webpageId']);
  }).createTable('hashtag', function (table) {
    table.string('name', 255).primary();
    table.datetime('created').defaultsTo(knex.fn.now());
  }).createTable('tweetHashtag', function (table) {
    table.integer('tweetId').notNullable();
    table.string('hashtagName', 255).notNullable();
    table.foreign('tweetId').references('id').inTable('tweet');
    table.foreign('hashtagName').references('name').inTable('hashtag');
    table.primary(['tweetId', 'hashtagName']);
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
              table.dropForeign(null, 'query_collectionid_foreign');
            }).table('collection', function (table) {
              table.dropForeign(null, 'collection_userid_foreign');
            }).table('tweet', function (table) {
              table.dropForeign(null, 'tweet_collectionid_foreign');
            }).table('tweet_webpage', function (table) {
              table.dropForeign(null, 'tweetwebpage_tweetid_foreign');
              table.dropForeign(null, 'tweetwebpage_webpageid_foreign');
            }).table('tweet_hashtag', function (table) {
              table.dropForeign(null, 'tweethashtag_tweetid_foreign');
              table.dropForeign(null, 'tweethashtag_hashtagname_foreign');
            }).dropTable('setting').dropTable('userPlace').dropTable('place').dropTable('user').dropTable('trend').dropTable('collection').dropTable('query').dropTable('tweet').dropTable('webpage').dropTable('hashtag').dropTable('tweetHashtag').dropTable('tweetWebpage'));

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