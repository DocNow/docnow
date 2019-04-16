"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Twitter = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _url = _interopRequireDefault(require("url"));

var _twit = _interopRequireDefault(require("twit"));

var _logger = _interopRequireDefault(require("./logger"));

var _bigInteger = _interopRequireDefault(require("big-integer"));

var _emojiRegex = _interopRequireDefault(require("emoji-regex"));

var _htmlEntities = require("html-entities");

var emojiMatch = (0, _emojiRegex["default"])();
var entities = new _htmlEntities.AllHtmlEntities();

function decode(s) {
  return entities.decode(s);
}

var Twitter =
/*#__PURE__*/
function () {
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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = resp.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
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
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = resp.data[0].trends[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var trend = _step2.value;
              place.trends.push({
                name: trend.name,
                tweets: trend.tweet_volume
              });
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
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
      stream.on('tweet', function (tweet) {
        var result = cb(_this4.extractTweet(tweet));

        if (result === false) {
          _logger["default"].info('stopping stream for: ', {
            stream: params
          });

          stream.stop();
        }
      });
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = t.entities.urls[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
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
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
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
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = t.extended_entities.media[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _e = _step4.value;

            if (_e.type === 'photo') {
              images.push(_e.media_url_https);
            } else if (_e.type === 'video') {
              var maxBitRate = 0;
              var videoUrl = null;
              var _iteratorNormalCompletion5 = true;
              var _didIteratorError5 = false;
              var _iteratorError5 = undefined;

              try {
                for (var _iterator5 = _e.video_info.variants[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                  var v = _step5.value;

                  if (v.content_type === 'video/mp4' && v.bitrate > maxBitRate) {
                    videoUrl = v.url;
                    maxBitRate = v.bitrate;
                  }
                }
              } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                    _iterator5["return"]();
                  }
                } finally {
                  if (_didIteratorError5) {
                    throw _iteratorError5;
                  }
                }
              }

              if (videoUrl) {
                videos.push(videoUrl);
              }
            } else if (_e.type === 'animated_gif') {
              animatedGifs.push(_e.media_url_https);
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
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