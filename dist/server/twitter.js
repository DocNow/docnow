"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Twitter = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _url = _interopRequireDefault(require("url"));

var _twit = _interopRequireDefault(require("twit"));

var _logger = _interopRequireDefault(require("./logger"));

var _bigInteger = _interopRequireDefault(require("big-integer"));

var _emojiRegex = _interopRequireDefault(require("emoji-regex"));

var _htmlEntities = require("html-entities");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
    this.accessTokenSecret = keys.accessTokenSecret || process.env.ACCESS_TOKEN_SECRET;
    this.twit = new _twit["default"]({
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      access_token: this.accessToken,
      access_token_secret: this.accessTokenSecret
    });
  }

  (0, _createClass2["default"])(Twitter, [{
    key: "getPlaces",
    value: function getPlaces() {
      var _this = this;

      return new Promise(function (resolve) {
        _this.twit.get('trends/available').then(function (resp) {
          var places = [];

          var _iterator = _createForOfIteratorHelper(resp.data),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var place = _step.value;
              places.push({
                id: place.woeid,
                name: place.name,
                type: place.placeType.name,
                country: place.country || '',
                countryCode: place.countryCode || '',
                parent: place.parentid || ''
              });
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          resolve(places);
        });
      });
    }
  }, {
    key: "getTrendsAtPlace",
    value: function getTrendsAtPlace(woeId) {
      var _this2 = this;

      _logger["default"].info('fetching trends for ' + woeId);

      return new Promise(function (resolve, reject) {
        _this2.twit.get('trends/place', {
          id: woeId
        }).then(function (resp) {
          var place = {
            id: resp.data[0].locations[0].woeid,
            name: resp.data[0].locations[0].name,
            trends: []
          };

          var _iterator2 = _createForOfIteratorHelper(resp.data[0].trends),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var trend = _step2.value;
              place.trends.push({
                name: trend.name,
                tweets: trend.tweet_volume
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          resolve(place);
        }).error(function (msg) {
          reject(msg);
        });
      });
    }
  }, {
    key: "search",
    value: function search(opts, cb) {
      var _this3 = this;

      var count = opts.count || 100;
      var params = {
        q: opts.q,
        tweet_mode: 'extended',
        result_type: opts.resultType || 'recent',
        count: 100,
        since_id: opts.sinceId,
        include_entities: true
      };

      var recurse = function recurse(maxId, total) {
        var newParams = Object.assign({
          max_id: maxId
        }, params);

        _logger["default"].info('searching twitter', {
          params: newParams
        });

        _this3.twit.get('search/tweets', newParams).then(function (resp) {
          if (resp.data.errors) {
            cb(resp.data.errors[0], null);
          } else {
            var tweets = resp.data.statuses;
            var newTotal = total + tweets.length;
            cb(null, tweets.map(function (s) {
              return _this3.extractTweet(s);
            }));

            if (tweets.length > 0 && newTotal < count) {
              var newMaxId = String((0, _bigInteger["default"])(tweets[tweets.length - 1].id_str).minus(1));
              recurse(newMaxId, newTotal);
            } else {
              cb(null, []);
            }
          }
        });
      };

      recurse(opts.maxId, 0);
    }
  }, {
    key: "filter",
    value: function filter(opts, cb) {
      var _this4 = this;

      var params = {
        track: opts.track,
        tweet_mode: 'extended',
        include_entities: true
      };

      _logger["default"].info('starting stream for: ', {
        stream: params
      });

      var stream = this.twit.stream('statuses/filter', params);
      stream.on('tweet', /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(tweet) {
          var result;
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return cb(_this4.extractTweet(tweet));

                case 2:
                  result = _context.sent;

                  if (result === false) {
                    _logger["default"].info('stopping stream for: ', {
                      stream: params
                    });

                    stream.stop();
                  }

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "extractTweet",
    value: function extractTweet(t) {
      var created = new Date(t.created_at);
      var userCreated = new Date(t.user.created_at);
      var hashtags = t.entities.hashtags.map(function (ht) {
        return ht.text.toLowerCase();
      });
      var mentions = t.entities.user_mentions.map(function (m) {
        return m.screen_name;
      });
      var geo = null;

      if (t.coordinates) {
        geo = t.coordinates;
      }

      var emojis = emojiMatch.exec(t.full_text);
      var retweet = null;

      if (t.retweeted_status) {
        retweet = this.extractTweet(t.retweeted_status);
      }

      var quote = null;

      if (t.quoted_status) {
        quote = this.extractTweet(t.quoted_status);
      }

      var place = null;

      if (t.place) {
        place = {
          name: t.place.full_name,
          type: t.place.place_type,
          id: t.place.id,
          country: t.place.country,
          countryCode: t.place.country_code,
          boundingBox: t.place.bounding_box
        };
      }

      var urls = [];

      if (t.entities.urls) {
        var _iterator3 = _createForOfIteratorHelper(t.entities.urls),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var e = _step3.value;

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
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }

      var userUrl = null;

      if (t.user.entities && t.user.entities.url) {
        userUrl = t.user.entities.url.urls[0].expanded_url;
      }

      var images = [];
      var videos = [];
      var animatedGifs = [];

      if (t.extended_entities && t.extended_entities.media) {
        var _iterator4 = _createForOfIteratorHelper(t.extended_entities.media),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var _e = _step4.value;

            if (_e.type === 'photo') {
              images.push(_e.media_url_https);
            } else if (_e.type === 'video') {
              var maxBitRate = 0;
              var videoUrl = null;

              var _iterator5 = _createForOfIteratorHelper(_e.video_info.variants),
                  _step5;

              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var v = _step5.value;

                  if (v.content_type === 'video/mp4' && v.bitrate > maxBitRate) {
                    videoUrl = v.url;
                    maxBitRate = v.bitrate;
                  }
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }

              if (videoUrl) {
                videos.push(videoUrl);
              }
            } else if (_e.type === 'animated_gif') {
              animatedGifs.push(_e.media_url_https);
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }

      var text = t.text;

      if (retweet) {
        text = retweet.text;
      } else if (t.extended_tweet) {
        text = t.extended_tweet.full_text;
      } else if (t.full_text) {
        text = t.full_text;
      }

      return {
        id: t.id_str,
        text: decode(text),
        twitterUrl: 'https://twitter.com/' + t.user.screen_name + '/status/' + t.id_str,
        likeCount: t.favorite_count,
        retweetCount: t.retweet_count,
        client: t.source ? t.source.match(/>(.+?)</)[1] : null,
        user: {
          id: t.user.id_str,
          screenName: t.user.screen_name,
          name: decode(t.user.name),
          description: decode(t.user.description),
          location: decode(t.user.location),
          created: userCreated,
          avatarUrl: t.user.profile_image_url_https,
          url: userUrl,
          followersCount: t.user.followers_count,
          friendsCount: t.user.friends_count,
          tweetsCount: t.user.statuses_count,
          listedCount: t.user.listed_count
        },
        created: created,
        hashtags: hashtags,
        mentions: mentions,
        geo: geo,
        place: place,
        urls: urls,
        images: images,
        videos: videos,
        animatedGifs: animatedGifs,
        emojis: emojis,
        retweet: retweet,
        quote: quote
      };
    }
  }]);
  return Twitter;
}();

exports.Twitter = Twitter;