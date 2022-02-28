"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Twitter = void 0;
exports.isAcademic = isAcademic;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

require("../env");

var _url = _interopRequireDefault(require("url"));

var _twit = _interopRequireDefault(require("twit"));

var _logger = _interopRequireDefault(require("./logger"));

var _utils = require("./utils");

var _twitterV = _interopRequireDefault(require("twitter-v2"));

var _emojiRegex = _interopRequireDefault(require("emoji-regex"));

var _htmlEntities = require("html-entities");

var _flattenTweet = require("flatten-tweet");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _asyncIterator(iterable) { var method, async, sync, retry = 2; for ("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;) { if (async && null != (method = iterable[async])) return method.call(iterable); if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable)); async = "@@asyncIterator", sync = "@@iterator"; } throw new TypeError("Object is not async iterable"); }

function AsyncFromSyncIterator(s) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var done = r.done; return Promise.resolve(r.value).then(function (value) { return { value: value, done: done }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(s) { this.s = s, this.n = s.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(value) { var ret = this.s["return"]; return void 0 === ret ? Promise.resolve({ value: value, done: !0 }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments)); }, "throw": function _throw(value) { var thr = this.s["return"]; return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(s); }

var emojiMatch = (0, _emojiRegex["default"])();
var entities = new _htmlEntities.AllHtmlEntities();

function decode(s) {
  return entities.decode(s);
}

var Twitter = /*#__PURE__*/function () {
  function Twitter() {
    var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Twitter);
    this.consumerKey = keys.consumerKey || process.env.CONSUMER_KEY;
    this.consumerSecret = keys.consumerSecret || process.env.CONSUMER_SECRET;
    this.accessToken = keys.accessToken || process.env.ACCESS_TOKEN;
    this.accessTokenSecret = keys.accessTokenSecret || process.env.ACCESS_TOKEN_SECRET; // user client for Twitter v1.1 and v2 API endpoints

    if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessTokenSecret) {
      this.twit = new _twit["default"]({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        access_token: this.accessToken,
        access_token_secret: this.accessTokenSecret
      });
      this.twitterV2 = new _twitterV["default"]({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        access_token_key: this.accessToken,
        access_token_secret: this.accessTokenSecret
      });
    } else {
      _logger["default"].warn('unable to configure user client since not all keys are present');
    } // app auth client for v1.1 and v2 endpoints


    if (this.consumerKey && this.consumerSecret) {
      this.twitterV2app = new _twitterV["default"]({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret
      });
      this.twitApp = new _twit["default"]({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
        app_only_auth: true
      });

      _logger["default"].info('configured app client for v1.1 and v2 endpoints');
    } else {
      _logger["default"].warn('unable to configure app client since not all keys are present');
    }
  }

  (0, _createClass2["default"])(Twitter, [{
    key: "getPlaces",
    value: function getPlaces() {
      var _this = this;

      return new Promise(function (resolve) {
        _this.twit.get('trends/available').then(function (resp) {
          var places = [];

          var _iterator2 = _createForOfIteratorHelper(resp.data),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var place = _step2.value;
              places.push({
                id: place.woeid,
                name: place.name,
                type: place.placeType.name,
                country: place.country || '',
                countryCode: place.countryCode || '',
                parentId: place.parentid || ''
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          resolve(places);
        });
      });
    }
  }, {
    key: "getTrendsAtPlace",
    value: function () {
      var _getTrendsAtPlace = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(id) {
        var trends, resp, _iterator3, _step3, trend;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _logger["default"].info('fetching trends for ' + id);

                trends = [];
                _context.prev = 2;
                _context.next = 5;
                return this.twit.get('trends/place', {
                  id: id
                });

              case 5:
                resp = _context.sent;
                _iterator3 = _createForOfIteratorHelper(resp.data[0].trends);

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    trend = _step3.value;
                    trends.push({
                      name: trend.name,
                      count: trend.tweet_volume
                    });
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }

                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](2);

                _logger["default"].error("error when fetching trends: ".concat(_context.t0));

              case 13:
                return _context.abrupt("return", trends);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 10]]);
      }));

      function getTrendsAtPlace(_x) {
        return _getTrendsAtPlace.apply(this, arguments);
      }

      return getTrendsAtPlace;
    }()
    /**
     * Gets search results from the Twitter API. Only opts.q and cb are required.
     * The callback function will be called with tweets whenever a certain set of
     * search results have been returned. The search function will keep fetching
     * results until it has fetched opts.count tweets or there are no more to
     * fetch.
     * @param {Object} opts  The options to use when doing the search
     * @param {function} cb  A callback that should receive three arguments: err, tweets, and nextToken
     * @param {string} opts.q  The query to use in the search
     * @param {string} opts.nextToken  A next token to use to get more results
     * @param {string} opts.count  The total number of tweets to fetch (100)
     * @param {boolean} opts.all  Whether to search the full archive (false)
     * @param {string} opts.startDate  A Date or string w/ optional time to search from
     * @param {string} opts.endDate  A Date or string w/ optional time to search until
     * @param {string} opts.sinceId  Get tweets that match query since a tweet id
     * @param {string} opts.maxId  Get tweets that match query until a tweet id
     * @param {boolean} opts.once  Just get one set of results, do not page
     * @returns {Promise}  A promise to indicate the search is complete.
     */

  }, {
    key: "search",
    value: function search(opts, cb) {
      var _this2 = this;

      _logger["default"].info('searching for', opts); // count is the total number of tweets to return across all API requests


      var count = opts.count || 101;

      var params = _objectSpread(_objectSpread({}, _flattenTweet.EVERYTHING), {}, {
        "query": opts.q,
        "max_results": 100
      });

      var endpoint = 'tweets/search/recent';

      if (opts.all) {
        endpoint = 'tweets/search/all';
        params.start_time = '2006-03-21T00:00:00Z';
      }

      if (opts.startDate) {
        var t = new Date(opts.startDate);
        params.start_time = t.toISOString().replace(/\.\d+Z$/, 'Z');
      }

      if (opts.endDate) {
        var _t = new Date(opts.endDate);

        if (_t > new Date()) {
          _logger["default"].info('ignoring search endDate in the future');
        } else {
          params.end_time = _t.toISOString().replace(/\.\d+Z$/, 'Z');
        }
      }

      if (opts.sinceId) {
        params.since_id = opts.sinceId;
        delete params.start_time;
      }

      if (opts.maxId) {
        params.until_id = opts.maxId;
      }

      if (opts.nextToken) {
        params.next_token = opts.nextToken;
      }

      var recurse = function recurse(token, total) {
        if (token) {
          params.next_token = token;
        }

        _logger["default"].info("running search ".concat(JSON.stringify(params)));

        _this2.twitterV2app.get(endpoint, params).then(function (resp) {
          if (resp.data) {
            var nextToken = resp.meta.next_token;
            var tweets = (0, _flattenTweet.flatten)(resp).data;
            var newTotal = total + tweets.length;
            cb(null, tweets.map(function (t) {
              return _this2.extractTweet(t);
            }), nextToken).then(function () {
              if (!opts.once && newTotal < count && nextToken) {
                recurse(nextToken, newTotal);
              } else {
                cb(null, [], null);
              }
            });
          } else {
            _logger["default"].warn("received search response with no data stanza");

            cb(null, [], null);
          }
        })["catch"](function (err) {
          _logger["default"].error("error during search: ".concat(err));

          cb(err, null, null);
        });
      };

      recurse(null, 0);
    }
  }, {
    key: "addFilterRule",
    value: function () {
      var _addFilterRule = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(value, tag) {
        var payload, results;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _logger["default"].info("adding filter rule value=".concat(value, " tag=").concat(tag));

                payload = {
                  "add": [{
                    value: value,
                    tag: tag
                  }]
                };
                results = this.twitterV2app.post('tweets/search/stream/rules', payload);
                return _context2.abrupt("return", results);

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function addFilterRule(_x2, _x3) {
        return _addFilterRule.apply(this, arguments);
      }

      return addFilterRule;
    }()
  }, {
    key: "getFilterRules",
    value: function () {
      var _getFilterRules = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var results;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _logger["default"].info('getting filter rules');

                _context3.next = 3;
                return this.twitterV2app.get('tweets/search/stream/rules');

              case 3:
                results = _context3.sent;

                if (!results.data) {
                  _context3.next = 8;
                  break;
                }

                return _context3.abrupt("return", results.data);

              case 8:
                return _context3.abrupt("return", []);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getFilterRules() {
        return _getFilterRules.apply(this, arguments);
      }

      return getFilterRules;
    }()
  }, {
    key: "deleteFilterRule",
    value: function () {
      var _deleteFilterRule = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(id) {
        var payload, results;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _logger["default"].info("deleting filter rule ".concat(id));

                payload = {
                  "delete": {
                    "ids": [id]
                  }
                };
                results = this.twitterV2app.post('tweets/search/stream/rules', payload);
                return _context4.abrupt("return", results);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteFilterRule(_x4) {
        return _deleteFilterRule.apply(this, arguments);
      }

      return deleteFilterRule;
    }()
  }, {
    key: "filter",
    value: function () {
      var _filter = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(cb) {
        var err, secs, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, response, tweet, tags, result;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _logger["default"].info('starting filter stream ...');

                err = 0;

              case 2:
                if (!true) {
                  _context5.next = 17;
                  break;
                }

                _context5.prev = 3;
                this.stream = this.twitterV2app.stream('tweets/search/stream', _flattenTweet.EVERYTHING);
                return _context5.abrupt("break", 17);

              case 8:
                _context5.prev = 8;
                _context5.t0 = _context5["catch"](3);
                err += 1;
                secs = Math.pow(err, 2);

                _logger["default"].info("caught ".concat(_context5.t0, " while connecting to stream, sleeping ").concat(secs));

                _context5.next = 15;
                return (0, _utils.timer)(secs * 1000);

              case 15:
                _context5.next = 2;
                break;

              case 17:
                _context5.prev = 17;
                _iteratorAbruptCompletion = false;
                _didIteratorError = false;
                _context5.prev = 20;
                _iterator = _asyncIterator(this.stream);

              case 22:
                _context5.next = 24;
                return _iterator.next();

              case 24:
                if (!(_iteratorAbruptCompletion = !(_step = _context5.sent).done)) {
                  _context5.next = 41;
                  break;
                }

                response = _step.value;

                if (!response.data) {
                  _context5.next = 37;
                  break;
                }

                // when streaming response.data is an object, instead of a list
                // flatten ensures that response.data is always a list 
                // so we want to get the first and only element in the list
                tweet = (0, _flattenTweet.flatten)(response).data[0];
                tags = response.matching_rules ? response.matching_rules.map(function (r) {
                  return r.tag;
                }) : []; // if the callback result is not true then we are being told to stop 

                _context5.next = 31;
                return cb(this.extractTweet(tweet), tags);

              case 31:
                result = _context5.sent;

                if (result) {
                  _context5.next = 35;
                  break;
                }

                _logger["default"].info('callback returned false so stopping filter stream');

                return _context5.abrupt("break", 41);

              case 35:
                _context5.next = 38;
                break;

              case 37:
                _logger["default"].error("unexpected filter response: ".concat(JSON.stringify(response)));

              case 38:
                _iteratorAbruptCompletion = false;
                _context5.next = 22;
                break;

              case 41:
                _context5.next = 47;
                break;

              case 43:
                _context5.prev = 43;
                _context5.t1 = _context5["catch"](20);
                _didIteratorError = true;
                _iteratorError = _context5.t1;

              case 47:
                _context5.prev = 47;
                _context5.prev = 48;

                if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                  _context5.next = 52;
                  break;
                }

                _context5.next = 52;
                return _iterator["return"]();

              case 52:
                _context5.prev = 52;

                if (!_didIteratorError) {
                  _context5.next = 55;
                  break;
                }

                throw _iteratorError;

              case 55:
                return _context5.finish(52);

              case 56:
                return _context5.finish(47);

              case 57:
                if (!this.stream) {
                  _context5.next = 62;
                  break;
                }

                _logger["default"].error("stream disconnected normally by Twitter, reconnecting");

                _context5.next = 61;
                return (0, _utils.timer)(1000);

              case 61:
                this.filter(cb);

              case 62:
                _context5.next = 69;
                break;

              case 64:
                _context5.prev = 64;
                _context5.t2 = _context5["catch"](17);
                _context5.next = 68;
                return (0, _utils.timer)(1000);

              case 68:
                _logger["default"].error("stream disconnected with error", _context5.t2);

              case 69:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 8], [17, 64], [20, 43, 47, 57], [48,, 52, 56]]);
      }));

      function filter(_x5) {
        return _filter.apply(this, arguments);
      }

      return filter;
    }()
  }, {
    key: "closeFilter",
    value: function closeFilter() {
      if (this.stream) {
        _logger["default"].info('closing filter stream');

        this.stream.close();
        this.stream = null;
      }
    }
  }, {
    key: "lookup",
    value: function lookup(o, includes) {
      return _objectSpread(_objectSpread({}, o), includes.find(function (i) {
        return o.id === i.id;
      }));
    }
  }, {
    key: "lookupList",
    value: function lookupList(list, includes) {
      var _this3 = this;

      return list ? list.map(function (o) {
        return _this3.lookup(o, includes);
      }) : [];
    }
  }, {
    key: "extractTweet",
    value: function extractTweet(t) {
      var retweet = null;
      var quote = null;

      var _iterator4 = _createForOfIteratorHelper(t.referenced_tweets || []),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ref = _step4.value;

          if (ref.type == 'retweeted') {
            retweet = ref;
          } else if (ref.type === 'quoted') {
            quote = ref;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var hashtags = t.entities && t.entities.hashtags ? t.entities.hashtags.map(function (ht) {
        return ht.tag.toLowerCase();
      }) : [];
      var mentions = t.entities && t.entities.mentions ? t.entities.mentions.map(function (m) {
        return m.username;
      }) : [];
      var place = null;

      if (t.geo) {
        place = {
          id: t.geo.place_id,
          coordinates: t.geo.coordinates
        };
      }

      var urls = [];

      if (t.entities && t.entities.urls) {
        var _iterator5 = _createForOfIteratorHelper(t.entities.urls),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var e = _step5.value;

            var u = _url["default"].parse(e.expanded_url); // not interested in pointers back to Twitter which
            // happens during quoting


            if (u.hostname === 'twitter.com') {
              continue;
            }

            urls.push({
              "short": e.url,
              "long": e.expanded_url,
              hostname: u.hostname
            });
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
      }

      var images = [];
      var videos = [];
      var animatedGifs = [];

      if (t.attachments && t.attachments.media) {
        var _iterator6 = _createForOfIteratorHelper(t.attachments.media),
            _step6;

        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var _e = _step6.value;

            if (_e.type === 'photo') {
              images.push(_e.url);
            } else if (_e.type === 'video') {
              // It would be nice to get the mp4 URL here but Twitter's V2 API
              // doesn't make that available for now we can look it up
              // using the tweet id and the media_key against the v1.1 API
              videos.push(_e.media_key);
            } else if (_e.type === 'animated_gif') {
              animatedGifs.push(_e.preview_image_url);
            }
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      }

      return {
        id: t.id,
        created: new Date(t.created_at),
        twitterUrl: "https://twitter.com/".concat(t.author.username, "/status/").concat(t.id),
        text: decode(t.text),
        language: t.lang,
        client: t.source,
        likeCount: t.public_metrics.like_count,
        retweetCount: t.public_metrics.retweet_count,
        quoteCount: t.public_metrics.quote_count,
        replyCount: t.public_metrics.quote_count,
        retweetId: retweet ? retweet.id : null,
        quoteId: quote ? quote.id : null,
        quote: quote,
        retweet: retweet,
        emojis: emojiMatch.exec(t.text),
        hashtags: hashtags,
        mentions: mentions,
        place: place,
        urls: urls,
        videos: videos,
        images: images,
        animatedGifs: animatedGifs,
        user: {
          id: t.author.id,
          created: new Date(t.author.created_at),
          screenName: t.author.username,
          name: decode(t.author.name),
          description: decode(t.author.description),
          location: decode(t.author.location),
          avatarUrl: t.author.profile_image_url,
          url: t.author.url,
          followersCount: t.author.public_metrics.followers_count,
          friendsCount: t.author.public_metrics.following_count,
          tweetsCount: t.author.public_metrics.tweet_count,
          listedCount: t.author.public_metrics.listed_count
        }
      };
    }
  }, {
    key: "sendTweet",
    value: function () {
      var _sendTweet = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(text) {
        var result;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.twit.post('statuses/update', {
                  status: text
                });

              case 2:
                result = _context6.sent;
                return _context6.abrupt("return", result.data.id_str);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function sendTweet(_x6) {
        return _sendTweet.apply(this, arguments);
      }

      return sendTweet;
    }()
  }, {
    key: "hydrate",
    value: function () {
      var _hydrate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(tweetIds) {
        var resp;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(!tweetIds || tweetIds.length == 0)) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return", null);

              case 2:
                _context7.prev = 2;
                _context7.next = 5;
                return this.twitApp.get('statuses/lookup', {
                  id: tweetIds.join(',')
                });

              case 5:
                resp = _context7.sent;

                if (!(resp.data && resp.data.length > 0)) {
                  _context7.next = 10;
                  break;
                }

                return _context7.abrupt("return", resp.data);

              case 10:
                return _context7.abrupt("return", null);

              case 11:
                _context7.next = 17;
                break;

              case 13:
                _context7.prev = 13;
                _context7.t0 = _context7["catch"](2);

                // note: should raise quota exceeded error here?
                _logger["default"].error("caught error during statuses/lookup call: ".concat(_context7.t0));

                return _context7.abrupt("return", null);

              case 17:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[2, 13]]);
      }));

      function hydrate(_x7) {
        return _hydrate.apply(this, arguments);
      }

      return hydrate;
    }()
  }]);
  return Twitter;
}();

