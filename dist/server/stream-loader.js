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
    value: function startStream(searchId) {
      this.redis.rpush(START_STREAM, searchId);
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

        var item;
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
                item = _context.sent;

                if (item) {
                  this.startStream(item[1]);
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
      var _startStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(searchId) {
        var _this2 = this;

        var search, user, t, lastQuery, track, tweets, lastUpdate;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info('starting stream', {
                  searchId: searchId
                });

                _context3.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context3.sent;

                if (search) {
                  _context3.next = 7;
                  break;
                }

                _logger["default"].error('unable to find search for ' + searchId);

                return _context3.abrupt("return");

              case 7:
                user = search.creator;
                _context3.next = 10;
                return this.db.getTwitterClientForUser(user);

              case 10:
                t = _context3.sent;
                lastQuery = search.queries[search.queries.length - 1];
                track = lastQuery.trackQuery();
                tweets = [];
                this.activeStreams.add(searchId);
                lastUpdate = new Date();
                t.filter({
                  track: track
                }, /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(tweet) {
                    var elapsed, updatedUser, numTweets;
                    return _regenerator["default"].wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            tweets.push(tweet);

                            if (_this2.active === true && _this2.activeStreams.has(searchId)) {
                              _context2.next = 4;
                              break;
                            }

                            _logger["default"].info('stream for ' + searchId + ' has been closed');

                            return _context2.abrupt("return", false);

                          case 4:
                            elapsed = new Date() - lastUpdate;

                            if (!(tweets.length >= 100 || tweets.length > 0 && elapsed > 5000)) {
                              _context2.next = 25;
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
                            return _this2.db.userOverQuota(user);

                          case 17:
                            if (!_context2.sent) {
                              _context2.next = 21;
                              break;
                            }

                            _logger["default"].info("user is over quota ".concat(updatedUser.twitterScreenName));

                            _this2.stopStream(searchId);

                            return _context2.abrupt("return", false);

                          case 21:
                            numTweets = tweets.length;

                            _this2.db.loadTweets(search, tweets).then(function () {
                              _logger["default"].info('loaded ' + numTweets + ' tweets for ' + search.id);
                            })["catch"](function (e) {
                              _logger["default"].error("error during stream loading: ".concat(e));
                            });

                            tweets = [];
                            lastUpdate = new Date();

                          case 25:
                            return _context2.abrupt("return", true);

                          case 26:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 17:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function startStream(_x) {
        return _startStream.apply(this, arguments);
      }

      return startStream;
    }()
  }, {
    key: "stopStream",
    value: function () {
      var _stopStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(searchId) {
        var search;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _logger["default"].info('stopping stream', {
                  searchId: searchId
                });

                _context4.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context4.sent;
                this.db.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
                  active: false,
                  archived: false
                }));
                this.activeStreams["delete"](searchId);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function stopStream(_x3) {
        return _stopStream.apply(this, arguments);
      }

      return stopStream;
    }()
  }]);
  return StreamLoader;
}();

exports.StreamLoader = StreamLoader;