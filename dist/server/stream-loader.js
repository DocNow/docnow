"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamLoader = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _logger = _interopRequireDefault(require("./logger"));

var _utils = require("./utils");

var _db = require("./db");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * StreamLoader connects to the filter stream and writes any new tweets 
 * it receives to the database using the associated search id.
 */
var StreamLoader = /*#__PURE__*/function () {
  function StreamLoader() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2["default"])(this, StreamLoader);
    this.db = db || new _db.Database();
    this.twtr = null;
  }

  (0, _createClass2["default"])(StreamLoader, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this = this;

        var isLoading, tweets, totalTweets, lastUpdate;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.twtr === null)) {
                  _context2.next = 13;
                  break;
                }

                _logger["default"].info('attempting to get twitter client');

                _context2.next = 4;
                return this.db.getTwitterClientForApp();

              case 4:
                this.twtr = _context2.sent;

                if (this.twtr) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 8;
                return (0, _utils.timer)(20000);

              case 8:
                _context2.next = 11;
                break;

              case 10:
                _logger["default"].info('got twitter client!');

              case 11:
                _context2.next = 0;
                break;

              case 13:
                // flag to indicate data is loading
                isLoading = false; // accumulate tweets to be loaded by search id

                tweets = new Map(); // keep a track of how many tweets are waiting to load

                totalTweets = 0; // keep track of when tweets were last loaded

                lastUpdate = new Date(); // start the filter stream and give it a call back that will receive 
                // a tweet and any tags that the tweet matches

                this.twtr.filter( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(tweet, tags) {
                    var _iterator, _step, tag, _searchId, elapsed, _iterator2, _step2, _step2$value, searchId, searchTweets;

                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            totalTweets += 1;

                            if (_this.twtr) {
                              _context.next = 3;
                              break;
                            }

                            return _context.abrupt("return", false);

                          case 3:
                            // unpack search ids from the tags and add the tweet to the appropriate searches
                            // a tweet could be added to multiple searches
                            _iterator = _createForOfIteratorHelper(tags);

                            try {
                              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                                tag = _step.value;

                                // guard against tags that aren't from the docnow app
                                if (tag.match(/^search-\d+/)) {
                                  _searchId = tag.split('-')[1];

                                  if (!tweets.has(_searchId)) {
                                    tweets.set(_searchId, []);
                                  }

                                  tweets.get(_searchId).push(tweet);
                                }
                              } // load the tweets as long as an update isn't underway and either there are 
                              // more than 100 tweets to load, or there are some tweets to load and more 
                              // than 5 seconds have passed since the last load

                            } catch (err) {
                              _iterator.e(err);
                            } finally {
                              _iterator.f();
                            }

                            elapsed = new Date() - lastUpdate;

                            if (!(!isLoading && (totalTweets >= 100 || totalTweets > 0 && elapsed > 5000))) {
                              _context.next = 30;
                              break;
                            }

                            isLoading = true;
                            _iterator2 = _createForOfIteratorHelper(tweets.entries());
                            _context.prev = 9;

                            _iterator2.s();

                          case 11:
                            if ((_step2 = _iterator2.n()).done) {
                              _context.next = 18;
                              break;
                            }

                            _step2$value = (0, _slicedToArray2["default"])(_step2.value, 2), searchId = _step2$value[0], searchTweets = _step2$value[1];

                            _logger["default"].info("loading ".concat(searchTweets.length, " tweets for ").concat(searchId));

                            _context.next = 16;
                            return _this.db.loadTweets({
                              id: searchId
                            }, searchTweets);

                          case 16:
                            _context.next = 11;
                            break;

                          case 18:
                            _context.next = 23;
                            break;

                          case 20:
                            _context.prev = 20;
                            _context.t0 = _context["catch"](9);

                            _iterator2.e(_context.t0);

                          case 23:
                            _context.prev = 23;

                            _iterator2.f();

                            return _context.finish(23);

                          case 26:
                            // reset these so we can collect more tweets to insert
                            tweets = new Map();
                            totalTweets = 0;
                            lastUpdate = new Date();
                            isLoading = false;

                          case 30:
                            return _context.abrupt("return", true);

                          case 31:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, null, [[9, 20, 23, 26]]);
                  }));

                  return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function start() {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info('stopping StreamLoader');

                _context3.next = 3;
                return this.db.close();

              case 3:
                _context3.next = 5;
                return this.twtr.closeFilter();

              case 5:
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
  return StreamLoader;
}();

exports.StreamLoader = StreamLoader;