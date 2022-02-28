"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoFetcher = void 0;

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
 * VideoFetcher looks up MP4 URLs for video tweets.
 */
var VideoFetcher = /*#__PURE__*/function () {
  function VideoFetcher() {
    var db = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0, _classCallCheck2["default"])(this, VideoFetcher);
    this.db = db || new _db.Database();
    this.twtr = null;
    this.active = false;
  }

  (0, _createClass2["default"])(VideoFetcher, [{
    key: "start",
    value: function () {
      var _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var jobs, tweetIds, tweets, urlRows, _iterator, _step, tweet, _iterator2, _step2, job, videoUrl;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _logger["default"].info("starting VideoFetcher");

                _context.next = 3;
                return this.setupTwitterClient();

              case 3:
                this.active = true;

              case 4:
                if (!this.active) {
                  _context.next = 24;
                  break;
                }

                _context.next = 7;
                return this.fetchJobs();

              case 7:
                jobs = _context.sent;

                if (!(jobs.length > 0)) {
                  _context.next = 20;
                  break;
                }

                tweetIds = Array.from(new Set(jobs.map(function (j) {
                  return j.tweetId;
                })));
                _context.next = 12;
                return this.twtr.hydrate(tweetIds);

              case 12:
                tweets = _context.sent;

                if (!tweets) {
                  _context.next = 20;
                  break;
                }

                urlRows = [];
                _iterator = _createForOfIteratorHelper(tweets);

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    tweet = _step.value;
                    _iterator2 = _createForOfIteratorHelper(jobs);

                    try {
                      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        job = _step2.value;

                        if (job.tweetId == tweet.id) {
                          videoUrl = this.getVideoUrl(tweet);

                          if (videoUrl) {
                            urlRows.push({
                              tweetId: job.tweetRowId,
                              url: videoUrl.url,
                              thumbnailUrl: videoUrl.thumbnailUrl,
                              type: 'video',
                              mediaId: job.mediaId
                            });
                          }
                        }
                      }
                    } catch (err) {
                      _iterator2.e(err);
                    } finally {
                      _iterator2.f();
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                if (!(urlRows.length > 0)) {
                  _context.next = 20;
                  break;
                }

                _context.next = 20;
                return this.db.insertUrls(urlRows);

              case 20:
                _context.next = 22;
                return (0, _utils.timer)(5000);

              case 22:
                _context.next = 4;
                break;

              case 24:
                _logger["default"].info("VideoFetcher event loop stopping");

              case 25:
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
    key: "fetchJobs",
    value: function () {
      var _fetchJobs = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var item;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.db.redis.lpopAsync(_redis.fetchVideoKey, 100);

              case 2:
                item = _context2.sent;

                if (!item) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", item.map(function (s) {
                  return JSON.parse(s);
                }));

              case 7:
                return _context2.abrupt("return", []);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchJobs() {
        return _fetchJobs.apply(this, arguments);
      }

      return fetchJobs;
    }()
  }, {
    key: "stop",
    value: function () {
      var _stop = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.active = false;
                this.db.close();
                this.redisBlocking.quit();

                _logger["default"].info("stopping VideoFetcher");

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
  }, {
    key: "setupTwitterClient",
    value: function () {
      var _setupTwitterClient = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.twtr === null)) {
                  _context4.next = 13;
                  break;
                }

                _logger["default"].info('video-fetcher attempting to get twitter client');

                _context4.next = 4;
                return this.db.getTwitterClientForApp();

              case 4:
                this.twtr = _context4.sent;

                if (this.twtr) {
                  _context4.next = 10;
                  break;
                }

                _context4.next = 8;
                return (0, _utils.timer)(20000);

              case 8:
                _context4.next = 11;
                break;

              case 10:
                _logger["default"].info('video-fetcher got twitter client!');

              case 11:
                _context4.next = 0;
                break;

              case 13:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setupTwitterClient() {
        return _setupTwitterClient.apply(this, arguments);
      }

      return setupTwitterClient;
    }()
  }, {
    key: "getVideoUrl",
    value: function getVideoUrl(tweet) {
      if (tweet.extended_entities && tweet.extended_entities.media) {
        var _iterator3 = _createForOfIteratorHelper(tweet.extended_entities.media),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var media = _step3.value;

            if (media.video_info && media.video_info.variants) {
              var _iterator4 = _createForOfIteratorHelper(media.video_info.variants),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var variant = _step4.value;

                  // note: maybe should pick video with highest bitrate?
                  if (variant.content_type == 'video/mp4') {
                    return {
                      url: variant.url,
                      thumbnailUrl: media.media_url_https
                    };
                  }
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }

      return null;
    }
  }]);
  return VideoFetcher;
}();

exports.VideoFetcher = VideoFetcher;