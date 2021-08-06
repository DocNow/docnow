"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamLoader = exports.StreamLoaderController = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

var _redis = require("./redis");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var START_STREAM = 'start-stream';
var STOP_STREAM = 'stop-stream';
/*
 * StreamLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

var StreamLoaderController = /*#__PURE__*/function () {
  function StreamLoaderController() {
    (0, _classCallCheck2["default"])(this, StreamLoaderController);
    this.redis = (0, _redis.getRedis)();
  }

  (0, _createClass2["default"])(StreamLoaderController, [{
    key: "stop",
    value: function stop() {
      _logger["default"].info('stopping StreamLoaderController');

      this.redis.quit();
    }
  }, {
    key: "startStream",
    value: function startStream(searchId, tweetId) {
      this.redis.rpush(START_STREAM, JSON.stringify({
        searchId: searchId,
        tweetId: tweetId
      }));
    }
  }, {
    key: "stopStream",
    value: function stopStream(searchId) {
      this.redis.publish(STOP_STREAM, searchId);
    }
  }]);
  return StreamLoaderController;
}();
/*
 * StreamLoader will listen to a queue of commands to start streaming
 * jobs and will subscribe for messages to stop those jobs. The queue is
 * used to make sure only one worker picks up the streaming job. the
 * pub/sub channel is used to notify all workers to stop the stream
 * since we don't really know which worker picked it up.
 */


exports.StreamLoaderController = StreamLoaderController;

var StreamLoader = /*#__PURE__*/function () {
  function StreamLoader() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    (0, _classCallCheck2["default"])(this, StreamLoader);
    this.concurrency = concurrency;
    this.db = db || new _db.Database();
    this.redis = (0, _redis.getRedis)();
    this.redisBlocking = this.redis.duplicate();
    this.active = false;
    this.activeStreams = new Set();
  }

  (0, _createClass2["default"])(StreamLoader, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        var result, info;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.redis.subscribe(STOP_STREAM);
                this.redis.on('message', function (channel, searchId) {
                  _this.stopStream(searchId);
                });
                this.redis.on('disconnect', function () {
                  _this.stop();
                });
                this.active = true;

              case 4:
                if (!this.active) {
                  _context.next = 11;
                  break;
                }

                _context.next = 7;
                return this.redisBlocking.blpopAsync(START_STREAM, 10);

              case 7:
                result = _context.sent;

                if (result) {
                  info = JSON.parse(result[1]);
                  this.startStream(info.searchId, info.tweetId);
                }

                _context.next = 4;
                break;

              case 11:
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
    key: "stop",
    value: function stop() {
      this.active = false;

      _logger["default"].info('stopping StreamLoader');

      this.redis.quit();
      this.redisBlocking.quit();
      this.db.close();
    }
  }, {
    key: "startStream",
    value: function () {
      var _startStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(searchId, tweetId) {
        var _this2 = this;

        var search, query, job, user, track, t, tweets, lastUpdate, totalTweets;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info("starting stream search ".concat(searchId));

                _context3.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context3.sent;
                query = search.queries[search.queries.length - 1];
                _context3.next = 7;
                return this.db.createSearchJob({
                  queryId: query.id,
                  tweetId: tweetId,
                  started: new Date()
                });

              case 7:
                job = _context3.sent;
                user = search.creator;
                track = query.trackQuery();
                _context3.next = 12;
                return this.db.getTwitterClientForUser(user);

              case 12:
                t = _context3.sent;
                tweets = [];
                lastUpdate = new Date();
                totalTweets = 0;
                this.activeStreams.add(String(searchId));
                t.filter({
                  track: track
                }, /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(tweet) {
                    var elapsed, updatedUser;
                    return _regenerator["default"].wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            tweets.push(tweet);

                            if (_this2.active === true && _this2.activeStreams.has(String(searchId))) {
                              _context2.next = 4;
                              break;
                            }

                            _logger["default"].info("stream for search ".concat(searchId, " has been closed"));

                            return _context2.abrupt("return", false);

                          case 4:
                            elapsed = new Date() - lastUpdate;

                            if (!(tweets.length >= 100 || tweets.length > 0 && elapsed > 5000)) {
                              _context2.next = 28;
                              break;
                            }

                            _context2.next = 8;
                            return _this2.db.getUser(user.id);

                          case 8:
                            updatedUser = _context2.sent;

                            if (updatedUser.active) {
                              _context2.next = 15;
                              break;
                            }

                            _logger["default"].info("user is not active: ".concat(updatedUser.twitterScreenName));

                            _this2.stopStream(searchId);

                            return _context2.abrupt("return", false);

                          case 15:
                            _context2.next = 17;
                            return _this2.db.userOverQuota(updatedUser);

                          case 17:
                            if (!_context2.sent) {
                              _context2.next = 21;
                              break;
                            }

                            _logger["default"].info("user is over quota ".concat(updatedUser.twitterScreenName));

                            _this2.stopStream(searchId);

                            return _context2.abrupt("return", false);

                          case 21:
                            _context2.next = 23;
                            return _this2.db.loadTweets(search, tweets);

                          case 23:
                            totalTweets += tweets.length;
                            _context2.next = 26;
                            return _this2.db.updateSearchJob({
                              id: job.id,
                              tweets: totalTweets
                            });

                          case 26:
                            tweets = [];
                            lastUpdate = new Date();

                          case 28:
                            return _context2.abrupt("return", true);

                          case 29:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x3) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 18:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function startStream(_x, _x2) {
        return _startStream.apply(this, arguments);
      }

      return startStream;
    }()
  }, {
    key: "stopStream",
    value: function () {
      var _stopStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(searchId) {
        var search, query, _iterator, _step, job;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _logger["default"].info("stopping stream for search ".concat(searchId));

                _context4.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context4.sent;
                this.db.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
                  active: false,
                  archived: false
                }));
                query = search.queries[search.queries.length - 1]; // need a better way to identify the search job that needs to 
                // be ended but for now just mark any search job that has no 
                // ended time. once we can do historical collection it will be 
                // important to only end the filter stream job

                _iterator = _createForOfIteratorHelper(query.searchJobs);
                _context4.prev = 7;

                _iterator.s();

              case 9:
                if ((_step = _iterator.n()).done) {
                  _context4.next = 16;
                  break;
                }

                job = _step.value;

                if (job.ended) {
                  _context4.next = 14;
                  break;
                }

                _context4.next = 14;
                return this.db.updateSearchJob({
                  id: job.id,
                  ended: new Date()
                });

              case 14:
                _context4.next = 9;
                break;

              case 16:
                _context4.next = 21;
                break;

              case 18:
                _context4.prev = 18;
                _context4.t0 = _context4["catch"](7);

                _iterator.e(_context4.t0);

              case 21:
                _context4.prev = 21;

                _iterator.f();

                return _context4.finish(21);

              case 24:
                this.activeStreams["delete"](String(searchId));

              case 25:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[7, 18, 21, 24]]);
      }));

      function stopStream(_x4) {
        return _stopStream.apply(this, arguments);
      }

      return stopStream;
    }()
  }]);
  return StreamLoader;
}();

exports.StreamLoader = StreamLoader;