"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Database = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

require("../env");

var _knex = _interopRequireDefault(require("knex"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _elasticsearch = _interopRequireDefault(require("elasticsearch"));

var _redis = require("./redis");

var _objection = require("objection");

var _Setting = _interopRequireDefault(require("./models/Setting"));

var _Place = _interopRequireDefault(require("./models/Place"));

var _User = _interopRequireDefault(require("./models/User"));

var _logger = _interopRequireDefault(require("./logger"));

var _twitter = require("./twitter");

var _urlFetcher = require("./url-fetcher");

var _utils = require("./utils");

var _knexfile = _interopRequireDefault(require("../../knexfile"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// elasticsearch doc types
var USER = 'user';
var SEARCH = 'search';
var TREND = 'trend';
var TWEET = 'tweet';
var TWUSER = 'twuser';
var urlFetcher = new _urlFetcher.UrlFetcher(); // const db = knex(knexfile)
// Model.knex(db)

var Database = /*#__PURE__*/function () {
  function Database() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Database);
    // setup redis
    this.redis = (0, _redis.getRedis)();
    var pg = (0, _knex["default"])(_knexfile["default"]);

    _objection.Model.knex(pg);

    this.pg = pg; // setup elasticsearch

    var esOpts = opts.es || {};
    esOpts.host = esOpts.host || process.env.ES_HOST || '127.0.0.1:9200';

    _logger["default"].info('connecting to elasticsearch:', esOpts);

    if (process.env.NODE_ENV === 'test') {
      this.esPrefix = 'test';
    } else {
      this.esPrefix = 'docnow';
    }

    this.es = new _elasticsearch["default"].Client(esOpts);
  }

  (0, _createClass2["default"])(Database, [{
    key: "getIndex",
    value: function getIndex(type) {
      return this.esPrefix + '-' + type;
    }
  }, {
    key: "close",
    value: function close() {
      this.pg.destroy();
      this.redis.quit();
      urlFetcher.stop();
    }
  }, {
    key: "clear",
    value: function () {
      var _clear = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.redis.flushdbAsync();

              case 2:
                _context.next = 4;
                return this.deleteIndexes();

              case 4:
                _context.next = 6;
                return this.pg.migrate.currentVersion();

              case 6:
                _context.t0 = _context.sent;

                if (!(_context.t0 != "none")) {
                  _context.next = 10;
                  break;
                }

                _context.next = 10;
                return this.pg.migrate.rollback(null, true);

              case 10:
                _context.next = 12;
                return this.pg.migrate.latest();

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clear() {
        return _clear.apply(this, arguments);
      }

      return clear;
    }()
  }, {
    key: "add",
    value: function add(type, id, doc) {
      var _this = this;

      _logger["default"].debug("update ".concat(type, " ").concat(id), doc);

      return new Promise(function (resolve, reject) {
        _this.es.index({
          index: _this.getIndex(type),
          type: type,
          id: id,
          body: doc,
          refresh: 'wait_for'
        }).then(function () {
          resolve(doc);
        })["catch"](reject);
      });
    }
  }, {
    key: "get",
    value: function get(type, id) {
      var _this2 = this;

      _logger["default"].debug("get type=".concat(type, " id=").concat(id));

      return new Promise(function (resolve, reject) {
        _this2.es.get({
          index: _this2.getIndex(type),
          type: type,
          id: id
        }).then(function (result) {
          resolve(result._source);
        })["catch"](function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "search",
    value: function search(type, q) {
      var _this3 = this;

      var first = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      _logger["default"].debug('search', type, q, first);

      var size = first ? 1 : 1000;
      return new Promise(function (resolve, reject) {
        _this3.es.search({
          index: _this3.getIndex(type),
          type: type,
          q: q,
          size: size
        }).then(function (result) {
          if (result.hits.total > 0) {
            if (first) {
              resolve(result.hits.hits[0]._source);
            } else {
              resolve(result.hits.hits.map(function (h) {
                return h._source;
              }));
            }
          } else if (first) {
            resolve(null);
          } else {
            resolve([]);
          }
        })["catch"](reject);
      });
    }
  }, {
    key: "addSettings",
    value: function () {
      var _addSettings = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(settings) {
        var objects, prop;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // convert settings object into a sequence of name/value objects
                objects = [];

                for (prop in settings) {
                  if (Object.prototype.hasOwnProperty.call(settings, prop)) {
                    objects.push({
                      name: prop,
                      value: settings[prop]
                    });
                  }
                }

                _context3.next = 4;
                return _Setting["default"].transaction( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(trx) {
                    return _regenerator["default"].wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return _Setting["default"].query(trx)["delete"]();

                          case 2:
                            _context2.next = 4;
                            return _Setting["default"].query(trx).insert(objects);

                          case 4:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 4:
                return _context3.abrupt("return", settings);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function addSettings(_x) {
        return _addSettings.apply(this, arguments);
      }

      return addSettings;
    }()
  }, {
    key: "getSettings",
    value: function () {
      var _getSettings = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var settings, rows, _iterator, _step, row;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                settings = {};
                _context4.next = 3;
                return _Setting["default"].query().select('name', 'value');

              case 3:
                rows = _context4.sent;
                _iterator = _createForOfIteratorHelper(rows);

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    row = _step.value;
                    settings[row.name] = row.value;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                return _context4.abrupt("return", settings);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getSettings() {
        return _getSettings.apply(this, arguments);
      }

      return getSettings;
    }()
  }, {
    key: "addUser",
    value: function () {
      var _addUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(user) {
        var settings, su, newUser;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.getSettings();

              case 2:
                settings = _context5.sent;
                user.tweetQuota = user.tweetQuota || settings.defaultQuota;
                _context5.next = 6;
                return this.getSuperUser();

              case 6:
                su = _context5.sent;
                user.isSuperUser = su ? false : true;
                _context5.next = 10;
                return _User["default"].query().insert(user);

              case 10:
                newUser = _context5.sent;

                if (!newUser.isSuperUser) {
                  _context5.next = 14;
                  break;
                }

                _context5.next = 14;
                return this.loadPlaces();

              case 14:
                return _context5.abrupt("return", newUser);

              case 15:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function addUser(_x3) {
        return _addUser.apply(this, arguments);
      }

      return addUser;
    }()
  }, {
    key: "updateUser",
    value: function () {
      var _updateUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(user) {
        var newUser;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _User["default"].query().update(user).where('id', user.id);

              case 2:
                newUser = _context6.sent;
                return _context6.abrupt("return", newUser);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function updateUser(_x4) {
        return _updateUser.apply(this, arguments);
      }

      return updateUser;
    }()
  }, {
    key: "getUser",
    value: function () {
      var _getUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(userId) {
        var user;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return _User["default"].query().first().where('id', '=', userId);

              case 2:
                user = _context7.sent;
                return _context7.abrupt("return", user);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function getUser(_x5) {
        return _getUser.apply(this, arguments);
      }

      return getUser;
    }()
  }, {
    key: "getUsers",
    value: function () {
      var _getUsers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
        var users;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _User["default"].query().select();

              case 2:
                users = _context8.sent;
                return _context8.abrupt("return", users);

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function getUsers() {
        return _getUsers.apply(this, arguments);
      }

      return getUsers;
    }()
  }, {
    key: "getSuperUser",
    value: function () {
      var _getSuperUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
        var user;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return _User["default"].query().first().where('isSuperUser', '=', true);

              case 2:
                user = _context9.sent;
                return _context9.abrupt("return", user);

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function getSuperUser() {
        return _getSuperUser.apply(this, arguments);
      }

      return getSuperUser;
    }()
  }, {
    key: "getUserByTwitterUserId",
    value: function getUserByTwitterUserId(userId) {
      return _User["default"].query().first().where('twitter_user_id', '=', userId);
    }
  }, {
    key: "getUserByTwitterScreenName",
    value: function getUserByTwitterScreenName(twitterScreenName) {
      return this.query().first().where('twitterScreeName', '=', twitterScreenName);
    }
  }, {
    key: "importLatestTrends",
    value: function importLatestTrends() {
      var _this4 = this;

      return new Promise(function (resolve) {
        _this4.getUsers().then(function (users) {
          var _iterator2 = _createForOfIteratorHelper(users),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var user = _step2.value;

              _this4.importLatestTrendsForUser(user).then(resolve);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        })["catch"](function () {
          _logger["default"].info('no users to import trends for');

          resolve();
        });
      });
    }
  }, {
    key: "importLatestTrendsForUser",
    value: function importLatestTrendsForUser(user) {
      var _this5 = this;

      _logger["default"].debug('importing trends', {
        user: user
      });

      return new Promise(function (resolve, reject) {
        _this5.getTwitterClientForUser(user).then(function (twtr) {
          var placeIds = user.places.map(_utils.stripPrefix);

          if (placeIds.length === 0) {
            resolve([]);
          } else {
            _logger["default"].info('importing trends for ', {
              placeIds: placeIds
            });

            Promise.all(placeIds.map(twtr.getTrendsAtPlace, twtr)).then(_this5.saveTrends.bind(_this5)).then(resolve);
          }
        })["catch"](reject);
      });
    }
  }, {
    key: "startTrendsWatcher",
    value: function startTrendsWatcher() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _logger["default"].info('starting trend watcher');

      this.importLatestTrends();
      this.trendsWatcherId = setInterval(this.importLatestTrends.bind(this), opts.interval || 60 * 1000);
    }
  }, {
    key: "stopTrendsWatcher",
    value: function stopTrendsWatcher() {
      _logger["default"].info('stopping trend watcher');

      if (this.trendsWatcherId) {
        clearInterval(this.trendsWatcherId);
        this.trendsWatcherId = null;
      }
    }
  }, {
    key: "getTrendsForPlace",
    value: function getTrendsForPlace(placeId) {
      var _this6 = this;

      return new Promise(function (resolve) {
        _this6.search('trend', "placeId:".concat(placeId), true).then(function (results) {
          var filtered = results.trends.filter(function (t) {
            return t.tweets > 0;
          });
          filtered.sort(function (a, b) {
            return b.tweets - a.tweets;
          });
          results.trends = filtered;
          resolve(results);
        });
      });
    }
  }, {
    key: "getUserTrends",
    value: function getUserTrends(user) {
      if (user && user.places) {
        return Promise.all(user.places.map(this.getTrendsForPlace, this));
      }
    }
  }, {
    key: "saveTrends",
    value: function saveTrends(trends) {
      var _this7 = this;

      var body = [];

      var _iterator3 = _createForOfIteratorHelper(trends),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var trend = _step3.value;
          trend.id = (0, _utils.addPrefix)('trend', trend.id);
          trend.placeId = (0, _utils.addPrefix)('place', (0, _utils.stripPrefix)(trend.id));
          body.push({
            index: {
              _index: this.getIndex(TREND),
              _type: 'trend',
              _id: trend.id
            },
            refresh: 'wait_for'
          }, trend);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return new Promise(function (resolve, reject) {
        _this7.es.bulk({
          body: body,
          refresh: 'wait_for'
        }).then(function () {
          resolve(trends);
        })["catch"](function (err) {
          _logger["default"].error('bulk insert failed', err);

          reject(err);
        });
      });
    }
  }, {
    key: "loadPlaces",
    value: function () {
      var _loadPlaces = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
        var user, twitter, places;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return _Place["default"].query()["delete"]();

              case 2:
                _context10.next = 4;
                return this.getSuperUser();

              case 4:
                user = _context10.sent;
                _context10.next = 7;
                return this.getTwitterClientForUser(user);

              case 7:
                twitter = _context10.sent;
                _context10.next = 10;
                return twitter.getPlaces();

              case 10:
                places = _context10.sent;
                _context10.next = 13;
                return _Place["default"].query().insert(places);

              case 13:
                return _context10.abrupt("return", places);

              case 14:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function loadPlaces() {
        return _loadPlaces.apply(this, arguments);
      }

      return loadPlaces;
    }()
  }, {
    key: "getPlace",
    value: function getPlace(placeId) {
      var place = _Place["default"].query().first().where('id', '=', placeId);

      return place;
    }
  }, {
    key: "getPlaces",
    value: function getPlaces() {
      return _Place["default"].query().select();
    }
  }, {
    key: "getTwitterClientForUser",
    value: function getTwitterClientForUser(user) {
      var _this8 = this;

      return new Promise(function (resolve) {
        _this8.getSettings().then(function (settings) {
          resolve(new _twitter.Twitter({
            consumerKey: settings.appKey,
            consumerSecret: settings.appSecret,
            accessToken: user.twitterAccessToken,
            accessTokenSecret: user.twitterAccessTokenSecret
          }));
        });
      });
    }
  }, {
    key: "createSearch",
    value: function createSearch(user, query) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        var search = {
          id: (0, _v["default"])(),
          creator: user.id,
          query: query,
          created: new Date().toISOString(),
          updated: new Date(),
          maxTweetId: null,
          active: true
        };

        _this9.es.create({
          index: _this9.getIndex(SEARCH),
          type: SEARCH,
          id: search.id,
          body: search
        }).then(function () {
          resolve(search);
        })["catch"](function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "deleteSearch",
    value: function () {
      var _deleteSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(search) {
        var resp;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _logger["default"].info('deleting search', {
                  id: search.id
                });

                _context11.next = 3;
                return this.es["delete"]({
                  index: this.getIndex(SEARCH),
                  type: SEARCH,
                  id: search.id
                });

              case 3:
                resp = _context11.sent;
                return _context11.abrupt("return", resp && resp.result === 'deleted');

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function deleteSearch(_x6) {
        return _deleteSearch.apply(this, arguments);
      }

      return deleteSearch;
    }()
  }, {
    key: "getUserSearches",
    value: function () {
      var _getUserSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(user) {
        var body, resp, searches, _iterator4, _step4, hit, search, stats;

        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                body = {
                  query: {
                    bool: {
                      must: [{
                        match: {
                          creator: user.id
                        }
                      }, {
                        match: {
                          saved: true
                        }
                      }]
                    }
                  },
                  sort: [{
                    created: 'desc'
                  }]
                };
                _context12.next = 3;
                return this.es.search({
                  index: this.getIndex(SEARCH),
                  type: SEARCH,
                  body: body
                });

              case 3:
                resp = _context12.sent;
                searches = [];
                _iterator4 = _createForOfIteratorHelper(resp.hits.hits);
                _context12.prev = 6;

                _iterator4.s();

              case 8:
                if ((_step4 = _iterator4.n()).done) {
                  _context12.next = 17;
                  break;
                }

                hit = _step4.value;
                search = hit._source;
                _context12.next = 13;
                return this.getSearchStats(search);

              case 13:
                stats = _context12.sent;
                searches.push(_objectSpread(_objectSpread({}, search), stats));

              case 15:
                _context12.next = 8;
                break;

              case 17:
                _context12.next = 22;
                break;

              case 19:
                _context12.prev = 19;
                _context12.t0 = _context12["catch"](6);

                _iterator4.e(_context12.t0);

              case 22:
                _context12.prev = 22;

                _iterator4.f();

                return _context12.finish(22);

              case 25:
                return _context12.abrupt("return", searches);

              case 26:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[6, 19, 22, 25]]);
      }));

      function getUserSearches(_x7) {
        return _getUserSearches.apply(this, arguments);
      }

      return getUserSearches;
    }()
  }, {
    key: "userOverQuota",
    value: function () {
      var _userOverQuota = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(user) {
        var searches, total, _iterator5, _step5, s;

        return _regenerator["default"].wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.getUserSearches(user);

              case 2:
                searches = _context13.sent;
                total = 0;
                _iterator5 = _createForOfIteratorHelper(searches);

                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    s = _step5.value;
                    total += s.tweetCount;
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }

                return _context13.abrupt("return", total > user.tweetQuota);

              case 7:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function userOverQuota(_x8) {
        return _userOverQuota.apply(this, arguments);
      }

      return userOverQuota;
    }()
  }, {
    key: "getSearch",
    value: function () {
      var _getSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(searchId) {
        var search, stats;
        return _regenerator["default"].wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return this.get(SEARCH, searchId);

              case 2:
                search = _context14.sent;
                _context14.next = 5;
                return this.getSearchStats(search);

              case 5:
                stats = _context14.sent;
                return _context14.abrupt("return", _objectSpread(_objectSpread({}, search), stats));

              case 7:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function getSearch(_x9) {
        return _getSearch.apply(this, arguments);
      }

      return getSearch;
    }()
  }, {
    key: "updateSearch",
    value: function updateSearch(search) {
      search.updated = new Date();
      return this.add(SEARCH, search.id, search);
    }
  }, {
    key: "getSearchSummary",
    value: function () {
      var _getSearchSummary = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(search) {
        var body, resp, stats;
        return _regenerator["default"].wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                body = {
                  query: {
                    match: {
                      search: search.id
                    }
                  },
                  aggregations: {
                    minDate: {
                      min: {
                        field: 'created'
                      }
                    },
                    maxDate: {
                      max: {
                        field: 'created'
                      }
                    }
                  }
                };
                _context15.next = 3;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 3:
                resp = _context15.sent;
                _context15.next = 6;
                return this.getSearchStats(search);

              case 6:
                stats = _context15.sent;
                return _context15.abrupt("return", _objectSpread(_objectSpread(_objectSpread({}, search), stats), {}, {
                  minDate: new Date(resp.aggregations.minDate.value),
                  maxDate: new Date(resp.aggregations.maxDate.value)
                }));

              case 8:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function getSearchSummary(_x10) {
        return _getSearchSummary.apply(this, arguments);
      }

      return getSearchSummary;
    }()
  }, {
    key: "getSearchStats",
    value: function () {
      var _getSearchStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(search) {
        var tweetCount, userCount, videoCount, imageCount, urlCount;
        return _regenerator["default"].wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return this.redis.getAsync((0, _redis.tweetsCountKey)(search));

              case 2:
                tweetCount = _context16.sent;
                _context16.next = 5;
                return this.redis.zcardAsync((0, _redis.usersCountKey)(search));

              case 5:
                userCount = _context16.sent;
                _context16.next = 8;
                return this.redis.zcardAsync((0, _redis.videosCountKey)(search));

              case 8:
                videoCount = _context16.sent;
                _context16.next = 11;
                return this.redis.zcardAsync((0, _redis.imagesCountKey)(search));

              case 11:
                imageCount = _context16.sent;
                _context16.next = 14;
                return this.redis.zcardAsync((0, _redis.urlsKey)(search));

              case 14:
                urlCount = _context16.sent;
                return _context16.abrupt("return", {
                  tweetCount: parseInt(tweetCount || 0, 10),
                  imageCount: imageCount,
                  videoCount: videoCount,
                  userCount: userCount,
                  urlCount: urlCount
                });

              case 16:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function getSearchStats(_x11) {
        return _getSearchStats.apply(this, arguments);
      }

      return getSearchStats;
    }()
  }, {
    key: "importFromSearch",
    value: function importFromSearch(search) {
      var _this10 = this;

      var maxTweets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
      var count = 0;
      var totalCount = search.count || 0;
      var maxTweetId = null;
      var queryParts = [];

      var _iterator6 = _createForOfIteratorHelper(search.query),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var term = _step6.value;

          if (term.type === 'keyword') {
            queryParts.push(term.value);
          } else if (term.type === 'user') {
            queryParts.push('@' + term.value);
          } else if (term.type === 'phrase') {
            queryParts.push("\"".concat(term.value, "\""));
          } else if (term.type === 'hashtag') {
            queryParts.push(term.value);
          } else {
            _logger["default"].warn('search is missing a type: ', search);

            queryParts.push(term.value);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var q = queryParts.join(' OR ');
      return new Promise(function (resolve, reject) {
        _this10.getUser(search.creator).then(function (user) {
          _this10.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
            active: true
          })).then(function (newSearch) {
            _this10.getTwitterClientForUser(user).then(function (twtr) {
              twtr.search({
                q: q,
                sinceId: search.maxTweetId,
                count: maxTweets
              }, function (err, results) {
                if (err) {
                  reject(err);
                } else if (results.length === 0) {
                  newSearch.count = totalCount;
                  newSearch.maxTweetId = maxTweetId;
                  newSearch.active = false;

                  _this10.updateSearch(newSearch).then(function () {
                    resolve(count);
                  });
                } else {
                  count += results.length;
                  totalCount += results.length;

                  if (maxTweetId === null) {
                    maxTweetId = results[0].id;
                  }

                  _this10.loadTweets(search, results).then(function () {
                    _logger["default"].info('bulk loaded ' + results.items + ' objects');
                  });
                }
              });
            });
          })["catch"](function (e) {
            _logger["default"].error('unable to update search: ', e);
          });
        });
      });
    }
  }, {
    key: "loadTweets",
    value: function loadTweets(search, tweets) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        var bulk = [];
        var seenUsers = new Set();

        var _iterator7 = _createForOfIteratorHelper(tweets),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var tweet = _step7.value;

            _this11.tallyTweet(search, tweet);

            var _iterator8 = _createForOfIteratorHelper(tweet.urls),
                _step8;

            try {
              for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                var url = _step8.value;
                urlFetcher.add(search, url["long"], tweet.id);
              }
            } catch (err) {
              _iterator8.e(err);
            } finally {
              _iterator8.f();
            }

            tweet.search = search.id;
            var id = search.id + ':' + tweet.id;
            bulk.push({
              index: {
                _index: _this11.getIndex(TWEET),
                _type: 'tweet',
                _id: id
              }
            }, tweet);

            if (!seenUsers.has(tweet.user.id)) {
              bulk.push({
                index: {
                  _index: _this11.getIndex(TWUSER),
                  _type: 'twuser',
                  _id: tweet.user.id
                }
              }, tweet.user);
              seenUsers.add(tweet.user.id);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }

        _this11.es.bulk({
          body: bulk,
          refresh: 'wait_for'
        }).then(function (resp) {
          if (resp.errors) {
            reject('indexing error check elasticsearch log');
          } else {
            resolve(resp);
          }
        })["catch"](function (elasticErr) {
          _logger["default"].error(elasticErr.message);

          reject(elasticErr.message);
        });
      });
    }
  }, {
    key: "tallyTweet",
    value: function tallyTweet(search, tweet) {
      this.redis.incr((0, _redis.tweetsCountKey)(search));
      this.redis.zincrby((0, _redis.usersCountKey)(search), 1, tweet.user.screenName);

      var _iterator9 = _createForOfIteratorHelper(tweet.videos),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var video = _step9.value;
          this.redis.zincrby((0, _redis.videosCountKey)(search), 1, video);
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      var _iterator10 = _createForOfIteratorHelper(tweet.images),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var image = _step10.value;
          this.redis.zincrby((0, _redis.imagesCountKey)(search), 1, image);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  }, {
    key: "getTweets",
    value: function getTweets(search) {
      var _this12 = this;

      var includeRetweets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var body = {
        from: offset,
        size: 100,
        query: {
          bool: {
            must: {
              term: {
                search: search.id
              }
            }
          }
        },
        sort: {
          created: 'desc'
        }
      }; // adjust the query and sorting if they don't want retweets

      if (!includeRetweets) {
        body.query.bool.must_not = {
          exists: {
            field: 'retweet'
          }
        };
        body.sort = [{
          retweetCount: 'desc'
        }, {
          created: 'desc'
        }];
      }

      return new Promise(function (resolve, reject) {
        _this12.es.search({
          index: _this12.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response) {
          resolve(response.hits.hits.map(function (h) {
            return h._source;
          }));
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "getAllTweets",
    value: function () {
      var _getAllTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17(search, cb) {
        var response, scrollId;
        return _regenerator["default"].wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  q: 'search:' + search.id,
                  scroll: '1m',
                  size: 100
                });

              case 2:
                response = _context17.sent;
                response.hits.hits.map(function (hit) {
                  cb(hit._source);
                });
                scrollId = response._scroll_id;

              case 5:
                if (!true) {
                  _context17.next = 14;
                  break;
                }

                _context17.next = 8;
                return this.es.scroll({
                  scrollId: scrollId,
                  scroll: '1m'
                });

              case 8:
                response = _context17.sent;

                if (!(response.hits.hits.length === 0)) {
                  _context17.next = 11;
                  break;
                }

                return _context17.abrupt("break", 14);

              case 11:
                response.hits.hits.map(function (hit) {
                  cb(hit._source);
                });
                _context17.next = 5;
                break;

              case 14:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function getAllTweets(_x12, _x13) {
        return _getAllTweets.apply(this, arguments);
      }

      return getAllTweets;
    }()
  }, {
    key: "getTweetsForUrl",
    value: function () {
      var _getTweetsForUrl = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(search, url) {
        var ids, body, resp;
        return _regenerator["default"].wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return urlFetcher.getTweetIdentifiers(search, url);

              case 2:
                ids = _context18.sent;
                body = {
                  size: 100,
                  query: {
                    bool: {
                      must: [{
                        match: {
                          search: search.id
                        }
                      }],
                      filter: {
                        terms: {
                          id: ids
                        }
                      }
                    }
                  },
                  sort: [{
                    id: 'desc'
                  }]
                };
                _context18.next = 6;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 6:
                resp = _context18.sent;
                return _context18.abrupt("return", resp.hits.hits.map(function (h) {
                  return h._source;
                }));

              case 8:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function getTweetsForUrl(_x14, _x15) {
        return _getTweetsForUrl.apply(this, arguments);
      }

      return getTweetsForUrl;
    }()
  }, {
    key: "getTweetsForImage",
    value: function () {
      var _getTweetsForImage = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(search, url) {
        var body, resp;
        return _regenerator["default"].wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                body = {
                  size: 100,
                  query: {
                    bool: {
                      must: [{
                        match: {
                          search: search.id
                        }
                      }],
                      filter: {
                        terms: {
                          images: [url]
                        }
                      }
                    }
                  },
                  sort: [{
                    id: 'desc'
                  }]
                };
                _context19.next = 3;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 3:
                resp = _context19.sent;
                return _context19.abrupt("return", resp.hits.hits.map(function (h) {
                  return h._source;
                }));

              case 5:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function getTweetsForImage(_x16, _x17) {
        return _getTweetsForImage.apply(this, arguments);
      }

      return getTweetsForImage;
    }()
  }, {
    key: "getTweetsForUser",
    value: function () {
      var _getTweetsForUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(search, handle) {
        var body, resp;
        return _regenerator["default"].wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                body = {
                  size: 100,
                  query: {
                    bool: {
                      must: [{
                        match: {
                          search: search.id
                        }
                      }, {
                        match: {
                          'user.screenName': handle
                        }
                      }]
                    }
                  },
                  sort: [{
                    id: 'desc'
                  }]
                };
                _context20.next = 3;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 3:
                resp = _context20.sent;
                return _context20.abrupt("return", resp.hits.hits.map(function (h) {
                  return h._source;
                }));

              case 5:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function getTweetsForUser(_x18, _x19) {
        return _getTweetsForUser.apply(this, arguments);
      }

      return getTweetsForUser;
    }()
  }, {
    key: "getTweetsForVideo",
    value: function () {
      var _getTweetsForVideo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee21(search, url) {
        var body, resp;
        return _regenerator["default"].wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                body = {
                  size: 100,
                  query: {
                    bool: {
                      must: [{
                        match: {
                          search: search.id
                        }
                      }],
                      filter: {
                        terms: {
                          videos: [url]
                        }
                      }
                    }
                  },
                  sort: [{
                    id: 'desc'
                  }]
                };
                _context21.next = 3;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 3:
                resp = _context21.sent;
                return _context21.abrupt("return", resp.hits.hits.map(function (h) {
                  return h._source;
                }));

              case 5:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function getTweetsForVideo(_x20, _x21) {
        return _getTweetsForVideo.apply(this, arguments);
      }

      return getTweetsForVideo;
    }()
  }, {
    key: "getTweetsByIds",
    value: function () {
      var _getTweetsByIds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee22(search, ids) {
        var body, resp;
        return _regenerator["default"].wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                body = {
                  size: 100,
                  query: {
                    bool: {
                      must: [{
                        match: {
                          search: search.id
                        }
                      }],
                      filter: {
                        terms: {
                          id: ids
                        }
                      }
                    }
                  },
                  sort: [{
                    id: 'desc'
                  }]
                };
                _context22.next = 3;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: body
                });

              case 3:
                resp = _context22.sent;
                return _context22.abrupt("return", resp.hits.hits.map(function (h) {
                  return h._source;
                }));

              case 5:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function getTweetsByIds(_x22, _x23) {
        return _getTweetsByIds.apply(this, arguments);
      }

      return getTweetsByIds;
    }()
  }, {
    key: "getTwitterUsers",
    value: function getTwitterUsers(search) {
      var _this13 = this;

      // first get the user counts for tweets
      var body = {
        query: {
          match: {
            search: search.id
          }
        },
        aggregations: {
          users: {
            terms: {
              field: 'user.screenName',
              size: 100
            }
          }
        }
      };
      return new Promise(function (resolve, reject) {
        _this13.es.search({
          index: _this13.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response1) {
          // with the list of users get the user information for them
          var counts = new Map();
          var buckets = response1.aggregations.users.buckets;
          buckets.map(function (c) {
            counts.set(c.key, c.doc_count);
          });
          var screenNames = Array.from(counts.keys());
          body = {
            size: 100,
            query: {
              constant_score: {
                filter: {
                  terms: {
                    'screenName': screenNames
                  }
                }
              }
            }
          };

          _this13.es.search({
            index: _this13.getIndex(TWUSER),
            type: TWUSER,
            body: body
          }).then(function (response2) {
            var users = response2.hits.hits.map(function (h) {
              return h._source;
            }); // add the tweet counts per user that we got previously

            var _iterator11 = _createForOfIteratorHelper(users),
                _step11;

            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                var user = _step11.value;
                user.tweetsInSearch = counts.get(user.screenName);
              } // sort them by their counts

            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }

            users.sort(function (a, b) {
              return b.tweetsInSearch - a.tweetsInSearch;
            });
            resolve(users);
          });
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "getHashtags",
    value: function getHashtags(search) {
      var _this14 = this;

      var body = {
        size: 0,
        query: {
          match: {
            search: search.id
          }
        },
        aggregations: {
          hashtags: {
            terms: {
              field: 'hashtags',
              size: 100
            }
          }
        }
      };
      return new Promise(function (resolve, reject) {
        _this14.es.search({
          index: _this14.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response) {
          var hashtags = response.aggregations.hashtags.buckets.map(function (ht) {
            return {
              hashtag: ht.key,
              count: ht.doc_count
            };
          });
          resolve(hashtags);
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "getUrls",
    value: function getUrls(search) {
      var _this15 = this;

      var body = {
        size: 0,
        query: {
          match: {
            search: search.id
          }
        },
        aggregations: {
          urls: {
            terms: {
              field: 'urls.long',
              size: 100
            }
          }
        }
      };
      return new Promise(function (resolve, reject) {
        _this15.es.search({
          index: _this15.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response) {
          var urls = response.aggregations.urls.buckets.map(function (u) {
            return {
              url: u.key,
              count: u.doc_count
            };
          });
          resolve(urls);
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "getImages",
    value: function getImages(search) {
      var _this16 = this;

      var body = {
        size: 0,
        query: {
          match: {
            search: search.id
          }
        },
        aggregations: {
          images: {
            terms: {
              field: 'images',
              size: 100
            }
          }
        }
      };
      return new Promise(function (resolve, reject) {
        _this16.es.search({
          index: _this16.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response) {
          var images = response.aggregations.images.buckets.map(function (u) {
            return {
              url: u.key,
              count: u.doc_count
            };
          });
          resolve(images);
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "getVideos",
    value: function getVideos(search) {
      var _this17 = this;

      var body = {
        size: 0,
        query: {
          match: {
            search: search.id
          }
        },
        aggregations: {
          videos: {
            terms: {
              field: 'videos',
              size: 100
            }
          }
        }
      };
      return new Promise(function (resolve, reject) {
        _this17.es.search({
          index: _this17.getIndex(TWEET),
          type: TWEET,
          body: body
        }).then(function (response) {
          var videos = response.aggregations.videos.buckets.map(function (u) {
            return {
              url: u.key,
              count: u.doc_count
            };
          });
          resolve(videos);
        })["catch"](function (err) {
          _logger["default"].error(err);

          reject(err);
        });
      });
    }
  }, {
    key: "addUrl",
    value: function addUrl(search, url) {
      var job = {
        url: url,
        search: search
      };
      return this.redis.lpushAsync('urlqueue', JSON.stringify(job));
    }
  }, {
    key: "processUrl",
    value: function processUrl() {
      var _this18 = this;

      return new Promise(function (resolve, reject) {
        _this18.redis.blpopAsync('urlqueue', 0).then(function (result) {
          var job = JSON.parse(result[1]);
          resolve({
            url: job.url,
            title: 'Twitter'
          });
        })["catch"](function (err) {
          reject(err);
        });
      });
    }
  }, {
    key: "getWebpages",
    value: function getWebpages(search) {
      var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
      return urlFetcher.getWebpages(search, start, limit);
    }
  }, {
    key: "queueStats",
    value: function queueStats(search) {
      return urlFetcher.queueStats(search);
    }
  }, {
    key: "selectWebpage",
    value: function selectWebpage(search, url) {
      return urlFetcher.selectWebpage(search, url);
    }
  }, {
    key: "deselectWebpage",
    value: function deselectWebpage(search, url) {
      return urlFetcher.deselectWebpage(search, url);
    }
    /* elastic search index management */

  }, {
    key: "setupIndexes",
    value: function setupIndexes() {
      var _this19 = this;

      return this.es.indices.exists({
        index: this.getIndex(TWEET)
      }).then(function (exists) {
        if (!exists) {
          _logger["default"].info('adding indexes');

          _this19.addIndexes();
        } else {
          _logger["default"].warn('indexes already present, not adding');
        }
      })["catch"](function (e) {
        _logger["default"].error(e);
      });
    }
  }, {
    key: "addIndexes",
    value: function addIndexes() {
      var indexMappings = this.getIndexMappings();
      var promises = [];

      for (var _i = 0, _Object$keys = Object.keys(indexMappings); _i < _Object$keys.length; _i++) {
        var name = _Object$keys[_i];
        promises.push(this.addIndex(name, indexMappings[name]));
      }

      return Promise.all(promises);
    }
  }, {
    key: "addIndex",
    value: function addIndex(name, map) {
      var prefixedName = this.getIndex(name);
      var body = {
        mappings: {}
      };
      body.mappings[name] = map;

      _logger["default"].info("creating index: ".concat(prefixedName));

      return this.es.indices.create({
        index: prefixedName,
        body: body
      });
    }
  }, {
    key: "updateIndexes",
    value: function updateIndexes() {
      var indexMappings = this.getIndexMappings();
      var promises = [];

      for (var _i2 = 0, _Object$keys2 = Object.keys(indexMappings); _i2 < _Object$keys2.length; _i2++) {
        var name = _Object$keys2[_i2];
        promises.push(this.updateIndex(name, indexMappings[name]));
      }

      return Promise.all(promises);
    }
  }, {
    key: "updateIndex",
    value: function updateIndex(name, map) {
      var prefixedName = this.getIndex(name);

      _logger["default"].info("updating index: ".concat(prefixedName));

      return this.es.indices.putMapping({
        index: prefixedName,
        type: name,
        body: map
      });
    }
  }, {
    key: "deleteIndexes",
    value: function deleteIndexes() {
      var _this20 = this;

      _logger["default"].info('deleting all elasticsearch indexes');

      return new Promise(function (resolve) {
        _this20.es.indices["delete"]({
          index: _this20.esPrefix + '*'
        }).then(function () {
          _logger["default"].info('deleted indexes');

          resolve();
        })["catch"](function (err) {
          _logger["default"].warn('indexes delete failed: ' + err);

          resolve();
        });
      });
    }
  }, {
    key: "getIndexMappings",
    value: function getIndexMappings() {
      return {
        settings: {
          properties: {
            type: {
              type: 'keyword'
            },
            appKey: {
              type: 'keyword'
            },
            appSecret: {
              type: 'keyword'
            }
          }
        },
        user: {
          properties: {
            type: {
              type: 'keyword'
            },
            places: {
              type: 'keyword'
            }
          }
        },
        search: {
          properties: {
            id: {
              type: 'keyword'
            },
            type: {
              type: 'keyword'
            },
            title: {
              type: 'text'
            },
            description: {
              type: 'text'
            },
            created: {
              type: 'date',
              format: 'date_time'
            },
            creator: {
              type: 'keyword'
            },
            active: {
              type: 'boolean'
            },
            saved: {
              type: 'boolean'
            },
            'query.type': {
              type: 'keyword'
            },
            'query.value': {
              type: 'keyword'
            }
          }
        },
        place: {
          properties: {
            id: {
              type: 'keyword'
            },
            type: {
              type: 'keyword'
            },
            name: {
              type: 'text'
            },
            country: {
              type: 'text'
            },
            countryCode: {
              type: 'keyword'
            },
            parentId: {
              type: 'keyword'
            }
          }
        },
        trend: {
          properties: {
            id: {
              type: 'keyword'
            },
            type: {
              type: 'keyword'
            },
            'trends.name': {
              type: 'keyword'
            },
            'trends.tweets': {
              type: 'integer'
            }
          }
        },
        twuser: {
          properties: {
            id: {
              type: 'keyword'
            },
            type: {
              type: 'keyword'
            },
            screenName: {
              type: 'keyword'
            },
            created: {
              type: 'date',
              format: 'date_time'
            },
            updated: {
              type: 'date',
              format: 'date_time'
            }
          }
        },
        tweet: {
          properties: {
            id: {
              type: 'keyword'
            },
            type: {
              type: 'keyword'
            },
            search: {
              type: 'keyword'
            },
            retweetCount: {
              type: 'integer'
            },
            likeCount: {
              type: 'integer'
            },
            created: {
              type: 'date',
              format: 'date_time'
            },
            client: {
              type: 'keyword'
            },
            hashtags: {
              type: 'keyword'
            },
            mentions: {
              type: 'keyword'
            },
            geo: {
              type: 'geo_shape'
            },
            videos: {
              type: 'keyword'
            },
            images: {
              type: 'keyword'
            },
            animatedGifs: {
              type: 'keyword'
            },
            emojis: {
              type: 'keyword'
            },
            country: {
              type: 'keyword'
            },
            countryCode: {
              type: 'keyword'
            },
            boundingBox: {
              type: 'geo_shape'
            },
            'urls.short': {
              type: 'keyword'
            },
            'urls.long': {
              type: 'keyword'
            },
            'urls.hostname': {
              type: 'keyword'
            },
            'user.screenName': {
              type: 'keyword'
            },
            'quote.user.screenName': {
              type: 'keyword'
            },
            'retweet.user.screenName': {
              type: 'keyword'
            }
          }
        }
      };
    }
  }, {
    key: "mergeIndexes",
    value: function () {
      var _mergeIndexes = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee23() {
        var results;
        return _regenerator["default"].wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                _context23.next = 2;
                return this.es.indices.forcemerge({
                  index: '_all'
                });

              case 2:
                results = _context23.sent;
                return _context23.abrupt("return", results);

              case 4:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function mergeIndexes() {
        return _mergeIndexes.apply(this, arguments);
      }

      return mergeIndexes;
    }()
  }, {
    key: "getSystemStats",
    value: function () {
      var _getSystemStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee24() {
        var result, tweetCount, twitterUserCount, userCount;
        return _regenerator["default"].wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                _context24.next = 2;
                return this.es.search({
                  index: this.getIndex(TWEET),
                  type: TWEET,
                  body: {
                    query: {
                      match_all: {}
                    }
                  }
                });

              case 2:
                result = _context24.sent;
                tweetCount = result.hits.total;
                _context24.next = 6;
                return this.es.search({
                  index: this.getIndex(TWUSER),
                  type: TWUSER,
                  body: {
                    query: {
                      match_all: {}
                    }
                  }
                });

              case 6:
                result = _context24.sent;
                twitterUserCount = result.hits.total;
                _context24.next = 10;
                return this.es.search({
                  index: this.getIndex(USER),
                  type: USER,
                  body: {
                    query: {
                      match_all: {}
                    }
                  }
                });

              case 10:
                result = _context24.sent;
                userCount = result.hits.total;
                return _context24.abrupt("return", {
                  tweetCount: tweetCount,
                  twitterUserCount: twitterUserCount,
                  userCount: userCount
                });

              case 13:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function getSystemStats() {
        return _getSystemStats.apply(this, arguments);
      }

      return getSystemStats;
    }()
  }]);
  return Database;
}();

exports.Database = Database;