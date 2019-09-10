"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _logger = _interopRequireDefault(require("../server/logger"));

var _db = require("../server/db");

var _commander = _interopRequireDefault(require("commander"));

function main(_x) {
  return _main.apply(this, arguments);
}

function _main() {
  _main = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(cmd) {
    var db, users, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _logger["default"].info('fetching users');

            db = new _db.Database();
            _context.next = 4;
            return db.getUsers();

          case 4:
            users = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 8;
            _iterator = users[Symbol.iterator]();

          case 10:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 19;
              break;
            }

            user = _step.value;

            if (!cmd.quota) {
              _context.next = 16;
              break;
            }

            user = (0, _objectSpread2["default"])({}, user, {
              tweetQuota: parseInt(cmd.quota)
            });
            _context.next = 16;
            return db.updateUser(user);

          case 16:
            _iteratorNormalCompletion = true;
            _context.next = 10;
            break;

          case 19:
            _context.next = 25;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](8);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 25:
            _context.prev = 25;
            _context.prev = 26;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 28:
            _context.prev = 28;

            if (!_didIteratorError) {
              _context.next = 31;
              break;
            }

            throw _iteratorError;

          case 31:
            return _context.finish(28);

          case 32:
            return _context.finish(25);

          case 33:
            console.log(JSON.stringify(users, null, 2));
            _context.next = 36;
            return db.close();

          case 36:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[8, 21, 25, 33], [26,, 28, 32]]);
  }));
  return _main.apply(this, arguments);
}

_commander["default"].option('-q --quota <int>', 'set the tweet quota');

_commander["default"].parse(process.argv);

main(_commander["default"]);