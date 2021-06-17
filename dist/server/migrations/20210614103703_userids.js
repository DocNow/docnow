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
            _context.next = 2;
            return knex.schema.alterTable('tweet', function (table) {
              table.string('userId', 30).nullable();
              table.index('userId');
            });

          case 2:
            _context.next = 4;
            return knex.raw("\n    UPDATE tweet AS t1 \n    SET user_id = (\n      SELECT json -> 'user' ->> 'id' \n      FROM tweet AS t2 \n      WHERE t1.tweet_id = t2.tweet_id \n      LIMIT 1\n    )\n  ");

          case 4:
            return _context.abrupt("return", knex.schema.alterTable('tweet', function (table) {
              table.dropIndex('userId');
              table.string('userId', 30).notNullable().alter();
            }));

          case 5:
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
            return _context2.abrupt("return", knex.schema.alterTable('tweet', function (table) {
              table.dropColumn('userId');
            }));

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