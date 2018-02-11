'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamLoader = exports.StreamLoaderController = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _db = require('./db');

var _redis = require('./redis');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var START_STREAM = 'start-stream';
var STOP_STREAM = 'stop-stream';

/*
 * StreamLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

var StreamLoaderController = exports.StreamLoaderController = function () {
  function StreamLoaderController() {
    (0, _classCallCheck3.default)(this, StreamLoaderController);

    this.redis = (0, _redis.getRedis)();
  }

  (0, _createClass3.default)(StreamLoaderController, [{
    key: 'stop',
    value: function stop() {
      _logger2.default.info('stopping StreamLoaderController');
      this.redis.quit();
    }
  }, {
    key: 'startStream',
    value: function startStream(searchId) {
      this.redis.rpush(START_STREAM, searchId);
    }
  }, {
    key: 'stopStream',
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

var StreamLoader = exports.StreamLoader = function () {
  function StreamLoader() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    (0, _classCallCheck3.default)(this, StreamLoader);

    this.concurrency = concurrency;
    this.db = db || new _db.Database();
    this.redis = (0, _redis.getRedis)();
    this.redisBlocking = this.redis.duplicate();
    this.active = false;
    this.activeStreams = new _set2.default();
  }

  (0, _createClass3.default)(StreamLoader, [{
    key: 'start',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _this = this;

        var item;
        return _regenerator2.default.wrap(function _callee$(_context) {
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
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start() {
        return _ref.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: 'stop',
    value: function stop() {
      this.active = false;
      _logger2.default.info('stopping StreamLoader');
      this.redis.quit();
      this.redisBlocking.quit();
      this.db.close();
    }
  }, {
    key: 'startStream',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(searchId) {
        var _this2 = this;

        var search, user, t, track, tweets, lastUpdate;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _logger2.default.info('starting stream', { searchId: searchId });

                _context2.next = 3;
                return this.db.getSearch(searchId);

              case 3:
                search = _context2.sent;

                if (search) {
                  _context2.next = 7;
                  break;
                }

                _logger2.default.error('unable to find search for ' + searchId);
                return _context2.abrupt('return');

              case 7:
                _context2.next = 9;
                return this.db.getUser(search.creator);

              case 9:
                user = _context2.sent;

                if (user) {
                  _context2.next = 13;
                  break;
                }

                _logger2.default.error('unable to find user for ' + search.creator);
                return _context2.abrupt('return');

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


                t.filter({ track: track }, function (tweet) {
                  tweets.push(tweet);

                  if (!(_this2.active === true && _this2.activeStreams.has(searchId))) {
                    _logger2.default.info('stream for ' + searchId + ' has been closed');
                    return false;
                  }

                  var elapsed = new Date() - lastUpdate;

                  if (tweets.length >= 100 || tweets.length > 0 && elapsed > 5000) {
                    var numTweets = tweets.length;
                    _this2.db.loadTweets(search, tweets).then(function (resp) {
                      if (resp.error) {
                        _logger2.default.info('errors during load!');
                      } else {
                        _logger2.default.info('loaded ' + numTweets + ' tweets for ' + search.id);
                      }
                    });
                    tweets = [];
                    lastUpdate = new Date();
                  }

                  return true;
                });

              case 21:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function startStream(_x3) {
        return _ref2.apply(this, arguments);
      }

      return startStream;
    }()
  }, {
    key: 'stopStream',
    value: function stopStream(searchId) {
      _logger2.default.info('stopping stream', { searchId: searchId });
      this.activeStreams.delete(searchId);
    }
  }]);
  return StreamLoader;
}();