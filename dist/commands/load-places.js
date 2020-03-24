"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _db = require("../server/db");

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var db, places, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, place;

    return _regenerator["default"].wrap(function _callee$(_context) {
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

            for (_iterator = places[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              place = _step.value;

              if (place.type == 'Town') {
                console.log("added ".concat(place.name, ", ").concat(place.country));
              } else {
                console.log("added ".concat(place.name));
              }
            }

            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 15:
            _context.prev = 15;
            _context.prev = 16;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
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
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[7, 11, 15, 23], [16,, 18, 22]]);
  }));
  return _main.apply(this, arguments);
}

main();