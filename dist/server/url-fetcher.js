"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UrlFetcher = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _logger = _interopRequireDefault(require("./logger"));

var _metaweb = _interopRequireDefault(require("metaweb"));

var _redis = require("./redis");

var UrlFetcher = /*#__PURE__*/function () {
  function UrlFetcher() {
    var concurrency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
    (0, _classCallCheck2["default"])(this, UrlFetcher);
    this.concurrency = concurrency;
    this.redis = (0, _redis.getRedis)();
    this.redisBlocking = this.redis.duplicate();
    this.active = false;
  }

  (0, _createClass2["default"])(UrlFetcher, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var promises, i;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.active = true;

              case 1:
                if (!this.active) {
                  _context.next = 8;
                  break;
                }

                promises = [];

                for (i = 0; i < this.concurrency; i++) {
                  promises.push(this.fetchJob());
                }

                _context.next = 6;
                return Promise.all(promises);

              case 6:
                _context.next = 1;
                break;

              case 8:
                return _context.abrupt("return", true);

              case 9:
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
    value: function () {
      var _stop = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.active = false;
                _context2.next = 3;
                return this.redis.quit();

              case 3:
                _context2.next = 5;
                return this.redisBlocking.quit();

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function stop() {
        return _stop.apply(this, arguments);
      }

      return stop;
    }()
  }, {
    key: "add",
    value: function add(search, url, tweetId) {
      if (this.redis.connected) {
        var job = {
          search: search,
          url: url,
          tweetId: tweetId
        };
        this.incrSearchQueue(search);
        this.incrUrlsCount(search);
        return this.redis.lpushAsync('urlqueue', JSON.stringify(job));
      }
    }
  }, {
    key: "fetchJob",
    value: function () {
      var _fetchJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var result, item, job;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // wait 10 seconds for a new job
                result = null;
                _context3.next = 3;
                return this.redisBlocking.blpopAsync('urlqueue', 10);

              case 3:
                item = _context3.sent;

                if (!item) {
                  _context3.next = 10;
                  break;
                }

                job = JSON.parse(item[1]);

                _logger["default"].info("got url-fetch job for ".concat(job.url));

                _context3.next = 9;
                return this.processJob(job);

              case 9:
                result = _context3.sent;

              case 10:
                return _context3.abrupt("return", result);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fetchJob() {
        return _fetchJob.apply(this, arguments);
      }

      return fetchJob;
    }()
  }, {
    key: "processJob",
    value: function () {
      var _processJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(job) {
        var metadata;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getMetadata(job.url);

              case 2:
                metadata = _context4.sent;

                if (!metadata) {
                  _context4.next = 7;
                  break;
                }

                _logger["default"].info('found cached metadata', job.url);

                _context4.next = 22;
                break;

              case 7:
                _logger["default"].info('looking up url', job.url);

                _context4.prev = 8;
                _context4.next = 11;
                return _metaweb["default"].get(job.url);

              case 11:
                metadata = _context4.sent;

                if (!metadata) {
                  _context4.next = 17;
                  break;
                }

                // use the canonical url if it is present
                metadata.url = metadata.canonical || metadata.url;
                delete metadata.canonical;
                _context4.next = 17;
                return this.saveMetadata(job, metadata);

              case 17:
                _context4.next = 22;
                break;

              case 19:
                _context4.prev = 19;
                _context4.t0 = _context4["catch"](8);

                _logger["default"].error("metaweb.get error for ".concat(job.url), _context4.t0.message);

              case 22:
                if (!metadata) {
                  _context4.next = 25;
                  break;
                }

                _context4.next = 25;
                return this.tally(job, metadata);

              case 25:
                this.decrSearchQueue(job.search);
                return _context4.abrupt("return", metadata);

              case 27:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[8, 19]]);
      }));

      function processJob(_x) {
        return _processJob.apply(this, arguments);
      }

      return processJob;
    }()
  }, {
    key: "getMetadata",
    value: function () {
      var _getMetadata = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(url) {
        var metadata, val, json;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                metadata = null;
                _context5.next = 3;
                return this.redis.getAsync((0, _redis.urlKey)(url));

              case 3:
                val = _context5.sent;

                if (!val) {
                  _context5.next = 9;
                  break;
                }

                _context5.next = 7;
                return this.redis.getAsync((0, _redis.metadataKey)(val));

              case 7:
                json = _context5.sent;

                if (json) {
                  metadata = JSON.parse(json);
                }

              case 9:
                return _context5.abrupt("return", metadata);

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getMetadata(_x2) {
        return _getMetadata.apply(this, arguments);
      }

      return getMetadata;
    }()
  }, {
    key: "saveMetadata",
    value: function () {
      var _saveMetadata = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(job, metadata) {
        var url;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                url = metadata.url; // key/value lookups for determining the url that
                // metadata is stored under

                _context6.next = 3;
                return this.redis.setAsync((0, _redis.urlKey)(job.url), url);

              case 3:
                _context6.next = 5;
                return this.redis.setAsync((0, _redis.urlKey)(url), url);

              case 5:
                _context6.next = 7;
                return this.redis.setAsync((0, _redis.metadataKey)(url), JSON.stringify(metadata));

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function saveMetadata(_x3, _x4) {
        return _saveMetadata.apply(this, arguments);
      }

      return saveMetadata;
    }()
  }, {
    key: "tally",
    value: function () {
      var _tally = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(job, metadata) {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.redis.zincrbyAsync((0, _redis.urlsKey)(job.search), 1, metadata.url);

              case 2:
                _context7.next = 4;
                return this.redis.saddAsync((0, _redis.tweetsKey)(job.search, metadata.url), job.tweetId);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function tally(_x5, _x6) {
        return _tally.apply(this, arguments);
      }

      return tally;
    }()
  }, {
    key: "queueStats",
    value: function () {
      var _queueStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(search) {
        var total, remaining;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.redis.getAsync((0, _redis.urlsCountKey)(search));

              case 2:
                total = _context8.sent;
                _context8.next = 5;
                return this.redis.getAsync((0, _redis.queueCountKey)(search));

              case 5:
                remaining = _context8.sent;
                return _context8.abrupt("return", {
                  total: parseInt(total, 10),
                  remaining: parseInt(remaining, 10)
                });

              case 7:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function queueStats(_x7) {
        return _queueStats.apply(this, arguments);
      }

      return queueStats;
    }()
  }, {
    key: "incrUrlsCount",
    value: function incrUrlsCount(search) {
      return this.redis.incrAsync((0, _redis.urlsCountKey)(search));
    }
  }, {
    key: "incrSearchQueue",
    value: function incrSearchQueue(search) {
      return this.redis.incrAsync((0, _redis.queueCountKey)(search));
    }
  }, {
    key: "decrSearchQueue",
    value: function decrSearchQueue(search) {
      return this.redis.decrAsync((0, _redis.queueCountKey)(search));
    }
  }, {
    key: "getWebpages",
    value: function () {
      var _getWebpages = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(search) {
        var _this = this;

        var start,
            limit,
            key,
            urlCounts,
            selected,
            deselected,
            counts,
            commands,
            i,
            url,
            count,
            _args9 = arguments;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                start = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : 0;
                limit = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : 100;
                key = (0, _redis.urlsKey)(search);
                _context9.next = 5;
                return this.redis.zrevrangeAsync(key, start, start + limit, 'withscores');

              case 5:
                urlCounts = _context9.sent;
                _context9.next = 8;
                return this.redis.smembersAsync((0, _redis.selectedUrlsKey)(search));

              case 8:
                selected = _context9.sent;
                _context9.next = 11;
                return this.redis.smembersAsync((0, _redis.deselectedUrlsKey)(search));

              case 11:
                deselected = _context9.sent;
                counts = {};
                commands = [];

                for (i = 0; i < urlCounts.length; i += 2) {
                  url = urlCounts[i];
                  count = parseInt(urlCounts[i + 1], 10);
                  counts[url] = count;
                  commands.push(['get', (0, _redis.metadataKey)(url)]);
                  commands.push(['get', (0, _redis.waybackKey)(url)]);
                } // redis does not have a multiAsync command so we return a Promise
                // that will execute all the metadata gets and then build up a list
                // of webpage metadata annotated with the counts we collected above


                return _context9.abrupt("return", new Promise(function (resolve) {
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

              case 16:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getWebpages(_x8) {
        return _getWebpages.apply(this, arguments);
      }

      return getWebpages;
    }()
  }, {
    key: "getWebpage",
    value: function () {
      var _getWebpage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(search, url) {
        var json, metadata, selected, deselected;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.redis.getAsync((0, _redis.metadataKey)(url));

              case 2:
                json = _context10.sent;
                metadata = JSON.parse(json);
                _context10.next = 6;
                return this.redis.zscoreAsync((0, _redis.urlsKey)(search), url);

              case 6:
                metadata.count = _context10.sent;
                _context10.next = 9;
                return this.redis.smembersAsync((0, _redis.selectedUrlsKey)(search));

              case 9:
                selected = _context10.sent;
                metadata.selected = selected.indexOf(url) >= 0;
                _context10.next = 13;
                return this.redis.smembersAsync((0, _redis.deselectedUrlsKey)(search));

              case 13:
                deselected = _context10.sent;
                metadata.deselected = deselected.indexOf(url) >= 0;
                _context10.t0 = JSON;
                _context10.next = 18;
                return this.redis.getAsync((0, _redis.waybackKey)(url));

              case 18:
                _context10.t1 = _context10.sent;
                metadata.archive = _context10.t0.parse.call(_context10.t0, _context10.t1);
                return _context10.abrupt("return", metadata);

              case 21:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getWebpage(_x9, _x10) {
        return _getWebpage.apply(this, arguments);
      }

      return getWebpage;
    }()
  }, {
    key: "selectWebpage",
    value: function () {
      var _selectWebpage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(search, url) {
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.redis.sremAsync((0, _redis.deselectedUrlsKey)(search), url);

              case 2:
                return _context11.abrupt("return", this.redis.saddAsync((0, _redis.selectedUrlsKey)(search), url));

              case 3:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function selectWebpage(_x11, _x12) {
        return _selectWebpage.apply(this, arguments);
      }

      return selectWebpage;
    }()
  }, {
    key: "deselectWebpage",
    value: function () {
      var _deselectWebpage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(search, url) {
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this.redis.sremAsync((0, _redis.selectedUrlsKey)(search), url);

              case 2:
                return _context12.abrupt("return", this.redis.saddAsync((0, _redis.deselectedUrlsKey)(search), url));

              case 3:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function deselectWebpage(_x13, _x14) {
        return _deselectWebpage.apply(this, arguments);
      }

      return deselectWebpage;
    }()
  }, {
    key: "getTweetIdentifiers",
    value: function getTweetIdentifiers(search, url) {
      return this.redis.smembersAsync((0, _redis.tweetsKey)(search, url));
    }
  }]);
  return UrlFetcher;
}();

exports.UrlFetcher = UrlFetcher;