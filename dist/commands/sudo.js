'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(screenName) {
    var db, user;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            db = new _db.Database();
            _context.next = 3;
            return db.getUserByTwitterScreenName(screenName);

          case 3:
            user = _context.sent;

            user.isSuperUser = !user.isSuperUser;
            db.updateUser(user);
            console.log(screenName + ': isSuperUser=' + user.isSuperUser);
            _context.next = 9;
            return db.close();

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _db = require('../server/db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

main(process.argv[2]);