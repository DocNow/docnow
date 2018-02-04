'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TweetLoader = exports.TweetLoaderController = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _twitter = require('./twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _redis = require('./redis');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var START_STREAM = 'start-stream';
var STOP_STREAM = 'stop-stream';

/*
 * TweetLoaderController handles starting and stopping streaming
 * jobs from Twitter.
 */

var TweetLoaderController = exports.TweetLoaderController = function () {
  function TweetLoaderController() {
    (0, _classCallCheck3.default)(this, TweetLoaderController);

    this.redis = (0, _redis.getRedis)();
  }

  (0, _createClass3.default)(TweetLoaderController, [{
    key: 'stop',
    value: function stop() {
      _logger2.default.info('stopping TweetLoaderController');
      this.redis.quit();
    }
  }, {
    key: 'startStream',
    value: function startStream(search) {
      this.redis.rpush(START_STREAM, (0, _stringify2.default)(search));
    }
  }, {
    key: 'stopStream',
    value: function stopStream(search) {
      this.redis.publish(STOP_STREAM, (0, _stringify2.default)(search));
    }
  }]);
  return TweetLoaderController;
}();

/*
 * TweetLoader will listen to a queue of commands to start streaming
 * jobs and will subscribe for messages to stop those jobs. The queue is
 * used to make sure only one worker picks up the streaming job. the
 * pub/sub channel is used to notify all workers to stop the stream
 * since we don't really know which worker picked it up.
 */

var TweetLoader = exports.TweetLoader = function () {
  function TweetLoader() {
    var concurrency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
    (0, _classCallCheck3.default)(this, TweetLoader);

    this.concurrency = concurrency;
    this.streams = {};
    this.redis = (0, _redis.getRedis)();
  }

  (0, _createClass3.default)(TweetLoader, [{
    key: 'start',
    value: function start() {
      var _this = this;

      this.redis.lpop(START_STREAM, function (err, message) {
        var job = JSON.parse(message);
        _this.startStream(job);
      });

      this.redis.subscribe(STOP_STREAM);

      this.redis.on('message', function (channel, message) {
        var job = JSON.parse(message);
        _this.stopStream(job);
      });

      this.redis.on('disconnect', function () {
        _this.stop();
      });
    }
  }, {
    key: 'stop',
    value: function stop() {
      _logger2.default.info('stopping TweetLoader');
      this.redis.quit();
    }
  }, {
    key: 'startStream',
    value: function startStream(job) {
      _logger2.default.info('starting stream', { job: job });
    }
  }, {
    key: 'stopStream',
    value: function stopStream(job) {
      _logger2.default.info('stopping stream', { job: job });
    }
  }]);
  return TweetLoader;
}();