exports.Twitter = Twitter;

function isAcademic(_x8, _x9) {
  return _isAcademic.apply(this, arguments);
}

function _isAcademic() {
  _isAcademic = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(consumerKey, consumerSecret) {
    var twtr, endpoint, params, resp;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            twtr = new _twitterV["default"]({
              consumer_key: consumerKey,
              consumer_secret: consumerSecret
            });
            endpoint = 'tweets/search/all';
            params = {
              query: 'hi',
              start_time: '2006-03-21T00:00:00Z',
              end_time: '2007-03-21T00:00:00Z'
            };

            _logger["default"].info(endpoint, params);

            _context8.next = 7;
            return twtr.get(endpoint, params);

          case 7:
            resp = _context8.sent;

            if (!(resp.data && resp.data.length > 0)) {
              _context8.next = 13;
              break;
            }

            _logger["default"].info('app keys have academic search');

            return _context8.abrupt("return", true);

          case 13:
            _logger["default"].info('app keys do not have academic search: no results');

            return _context8.abrupt("return", false);

          case 15:
            _context8.next = 21;
            break;

          case 17:
            _context8.prev = 17;
            _context8.t0 = _context8["catch"](0);

            _logger["default"].info("app keys do not have academic search turned on: ".concat(_context8.t0));

            return _context8.abrupt("return", false);

          case 21:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 17]]);
  }));
  return _isAcademic.apply(this, arguments);
}