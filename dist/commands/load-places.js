'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var db, places, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, place;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            db = new _db.Database();
            _context.next = 3;
            return db.loadPlaces();

          case 3:
            places = _context.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 7;


            for (_iterator = (0, _getIterator3.default)(places); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              place = _step.value;

              if (place.type == 'Town') {
                console.log('added ' + place.name + ', ' + place.country);
              } else {
                console.log('added ' + place.name);
              }
            }

            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 15:
            _context.prev = 15;
            _context.prev = 16;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 18:
            _context.prev = 18;

            if (!_didIteratorError) {
              _context.next = 21;
              break;
            }

            throw _iteratorError;

          case 21:
            return _context.finish(18);

          case 22:
            return _context.finish(15);

          case 23:
            console.log('loaded ' + places.length + ' places.');
            _context.next = 26;
            return db.close();

          case 26:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[7, 11, 15, 23], [16,, 18, 22]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _db = require('../server/db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

main();