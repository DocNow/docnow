'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UrlFetcher = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _metaweb = require('metaweb');

var _metaweb2 = _interopRequireDefault(_metaweb);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _redis = require('./redis');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UrlFetcher = exports.UrlFetcher = function () {
  function UrlFetcher() {
    var concurrency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
    (0, _classCallCheck3.default)(this, UrlFetcher);

    this.concurrency = concurrency;
    this.redis = (0, _redis.getRedis)();
    this.redisBlocking = this.redis.duplicate();
    this.active = false;
  }

  (0, _createClass3.default)(UrlFetcher, [{
    key: 'start',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var promises, i;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.active = true;

              case 1:
                if (!this.active) {
                  _context.next = 9;
                  break;
                }

                promises = [];

                for (i = 0; i < this.concurrency; i++) {
                  promises.push(this.fetchJob());
                }
                _logger2.default.info('waiting to process ' + this.concurrency + ' urls');
                _context.next = 7;
                return _promise2.default.all(promises);

              case 7:
                _context.next = 1;
                break;

              case 9:
                return _context.abrupt('return', true);

              case 10:
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
      this.redis.quit();
      this.redisBlocking.quit();
    }
  }, {
    key: 'add',
    value: function add(search, url, tweetId) {
      var job = { search: search, url: url, tweetId: tweetId };
      this.incrSearchQueue(search);
      this.incrUrlsCount(search);
      return this.redis.lpushAsync('urlqueue', (0, _stringify2.default)(job));
    }
  }, {
    key: 'fetchJob',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var result, item, job;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // wait 10 seconds for a new job
                result = null;
                _context2.next = 3;
                return this.redisBlocking.blpopAsync('urlqueue', 10);

              case 3:
                item = _context2.sent;

                if (!item) {
                  _context2.next = 10;
                  break;
                }

                job = JSON.parse(item[1]);

                _logger2.default.info('got job', job);
                _context2.next = 9;
                return this.processJob(job);

              case 9:
                result = _context2.sent;

              case 10:
                return _context2.abrupt('return', result);

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchJob() {
        return _ref2.apply(this, arguments);
      }

      return fetchJob;
    }()
  }, {
    key: 'processJob',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(job) {
        var metadata;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getMetadata(job.url);

              case 2:
                metadata = _context3.sent;

                if (!metadata) {
                  _context3.next = 7;
                  break;
                }

                _logger2.default.info('found cached metadata', job.url);
                _context3.next = 22;
                break;

              case 7:
                _logger2.default.info('looking up url', job.url);
                _context3.prev = 8;
                _context3.next = 11;
                return _metaweb2.default.get(job.url);

              case 11:
                metadata = _context3.sent;

                if (!metadata) {
                  _context3.next = 17;
                  break;
                }

                // use the canonical url if it is present
                metadata.url = metadata.canonical || metadata.url;
                delete metadata.canonical;

                _context3.next = 17;
                return this.saveMetadata(job, metadata);

              case 17:
                _context3.next = 22;
                break;

              case 19:
                _context3.prev = 19;
                _context3.t0 = _context3['catch'](8);

                _logger2.default.error('metaweb.get error for ' + job.url, _context3.t0.message);

              case 22:
                if (!metadata) {
                  _context3.next = 25;
                  break;
                }

                _context3.next = 25;
                return this.tally(job, metadata);

              case 25:

                this.decrSearchQueue(job.search);
                return _context3.abrupt('return', metadata);

              case 27:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[8, 19]]);
      }));

      function processJob(_x2) {
        return _ref3.apply(this, arguments);
      }

      return processJob;
    }()
  }, {
    key: 'getMetadata',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(url) {
        var metadata, val, json;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                metadata = null;
                _context4.next = 3;
                return this.redis.getAsync((0, _redis.urlKey)(url));

              case 3:
                val = _context4.sent;

                if (!val) {
                  _context4.next = 9;
                  break;
                }

                _context4.next = 7;
                return this.redis.getAsync((0, _redis.metadataKey)(val));

              case 7:
                json = _context4.sent;

                if (json) {
                  metadata = JSON.parse(json);
                }

              case 9:
                return _context4.abrupt('return', metadata);

              case 10:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getMetadata(_x3) {
        return _ref4.apply(this, arguments);
      }

      return getMetadata;
    }()
  }, {
    key: 'saveMetadata',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(job, metadata) {
        var url;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                url = metadata.url;

                // key/value lookups for determining the url that
                // metadata is stored under

                _context5.next = 3;
                return this.redis.setAsync((0, _redis.urlKey)(job.url), url);

              case 3:
                _context5.next = 5;
                return this.redis.setAsync((0, _redis.urlKey)(url), url);

              case 5:
                _context5.next = 7;
                return this.redis.setAsync((0, _redis.metadataKey)(url), (0, _stringify2.default)(metadata));

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function saveMetadata(_x4, _x5) {
        return _ref5.apply(this, arguments);
      }

      return saveMetadata;
    }()
  }, {
    key: 'tally',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(job, metadata) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.redis.zincrbyAsync((0, _redis.urlsKey)(job.search), 1, metadata.url);

              case 2:
                _context6.next = 4;
                return this.redis.saddAsync((0, _redis.tweetsKey)(job.search, metadata.url), job.tweetId);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function tally(_x6, _x7) {
        return _ref6.apply(this, arguments);
      }

      return tally;
    }()
  }, {
    key: 'queueStats',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(search) {
        var total, remaining;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.redis.getAsync((0, _redis.urlsCountKey)(search));

              case 2:
                total = _context7.sent;
                _context7.next = 5;
                return this.redis.getAsync((0, _redis.queueCountKey)(search));

              case 5:
                remaining = _context7.sent;
                return _context7.abrupt('return', {
                  total: parseInt(total, 10),
                  remaining: parseInt(remaining, 10)
                });

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function queueStats(_x8) {
        return _ref7.apply(this, arguments);
      }

      return queueStats;
    }()
  }, {
    key: 'incrUrlsCount',
    value: function incrUrlsCount(search) {
      return this.redis.incrAsync((0, _redis.urlsCountKey)(search));
    }
  }, {
    key: 'incrSearchQueue',
    value: function incrSearchQueue(search) {
      return this.redis.incrAsync((0, _redis.queueCountKey)(search));
    }
  }, {
    key: 'decrSearchQueue',
    value: function decrSearchQueue(search) {
      return this.redis.decrAsync((0, _redis.queueCountKey)(search));
    }
  }, {
    key: 'getWebpages',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(search) {
        var _this = this;

        var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
        var key, urlCounts, selected, deselected, counts, commands, i, url, count;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                key = (0, _redis.urlsKey)(search);
                _context8.next = 3;
                return this.redis.zrevrangeAsync(key, start, limit, 'withscores');

              case 3:
                urlCounts = _context8.sent;
                _context8.next = 6;
                return this.redis.smembersAsync((0, _redis.selectedUrlsKey)(search));

              case 6:
                selected = _context8.sent;
                _context8.next = 9;
                return this.redis.smembersAsync((0, _redis.deselectedUrlsKey)(search));

              case 9:
                deselected = _context8.sent;
                counts = {};
                commands = [];

                for (i = 0; i < urlCounts.length; i += 2) {
                  url = urlCounts[i];
                  count = parseInt(urlCounts[i + 1], 10);

                  counts[url] = count;
                  commands.push(['get', (0, _redis.metadataKey)(url)]);
                  commands.push(['get', (0, _redis.waybackKey)(url)]);
                }

                // redis does not have a multiAsync command so we return a Promise
                // that will execute all the metadata gets and then build up a list
                // of webpage metadata annotated with the counts we collected above

                return _context8.abrupt('return', new _promise2.default(function (resolve) {
                  _this.redis.multi(commands).exec(function (err, results) {
                    var webpages = [];
                    for (var _i = 0; _i < results.length; _i += 2) {
                      var metadata = JSON.parse(results[_i]);
                      metadata.count = counts[metadata.url];
                      metadata.selected = selected.indexOf(metadata.url) >= 0;
                      metadata.deselected = deselected.indexOf(metadata.url) >= 0;
                      metadata.archive = JSON.parse(results[_i + 1]);

                      webpages.push(metadata);
                    }
                    resolve(webpages);
                  });
                }));

              case 14:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getWebpages(_x9) {
        return _ref8.apply(this, arguments);
      }

      return getWebpages;
    }()
  }, {
    key: 'getWebpage',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(search, url) {
        var json, metadata, selected, deselected;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.redis.getAsync((0, _redis.metadataKey)(url));

              case 2:
                json = _context9.sent;
                metadata = JSON.parse(json);
                _context9.next = 6;
                return this.redis.zscoreAsync((0, _redis.urlsKey)(search), url);

              case 6:
                metadata.count = _context9.sent;
                _context9.next = 9;
                return this.redis.smembersAsync((0, _redis.selectedUrlsKey)(search));

              case 9:
                selected = _context9.sent;

                metadata.selected = selected.indexOf(url) >= 0;

                _context9.next = 13;
                return this.redis.smembersAsync((0, _redis.deselectedUrlsKey)(search));

              case 13:
                deselected = _context9.sent;

                metadata.deselected = deselected.indexOf(url) >= 0;

                _context9.t0 = JSON;
                _context9.next = 18;
                return this.redis.getAsync((0, _redis.waybackKey)(url));

              case 18:
                _context9.t1 = _context9.sent;
                metadata.archive = _context9.t0.parse.call(_context9.t0, _context9.t1);
                return _context9.abrupt('return', metadata);

              case 21:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getWebpage(_x12, _x13) {
        return _ref9.apply(this, arguments);
      }

      return getWebpage;
    }()
  }, {
    key: 'selectWebpage',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(search, url) {
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.redis.sremAsync((0, _redis.deselectedUrlsKey)(search), url);

              case 2:
                return _context10.abrupt('return', this.redis.saddAsync((0, _redis.selectedUrlsKey)(search), url));

              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function selectWebpage(_x14, _x15) {
        return _ref10.apply(this, arguments);
      }

      return selectWebpage;
    }()
  }, {
    key: 'deselectWebpage',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(search, url) {
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.redis.sremAsync((0, _redis.selectedUrlsKey)(search), url);

              case 2:
                return _context11.abrupt('return', this.redis.saddAsync((0, _redis.deselectedUrlsKey)(search), url));

              case 3:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function deselectWebpage(_x16, _x17) {
        return _ref11.apply(this, arguments);
      }

      return deselectWebpage;
    }()
  }, {
    key: 'getTweetIdentifiers',
    value: function getTweetIdentifiers(search, url) {
      return this.redis.smembersAsync((0, _redis.tweetsKey)(search, url));
    }
  }]);
  return UrlFetcher;
}();