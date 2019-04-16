"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamLoader = exports.StreamLoaderController = void 0;

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

var _redis = require("./redis");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var START_STREAM = 'start-stream';
var STOP_STREAM = 'stop-stream';
/*
 * StreamLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

var StreamLoaderController =
/*#__PURE__*/
function () {
  function StreamLoaderController() {
    _classCallCheck(this, StreamLoaderController);

    this.redis = (0, _redis.getRedis)();
  }

  _createClass(StreamLoaderController, [{
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

var StreamLoader =
/*#__PURE__*/
function () {
  function StreamLoader() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

    _classCallCheck(this, StreamLoader);

    this.concurrency = concurrency;
    this.db = db || new _db.Database();
    this.redis = (0, _redis.getRedis)();
    this.redisBlocking = this.redis.duplicate();
    this.active = false;
    this.activeStreams = new Set();
  }

  _createClass(StreamLoader, [{
    key: "start",
    value: function () {
      var _start = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var item;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _startStream = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(searchId) {
        var _this2 = this;

        var search, user, t, track, tweets, lastUpdate;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _logger["default"].info('starting stream', {
                  searchId: searchId
                });

                _context2.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context2.sent;

                if (search) {
                  _context2.next = 7;
                  break;
                }

                _logger["default"].error('unable to find search for ' + searchId);

                return _context2.abrupt("return");

              case 7:
                _context2.next = 9;
                return this.db.getUser(search.creator);

              case 9:
                user = _context2.sent;

                if (user) {
                  _context2.next = 13;
                  break;
                }

                _logger["default"].error('unable to find user for ' + search.creator);

                return _context2.abrupt("return");

              case 13:
                _context2.next = 15;
                return this.db.getTwitterClientForUser(user);

              case 15:
                t = _context2.sent;
                track = search.query.map(function (term) {
                  return term.value;
                }).join(',');
                tweets = [];
                this.activeStreams.add(searchId);
                lastUpdate = new Date();
                t.filter({
                  track: track
                }, function (tweet) {
                  tweets.push(tweet);

                  if (!(_this2.active === true && _this2.activeStreams.has(searchId))) {
                    _logger["default"].info('stream for ' + searchId + ' has been closed');

                    return false;
                  }

                  var elapsed = new Date() - lastUpdate;

                  if (tweets.length >= 100 || tweets.length > 0 && elapsed > 5000) {
                    var numTweets = tweets.length;

                    _this2.db.loadTweets(search, tweets).then(function (resp) {
                      if (resp.error) {
                        _logger["default"].info('errors during load!');
                      } else {
                        _logger["default"].info('loaded ' + numTweets + ' tweets for ' + search.id);
                      }
                    });

                    tweets = [];
                    lastUpdate = new Date();
                  }

                  return true;
                });

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function startStream(_x) {
        return _startStream.apply(this, arguments);
      }

      return startStream;
    }()
  }, {
    key: "stopStream",
    value: function () {
      var _stopStream = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(searchId) {
        var search;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info('stopping stream', {
                  searchId: searchId
                });

                _context3.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context3.sent;
                this.db.updateSearch(_objectSpread({}, search, {
                  active: false,
                  archived: false
                }));
                this.activeStreams["delete"](searchId);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function stopStream(_x2) {
        return _stopStream.apply(this, arguments);
      }

      return stopStream;
    }()
  }]);

  return StreamLoader;
}();

exports.StreamLoader = StreamLoader;