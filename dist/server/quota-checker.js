"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuotaChecker = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * QuotaChecker monitors active searches and stops them if the user 
 * is over their quota, if the search is over its defined limit,
 * or if the stream should be stopped because it is past its end
 * date.
 */
var QuotaChecker = /*#__PURE__*/function () {
  function QuotaChecker() {
    (0, _classCallCheck2["default"])(this, QuotaChecker);
    this.db = new _db.Database();

    _logger["default"].info("created database connection: ".concat(this.db));

    this.started = false;
  }

  (0, _createClass2["default"])(QuotaChecker, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _logger["default"].info("starting QuotaChecker");

                this.started = true;
                this.timeId = setInterval(this.check.bind(this), 10 * 1000);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start() {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "check",
    value: function () {
      var _check = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _iterator, _step, search, user, lastQuery, now, _iterator2, _step2, job;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = _createForOfIteratorHelper;
                _context2.next = 3;
                return this.db.getActiveSearches();

              case 3:
                _context2.t1 = _context2.sent;
                _iterator = (0, _context2.t0)(_context2.t1);
                _context2.prev = 5;

                _iterator.s();

              case 7:
                if ((_step = _iterator.n()).done) {
                  _context2.next = 47;
                  break;
                }

                search = _step.value;
                // is the user over their quota?
                user = search.creator;
                _context2.next = 12;
                return this.db.userOverQuota(user);

              case 12:
                if (!_context2.sent) {
                  _context2.next = 18;
                  break;
                }

                _logger["default"].info("user ".concat(user.id, " is over quota, stopping ").concat(search.id));

                _context2.next = 16;
                return this.db.stopStream(search);

              case 16:
                _context2.next = 18;
                return this.db.stopSearch(search);

              case 18:
                // is the search over its limit?
                lastQuery = search.queries[search.queries.length - 1];

                if (!(lastQuery.value.limit && search.tweetCount > lastQuery.value.limit)) {
                  _context2.next = 25;
                  break;
                }

                _logger["default"].info("search ".concat(search.id, " exceeded its limit ").concat(lastQuery.value.limit));

                _context2.next = 23;
                return this.db.stopStream(search);

              case 23:
                _context2.next = 25;
                return this.db.stopSearch(search);

              case 25:
                // check if the search should stop streaming?
                now = new Date();
                _iterator2 = _createForOfIteratorHelper(lastQuery.searchJobs);
                _context2.prev = 27;

                _iterator2.s();

              case 29:
                if ((_step2 = _iterator2.n()).done) {
                  _context2.next = 37;
                  break;
                }

                job = _step2.value;

                if (!(job.type === 'stream' && !job.ended && now > new Date(job.tweetsEnd))) {
                  _context2.next = 35;
                  break;
                }

                _logger["default"].info("stopping stream for ".concat(search.id, " since it is past its end time"));

                _context2.next = 35;
                return this.db.stopStream(search);

              case 35:
                _context2.next = 29;
                break;

              case 37:
                _context2.next = 42;
                break;

              case 39:
                _context2.prev = 39;
                _context2.t2 = _context2["catch"](27);

                _iterator2.e(_context2.t2);

              case 42:
                _context2.prev = 42;

                _iterator2.f();

                return _context2.finish(42);

              case 45:
                _context2.next = 7;
                break;

              case 47:
                _context2.next = 52;
                break;

              case 49:
                _context2.prev = 49;
                _context2.t3 = _context2["catch"](5);

                _iterator.e(_context2.t3);

              case 52:
                _context2.prev = 52;

                _iterator.f();

                return _context2.finish(52);

              case 55:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 49, 52, 55], [27, 39, 42, 45]]);
      }));

      function check() {
        return _check.apply(this, arguments);
      }

      return check;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info('stopping QuotaChecker');

                clearInterval(this.timerId);
                this.started = false;
                this.db.close();

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function stop() {
        return _stop.apply(this, arguments);
      }

      return stop;
    }()
  }]);
  return QuotaChecker;
}();

exports.QuotaChecker = QuotaChecker;