"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

exports.up = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(knex) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", knex.schema.createTable('action', function (table) {
              table.increments('id').primary();
              table.integer('userId').notNullable();
              table.integer('searchId').notNullable();
              table.integer('tweetId').notNullable();
              table.string('name').notNullable();
              table.text('comment');
              table.datetime('created').defaultsTo(knex.fn.now());
              table.foreign('tweetId').references('id').inTable('tweet');
              table.foreign('searchId').references('id').inTable('search');
              table.foreign('userId').references('id').inTable('user');
            }));

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

exports.down = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(knex) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", knex.schema.table('action', function (table) {
              table.dropForeign(null, 'action_tweetid_foreign');
              table.dropForeign(null, 'action_userid_foreign');
              table.dropForeign(null, 'action_searchid_foreign');
            }).dropTable('action'));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();