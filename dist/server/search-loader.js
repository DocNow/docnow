"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchLoader = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _logger = _interopRequireDefault(require("./logger"));

var _utils = require("./utils");

var _db = require("./db");

var _redis = require("./redis");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*
 * SearchLoader connects will fetch search jobs from the queue and run them.
 */
var SearchLoader = /*#__PURE__*/function () {
  function SearchLoader() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2["default"])(this, SearchLoader);
    this.db = db || new _db.Database();
    this.redisBlocking = this.db.redis.duplicate();
    this.twtr = null;
    this.active = false;
  }

  (0, _createClass2["default"])(SearchLoader, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this = this;

        var _loop;

        return _regenerator["default"].wrap(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info("starting SearchLoader");

                _context3.next = 3;
                return this.setupTwitterClient();

              case 3:
                this.active = true;
                _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
                  var job, opts;
                  return _regenerator["default"].wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return _this.fetchSearchJob();

                        case 2:
                          job = _context2.sent;

                          if (!(job && job.ended === null && job.query.search.active)) {
                            _context2.next = 13;
                            break;
                          }

                          _context2.next = 6;
                          return (0, _utils.timer)(3000);

                        case 6:
                          opts = {
                            q: job.query.twitterQuery(),
                            all: true,
                            once: true
                          };

                          if (job.tweetsStart) {
                            opts.startDate = job.tweetsStart;
                          }

                          if (job.tweetsEnd) {
                            opts.endDate = job.tweetsEnd;
                          }

                          if (job.nextToken) {
                            opts.nextToken = job.nextToken;
                          }

                          _this.twtr.search(opts, /*#__PURE__*/function () {
                            var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(err, tweets, nextToken) {
                              return _regenerator["default"].wrap(function _callee$(_context) {
                                while (1) {
                                  switch (_context.prev = _context.next) {
                                    case 0:
                                      if (!(err && err.match(/ECONNRESET/))) {
                                        _context.next = 6;
                                        break;
                                      }

                                      _logger["default"].error("caught ECONNRESET: ".concat(err));

                                      _logger["default"].info("requeueing ".concat(job.id));

                                      _this.db.redis.lpushAsync(_redis.startSearchJobKey, job.id);

                                      _context.next = 26;
                                      break;

                                    case 6:
                                      if (!err) {
                                        _context.next = 11;
                                        break;
                                      }

                                      _logger["default"].error("unexpected error for ".concat(job.id, " stopping"));

                                      _this.stopJob(job);

                                      _context.next = 26;
                                      break;

                                    case 11:
                                      if (!_this.active) {
                                        _context.next = 25;
                                        break;
                                      }

                                      if (!(tweets.length > 0)) {
                                        _context.next = 15;
                                        break;
                                      }

                                      _context.next = 15;
                                      return _this.db.loadTweets(job.query.search, tweets);

                                    case 15:
                                      if (!nextToken) {
                                        _context.next = 22;
                                        break;
                                      }

                                      _logger["default"].info("queueing next search job ".concat(job.id));

                                      _context.next = 19;
                                      return _this.db.updateSearchJob({
                                        id: job.id,
                                        nextToken: nextToken
                                      });

                                    case 19:
                                      _this.db.redis.lpushAsync(_redis.startSearchJobKey, job.id);

                                      _context.next = 23;
                                      break;

                                    case 22:
                                      _this.stopJob(job);

                                    case 23:
                                      _context.next = 26;
                                      break;

                                    case 25:
                                      _logger["default"].warn('search loader callback received tweets when no longer active');

                                    case 26:
                                      return _context.abrupt("return", false);

                                    case 27:
                                    case "end":
                                      return _context.stop();
                                  }
                                }
                              }, _callee);
                            }));

                            return function (_x, _x2, _x3) {
                              return _ref.apply(this, arguments);
                            };
                          }());

                          _context2.next = 14;
                          break;

                        case 13:
                          if (job) {
                            _logger["default"].info("job ".concat(job.id, " is no longer active"));
                          }

                        case 14:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _loop);
                });

              case 5:
                if (!this.active) {
                  _context3.next = 9;
                  break;
                }

                return _context3.delegateYield(_loop(), "t0", 7);

              case 7:
                _context3.next = 5;
                break;

              case 9:
                _logger["default"].info("SearchLoader event loop stopping");

              case 10:
              case "end":
                return _context3.stop();
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
    key: "fetchSearchJob",
    value: function () {
      var _fetchSearchJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var job, item, jobId;
        return _regenerator["default"].wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // wait up to 30 seconds for a new job
                job = null;
                _context4.next = 3;
                return this.redisBlocking.blpopAsync(_redis.startSearchJobKey, 30);

              case 3:
                item = _context4.sent;

                if (!item) {
                  _context4.next = 9;
                  break;
                }

                jobId = parseInt(item[1], 10);
                _context4.next = 8;
                return this.db.getSearchJob(jobId);

              case 8:
                job = _context4.sent;

              case 9:
                return _context4.abrupt("return", job);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee3, this);
      }));

      function fetchSearchJob() {
        return _fetchSearchJob.apply(this, arguments);
      }

      return fetchSearchJob;
    }()
  }, {
    key: "stopJob",
    value: function () {
      var _stopJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(job) {
        var activeStream, query, _iterator, _step, j;

        return _regenerator["default"].wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _logger["default"].info("no more search results for search job ".concat(job.id));

                _context5.next = 3;
                return this.db.updateSearchJob({
                  id: job.id,
                  ended: new Date()
                });

              case 3:
                // determine if there's an active stream job for this search
                activeStream = false;
                _context5.next = 6;
                return this.db.getQuery(job.query.id);

              case 6:
                query = _context5.sent;
                _iterator = _createForOfIteratorHelper(query.searchJobs);

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    j = _step.value;

                    if (j.type == 'stream' && !j.ended) {
                      activeStream = true;
                    }
                  } // set search to inactive if there's not an active stream

                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                if (activeStream) {
                  _context5.next = 13;
                  break;
                }

                _context5.next = 12;
                return this.db.updateSearch({
                  id: query.search.id,
                  active: false
                });

              case 12:
                _logger["default"].info("flagging search ".concat(query.search.id, " as inactive"));

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee4, this);
      }));

      function stopJob(_x4) {
        return _stopJob.apply(this, arguments);
      }

      return stopJob;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        return _regenerator["default"].wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.active = false;
                this.db.close();
                this.redisBlocking.quit();

                _logger["default"].info("stopping SearchLoader");

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee5, this);
      }));

      function stop() {
        return _stop.apply(this, arguments);
      }

      return stop;
    }()
  }, {
    key: "setupTwitterClient",
    value: function () {
      var _setupTwitterClient = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        return _regenerator["default"].wrap(function _callee6$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(this.twtr === null)) {
                  _context7.next = 13;
                  break;
                }

                _logger["default"].info('attempting to get twitter client');

                _context7.next = 4;
                return this.db.getTwitterClientForApp();

              case 4:
                this.twtr = _context7.sent;

                if (this.twtr) {
                  _context7.next = 10;
                  break;
                }

                _context7.next = 8;
                return (0, _utils.timer)(20000);

              case 8:
                _context7.next = 11;
                break;

              case 10:
                _logger["default"].info('got twitter client!');

              case 11:
                _context7.next = 0;
                break;

              case 13:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee6, this);
      }));

      function setupTwitterClient() {
        return _setupTwitterClient.apply(this, arguments);
      }

      return setupTwitterClient;
    }()
  }]);
  return SearchLoader;
}();

exports.SearchLoader = SearchLoader;