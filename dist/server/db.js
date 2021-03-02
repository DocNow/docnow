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

var _objection = require("objection");

var _Setting = _interopRequireDefault(require("./models/Setting"));

var _Place = _interopRequireDefault(require("./models/Place"));

var _User = _interopRequireDefault(require("./models/User"));

var _Trend = _interopRequireDefault(require("./models/Trend"));

var _Search = _interopRequireDefault(require("./models/Search"));

var _Tweet = _interopRequireDefault(require("./models/Tweet"));

var _TweetHashtag = _interopRequireDefault(require("./models/TweetHashtag"));

var _TweetUrl = _interopRequireDefault(require("./models/TweetUrl"));

var _logger = _interopRequireDefault(require("./logger"));

var _twitter = require("./twitter");

var _urlFetcher = require("./url-fetcher");

var _knexfile = _interopRequireDefault(require("../../knexfile"));

var _redis = require("./redis");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var urlFetcher = new _urlFetcher.UrlFetcher();

var Database = /*#__PURE__*/function () {
  function Database() {
    (0, _classCallCheck2["default"])(this, Database);
    this.redis = (0, _redis.getRedis)();
    this.pg = (0, _knex["default"])(_knexfile["default"]);

    _objection.Model.knex(this.pg);
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
                return this.pg.migrate.currentVersion();

              case 4:
                _context.t0 = _context.sent;

                if (!(_context.t0 != "none")) {
                  _context.next = 8;
                  break;
                }

                _context.next = 8;
                return this.pg.migrate.rollback(null, true);

              case 8:
                _context.next = 10;
                return this.pg.migrate.latest();

              case 10:
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
                _context5.prev = 8;
                _context5.next = 11;
                return _User["default"].query().insert(user);

              case 11:
                newUser = _context5.sent;

                if (!newUser.isSuperUser) {
                  _context5.next = 15;
                  break;
                }

                _context5.next = 15;
                return this.loadPlaces();

              case 15:
                return _context5.abrupt("return", newUser);

              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](8);
                console.error(_context5.t0);

              case 21:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[8, 18]]);
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
        var pos, u;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                // the order of places is defined by their position
                // they will be defined based on their order
                if (user.places) {
                  for (pos = 0; pos < user.places.length; pos += 1) {
                    user.places[pos].position = pos;
                  }
                }

                delete user.searches;
                _context6.next = 4;
                return _User["default"].query().allowGraph('places').upsertGraph(user, {
                  relate: true,
                  unrelate: true
                });

              case 4:
                u = _context6.sent;
                return _context6.abrupt("return", u);

              case 6:
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
        var users;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return _User["default"].query().withGraphJoined('places').where('user.id', Number(userId));

              case 2:
                users = _context7.sent;
                return _context7.abrupt("return", users.length > 0 ? users[0] : null);

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
        var users, _iterator2, _step2, user, searchesWithStats, _iterator3, _step3, search, stats;

        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _User["default"].query().withGraphJoined('places').withGraphJoined('searches');

              case 2:
                users = _context8.sent;
                // this is a stop gap until redis goes away
                // we need to add aggregate stats to each search
                // maybe there should be a view for these?
                _iterator2 = _createForOfIteratorHelper(users);
                _context8.prev = 4;

                _iterator2.s();

              case 6:
                if ((_step2 = _iterator2.n()).done) {
                  _context8.next = 31;
                  break;
                }

                user = _step2.value;
                searchesWithStats = [];
                _iterator3 = _createForOfIteratorHelper(user.searches);
                _context8.prev = 10;

                _iterator3.s();

              case 12:
                if ((_step3 = _iterator3.n()).done) {
                  _context8.next = 20;
                  break;
                }

                search = _step3.value;
                _context8.next = 16;
                return this.getSearchStats(search);

              case 16:
                stats = _context8.sent;
                searchesWithStats.push(_objectSpread(_objectSpread({}, search), stats));

              case 18:
                _context8.next = 12;
                break;

              case 20:
                _context8.next = 25;
                break;

              case 22:
                _context8.prev = 22;
                _context8.t0 = _context8["catch"](10);

                _iterator3.e(_context8.t0);

              case 25:
                _context8.prev = 25;

                _iterator3.f();

                return _context8.finish(25);

              case 28:
                user.searches = searchesWithStats;

              case 29:
                _context8.next = 6;
                break;

              case 31:
                _context8.next = 36;
                break;

              case 33:
                _context8.prev = 33;
                _context8.t1 = _context8["catch"](4);

                _iterator2.e(_context8.t1);

              case 36:
                _context8.prev = 36;

                _iterator2.f();

                return _context8.finish(36);

              case 39:
                return _context8.abrupt("return", users);

              case 40:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[4, 33, 36, 39], [10, 22, 25, 28]]);
      }));

      function getUsers() {
        return _getUsers.apply(this, arguments);
      }

      return getUsers;
    }()
  }, {
    key: "getSuperUser",
    value: function getSuperUser() {
      return _User["default"].query().where('isSuperUser', '=', true).first();
    }
  }, {
    key: "getUserByTwitterUserId",
    value: function getUserByTwitterUserId(userId) {
      return _User["default"].query().where('twitter_user_id', '=', userId).first();
    }
  }, {
    key: "getUserByTwitterScreenName",
    value: function getUserByTwitterScreenName(twitterScreenName) {
      return this.query().where('twitterScreeName', '=', twitterScreenName).first();
    }
  }, {
    key: "importLatestTrends",
    value: function () {
      var _importLatestTrends = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
        var trends, seenPlaces, _iterator4, _step4, user, _iterator5, _step5, place;

        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                trends = [];
                seenPlaces = new Set();
                _context9.t0 = _createForOfIteratorHelper;
                _context9.next = 5;
                return this.getUsers();

              case 5:
                _context9.t1 = _context9.sent;
                _iterator4 = (0, _context9.t0)(_context9.t1);
                _context9.prev = 7;

                _iterator4.s();

              case 9:
                if ((_step4 = _iterator4.n()).done) {
                  _context9.next = 36;
                  break;
                }

                user = _step4.value;

                if (!user.places) {
                  _context9.next = 34;
                  break;
                }

                _iterator5 = _createForOfIteratorHelper(user.places);
                _context9.prev = 13;

                _iterator5.s();

              case 15:
                if ((_step5 = _iterator5.n()).done) {
                  _context9.next = 26;
                  break;
                }

                place = _step5.value;

                if (seenPlaces.has(place.id)) {
                  _context9.next = 24;
                  break;
                }

                _context9.t2 = trends;
                _context9.next = 21;
                return this.importLatestTrendsForPlace(place, user);

              case 21:
                _context9.t3 = _context9.sent;
                trends = _context9.t2.concat.call(_context9.t2, _context9.t3);
                seenPlaces.add(place.id);

              case 24:
                _context9.next = 15;
                break;

              case 26:
                _context9.next = 31;
                break;

              case 28:
                _context9.prev = 28;
                _context9.t4 = _context9["catch"](13);

                _iterator5.e(_context9.t4);

              case 31:
                _context9.prev = 31;

                _iterator5.f();

                return _context9.finish(31);

              case 34:
                _context9.next = 9;
                break;

              case 36:
                _context9.next = 41;
                break;

              case 38:
                _context9.prev = 38;
                _context9.t5 = _context9["catch"](7);

                _iterator4.e(_context9.t5);

              case 41:
                _context9.prev = 41;

                _iterator4.f();

                return _context9.finish(41);

              case 44:
                return _context9.abrupt("return", trends);

              case 45:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[7, 38, 41, 44], [13, 28, 31, 34]]);
      }));

      function importLatestTrends() {
        return _importLatestTrends.apply(this, arguments);
      }

      return importLatestTrends;
    }()
  }, {
    key: "importLatestTrendsForPlace",
    value: function () {
      var _importLatestTrendsForPlace = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(place, user) {
        var twitter, allTrends, created, trends, _iterator6, _step6, trend, newTrends;

        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.getTwitterClientForUser(user);

              case 2:
                twitter = _context10.sent;
                allTrends = [];
                created = new Date();
                _context10.next = 7;
                return twitter.getTrendsAtPlace(place.id);

              case 7:
                trends = _context10.sent;
                _iterator6 = _createForOfIteratorHelper(trends);

                try {
                  for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                    trend = _step6.value;

                    if (trend.count !== null) {
                      allTrends.push({
                        name: trend.name,
                        count: trend.count,
                        placeId: place.id,
                        created: created
                      });
                    }
                  }
                } catch (err) {
                  _iterator6.e(err);
                } finally {
                  _iterator6.f();
                }

                _context10.next = 12;
                return _Trend["default"].query().insert(allTrends);

              case 12:
                newTrends = _context10.sent;
                return _context10.abrupt("return", newTrends);

              case 14:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function importLatestTrendsForPlace(_x6, _x7) {
        return _importLatestTrendsForPlace.apply(this, arguments);
      }

      return importLatestTrendsForPlace;
    }()
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
    key: "getRecentTrendsForPlace",
    value: function () {
      var _getRecentTrendsForPlace = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(place) {
        var result, lastImport, trends;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return _Trend["default"].query().max('created').where('placeId', place.id);

              case 2:
                result = _context11.sent;

                if (result) {
                  _context11.next = 5;
                  break;
                }

                return _context11.abrupt("return", []);

              case 5:
                lastImport = result[0].max;
                trends = _Trend["default"].query().select().where({
                  'placeId': place.id,
                  'created': lastImport
                }).orderBy('count', 'desc');
                return _context11.abrupt("return", trends);

              case 8:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11);
      }));

      function getRecentTrendsForPlace(_x8) {
        return _getRecentTrendsForPlace.apply(this, arguments);
      }

      return getRecentTrendsForPlace;
    }()
  }, {
    key: "getUserTrends",
    value: function () {
      var _getUserTrends = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(user) {
        var results, _iterator7, _step7, place;

        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                // return a list of places with their most recent trends
                results = [];

                if (!(user && user.places)) {
                  _context12.next = 21;
                  break;
                }

                _iterator7 = _createForOfIteratorHelper(user.places);
                _context12.prev = 3;

                _iterator7.s();

              case 5:
                if ((_step7 = _iterator7.n()).done) {
                  _context12.next = 13;
                  break;
                }

                place = _step7.value;
                _context12.next = 9;
                return this.getRecentTrendsForPlace(place);

              case 9:
                place.trends = _context12.sent;
                results.push(place);

              case 11:
                _context12.next = 5;
                break;

              case 13:
                _context12.next = 18;
                break;

              case 15:
                _context12.prev = 15;
                _context12.t0 = _context12["catch"](3);

                _iterator7.e(_context12.t0);

              case 18:
                _context12.prev = 18;

                _iterator7.f();

                return _context12.finish(18);

              case 21:
                return _context12.abrupt("return", results);

              case 22:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[3, 15, 18, 21]]);
      }));

      function getUserTrends(_x9) {
        return _getUserTrends.apply(this, arguments);
      }

      return getUserTrends;
    }()
  }, {
    key: "loadPlaces",
    value: function () {
      var _loadPlaces = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13() {
        var user, twitter, places;
        return _regenerator["default"].wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return _Place["default"].query()["delete"]();

              case 2:
                _context13.next = 4;
                return this.getSuperUser();

              case 4:
                user = _context13.sent;
                _context13.next = 7;
                return this.getTwitterClientForUser(user);

              case 7:
                twitter = _context13.sent;
                _context13.next = 10;
                return twitter.getPlaces();

              case 10:
                places = _context13.sent;
                _context13.next = 13;
                return _Place["default"].query().insert(places);

              case 13:
                return _context13.abrupt("return", places);

              case 14:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
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
      var _this4 = this;

      return new Promise(function (resolve) {
        _this4.getSettings().then(function (settings) {
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
    value: function () {
      var _createSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(search) {
        var s1, s2;
        return _regenerator["default"].wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                search.updated = new Date();
                _context14.next = 3;
                return _Search["default"].query().upsertGraphAndFetch(search, {
                  relate: true,
                  unrelate: true,
                  insertMissing: true
                });

              case 3:
                s1 = _context14.sent;
                _context14.next = 6;
                return _Search["default"].query().select().where('search.id', s1.id).withGraphJoined('creator').withGraphJoined('queries').first();

              case 6:
                s2 = _context14.sent;
                return _context14.abrupt("return", s2);

              case 8:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      }));

      function createSearch(_x10) {
        return _createSearch.apply(this, arguments);
      }

      return createSearch;
    }()
  }, {
    key: "getSearch",
    value: function () {
      var _getSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(searchId) {
        var search, stats;
        return _regenerator["default"].wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return _Search["default"].query().findById(searchId).withGraphJoined('creator').withGraphJoined('queries');

              case 2:
                search = _context15.sent;

                if (search) {
                  _context15.next = 5;
                  break;
                }

                return _context15.abrupt("return", null);

              case 5:
                _context15.next = 7;
                return this.getSearchStats(search);

              case 7:
                stats = _context15.sent;
                return _context15.abrupt("return", _objectSpread(_objectSpread({}, search), stats));

              case 9:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function getSearch(_x11) {
        return _getSearch.apply(this, arguments);
      }

      return getSearch;
    }()
  }, {
    key: "deleteSearch",
    value: function deleteSearch(search) {
      _logger["default"].info('deleting search', {
        id: search.id
      });

      return _Search["default"].query().del().where('id', search.id);
    }
  }, {
    key: "getUserSearches",
    value: function () {
      var _getUserSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(user) {
        var results, searches, _iterator8, _step8, search, stats;

        return _regenerator["default"].wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return _Search["default"].query().where({
                  userId: user.id,
                  saved: true
                }).withGraphJoined('creator').withGraphJoined('queries').orderBy('created', 'DESC');

              case 2:
                results = _context16.sent;
                // add stats to each search
                searches = [];
                _iterator8 = _createForOfIteratorHelper(results);
                _context16.prev = 5;

                _iterator8.s();

              case 7:
                if ((_step8 = _iterator8.n()).done) {
                  _context16.next = 15;
                  break;
                }

                search = _step8.value;
                _context16.next = 11;
                return this.getSearchStats(search);

              case 11:
                stats = _context16.sent;
                searches.push(_objectSpread(_objectSpread({}, search), stats));

              case 13:
                _context16.next = 7;
                break;

              case 15:
                _context16.next = 20;
                break;

              case 17:
                _context16.prev = 17;
                _context16.t0 = _context16["catch"](5);

                _iterator8.e(_context16.t0);

              case 20:
                _context16.prev = 20;

                _iterator8.f();

                return _context16.finish(20);

              case 23:
                return _context16.abrupt("return", searches);

              case 24:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[5, 17, 20, 23]]);
      }));

      function getUserSearches(_x12) {
        return _getUserSearches.apply(this, arguments);
      }

      return getUserSearches;
    }()
  }, {
    key: "getPublicSearches",
    value: function () {
      var _getPublicSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17() {
        var results, searches, _iterator9, _step9, search, stats;

        return _regenerator["default"].wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return _Search["default"].query().whereNotNull("public").withGraphJoined('creator').withGraphJoined('queries').orderBy('created', 'DESC');

              case 2:
                results = _context17.sent;
                // remove all info except for the creator's name and id
                results.map(function (s) {
                  s.creator = {
                    id: s.creator.id,
                    name: s.creator.name,
                    twitterScreenName: s.creator.twitterScreenName
                  };
                }); // add stats to each search

                searches = [];
                _iterator9 = _createForOfIteratorHelper(results);
                _context17.prev = 6;

                _iterator9.s();

              case 8:
                if ((_step9 = _iterator9.n()).done) {
                  _context17.next = 16;
                  break;
                }

                search = _step9.value;
                _context17.next = 12;
                return this.getSearchStats(search);

              case 12:
                stats = _context17.sent;
                searches.push(_objectSpread(_objectSpread({}, search), stats));

              case 14:
                _context17.next = 8;
                break;

              case 16:
                _context17.next = 21;
                break;

              case 18:
                _context17.prev = 18;
                _context17.t0 = _context17["catch"](6);

                _iterator9.e(_context17.t0);

              case 21:
                _context17.prev = 21;

                _iterator9.f();

                return _context17.finish(21);

              case 24:
                return _context17.abrupt("return", searches);

              case 25:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[6, 18, 21, 24]]);
      }));

      function getPublicSearches() {
        return _getPublicSearches.apply(this, arguments);
      }

      return getPublicSearches;
    }()
  }, {
    key: "userOverQuota",
    value: function () {
      var _userOverQuota = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(user) {
        var total;
        return _regenerator["default"].wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                // const searches = await this.getUserSearches(user)
                total = _Tweet["default"].query().count().where({
                  userId: user.id
                }).first();
                return _context18.abrupt("return", total > user.tweetQuota);

              case 2:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18);
      }));

      function userOverQuota(_x13) {
        return _userOverQuota.apply(this, arguments);
      }

      return userOverQuota;
    }()
  }, {
    key: "updateSearch",
    value: function updateSearch(search) {
      // search properties are explicitly used to guard against trying
      // to persist properties that were added by getSearchSummary
      var safeSearch = this.removeStatsProps(search);
      return _Search["default"].query().patch(_objectSpread(_objectSpread({}, safeSearch), {}, {
        updated: new Date()
      })).where('id', safeSearch.id);
    }
  }, {
    key: "getSearchSummary",
    value: function () {
      var _getSearchSummary = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(search) {
        var results, stats;
        return _regenerator["default"].wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.next = 2;
                return _Tweet["default"].query().min('created').max('created').count('id').where('searchId', search.id);

              case 2:
                results = _context19.sent;
                this.convertCounts(results);
                _context19.next = 6;
                return this.getSearchStats(search);

              case 6:
                stats = _context19.sent;
                return _context19.abrupt("return", _objectSpread(_objectSpread(_objectSpread({}, search), stats), {}, {
                  count: results[0].count,
                  minDate: results[0].min,
                  maxDate: results[0].max
                }));

              case 8:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function getSearchSummary(_x14) {
        return _getSearchSummary.apply(this, arguments);
      }

      return getSearchSummary;
    }()
  }, {
    key: "removeStatsProps",
    value: function removeStatsProps(o) {
      var newO = Object.assign({}, o);
      var props = ['count', 'minDate', 'maxDate', 'tweetCount', 'userCount', 'videoCount', 'imageCount', 'urlCount'];
      props.map(function (p) {
        return delete newO[p];
      });
      return newO;
    }
  }, {
    key: "getSearchStats",
    value: function () {
      var _getSearchStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(search) {
        var results, rows, urlCounts;
        return _regenerator["default"].wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return _Tweet["default"].query().countDistinct('screenName', {
                  as: 'users'
                }).count('tweetId', {
                  as: 'tweets'
                }).where({
                  searchId: search.id
                }).first();

              case 2:
                results = _context20.sent;
                _context20.next = 5;
                return _Tweet["default"].query().join('tweetUrl', 'id', 'tweetUrl.tweetId').select('type').countDistinct('url').where({
                  searchId: search.id
                }).groupBy('type');

              case 5:
                rows = _context20.sent;
                urlCounts = new Map(rows.map(function (r) {
                  return [r.type, r.count];
                }));
                return _context20.abrupt("return", {
                  tweetCount: parseInt(results.tweets, 10),
                  userCount: parseInt(results.users, 10),
                  imageCount: parseInt(urlCounts.get('image'), 10),
                  videoCount: parseInt(urlCounts.get('video'), 10),
                  urlCount: parseInt(urlCounts.get('page'), 10)
                });

              case 8:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20);
      }));

      function getSearchStats(_x15) {
        return _getSearchStats.apply(this, arguments);
      }

      return getSearchStats;
    }()
  }, {
    key: "importFromSearch",
    value: function () {
      var _importFromSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee22(search) {
        var _this5 = this;

        var maxTweets,
            user,
            twtr,
            lastQuery,
            q,
            maxTweetId,
            count,
            _args22 = arguments;
        return _regenerator["default"].wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                maxTweets = _args22.length > 1 && _args22[1] !== undefined ? _args22[1] : 1000;
                _context22.next = 3;
                return this.getUser(search.creator.id);

              case 3:
                user = _context22.sent;
                _context22.next = 6;
                return this.getTwitterClientForUser(user);

              case 6:
                twtr = _context22.sent;
                _context22.next = 9;
                return this.updateSearch({
                  id: search.id,
                  active: true
                });

              case 9:
                // determine the query to run
                lastQuery = search.queries[search.queries.length - 1];
                q = lastQuery.searchQuery(); // run the search!

                maxTweetId = null;
                count = 0;
                return _context22.abrupt("return", new Promise(function (resolve, reject) {
                  twtr.search({
                    q: q,
                    sinceId: search.maxTweetId,
                    count: maxTweets
                  }, /*#__PURE__*/function () {
                    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee21(err, results) {
                      return _regenerator["default"].wrap(function _callee21$(_context21) {
                        while (1) {
                          switch (_context21.prev = _context21.next) {
                            case 0:
                              if (!err) {
                                _context21.next = 4;
                                break;
                              }

                              reject(err);
                              _context21.next = 15;
                              break;

                            case 4:
                              if (!(results.length === 0)) {
                                _context21.next = 10;
                                break;
                              }

                              _context21.next = 7;
                              return _this5.updateSearch({
                                id: search.id,
                                maxTweetId: maxTweetId,
                                active: false
                              });

                            case 7:
                              resolve(count);
                              _context21.next = 15;
                              break;

                            case 10:
                              if (maxTweetId === null) {
                                maxTweetId = results[0].id;
                              }

                              _context21.next = 13;
                              return _this5.loadTweets(search, results);

                            case 13:
                              count += results.length;

                              _logger["default"].info("bulk loaded ".concat(results.length, " tweets"));

                            case 15:
                            case "end":
                              return _context21.stop();
                          }
                        }
                      }, _callee21);
                    }));

                    return function (_x17, _x18) {
                      return _ref2.apply(this, arguments);
                    };
                  }());
                }));

              case 14:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function importFromSearch(_x16) {
        return _importFromSearch.apply(this, arguments);
      }

      return importFromSearch;
    }()
  }, {
    key: "loadTweets",
    value: function () {
      var _loadTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee24(search, tweets) {
        var tweetRows, _iterator10, _step10, tweet, _iterator16, _step16, url;

        return _regenerator["default"].wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                tweetRows = [];
                _iterator10 = _createForOfIteratorHelper(tweets);

                try {
                  for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                    tweet = _step10.value;
                    _iterator16 = _createForOfIteratorHelper(tweet.urls);

                    try {
                      for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
                        url = _step16.value;
                        urlFetcher.add(search, url["long"], tweet.id);
                      }
                    } catch (err) {
                      _iterator16.e(err);
                    } finally {
                      _iterator16.f();
                    }

                    tweetRows.push({
                      searchId: search.id,
                      tweetId: tweet.id,
                      created: tweet.created,
                      screenName: tweet.user.screenName,
                      text: tweet.text,
                      retweetId: tweet.retweetId,
                      quoteId: tweet.quoteId,
                      retweetCount: tweet.retweetCount,
                      replyCount: tweet.replyCount,
                      quoteCount: tweet.quoteCount,
                      likeCount: tweet.likeCount,
                      replyToTweetId: tweet.replyToTweetId,
                      replyToUserId: tweet.replyToUserId,
                      imageCount: tweet.imageCount,
                      videoCount: tweet.videoCount,
                      language: tweet.language,
                      json: tweet
                    });
                  }
                } catch (err) {
                  _iterator10.e(err);
                } finally {
                  _iterator10.f();
                }

                _context24.prev = 3;
                _context24.next = 6;
                return _Tweet["default"].transaction( /*#__PURE__*/function () {
                  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee23(trx) {
                    var results, hashtagRows, urlRows, _iterator11, _step11, row, hashtags, _iterator12, _step12, name, urls, _iterator13, _step13, url, _iterator14, _step14, _url, _iterator15, _step15, _url2;

                    return _regenerator["default"].wrap(function _callee23$(_context23) {
                      while (1) {
                        switch (_context23.prev = _context23.next) {
                          case 0:
                            _context23.next = 2;
                            return _Tweet["default"].query(trx).insert(tweetRows).returning(['id', 'tweetId']);

                          case 2:
                            results = _context23.sent;
                            // now we have the tweet id we can attach relevant 
                            // hashtags and urls
                            hashtagRows = [];
                            urlRows = [];
                            _iterator11 = _createForOfIteratorHelper(results);

                            try {
                              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                                row = _step11.value;
                                // make sure the hashtags are unique!
                                hashtags = new Set(row.json.hashtags);
                                _iterator12 = _createForOfIteratorHelper(hashtags);

                                try {
                                  for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                                    name = _step12.value;
                                    hashtagRows.push({
                                      name: name,
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator12.e(err);
                                } finally {
                                  _iterator12.f();
                                }

                                urls = new Set(row.json.urls.map(function (r) {
                                  return r["long"];
                                }));
                                _iterator13 = _createForOfIteratorHelper(urls);

                                try {
                                  for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                                    url = _step13.value;
                                    urlRows.push({
                                      url: url,
                                      type: 'page',
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator13.e(err);
                                } finally {
                                  _iterator13.f();
                                }

                                _iterator14 = _createForOfIteratorHelper(new Set(row.json.images));

                                try {
                                  for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                                    _url = _step14.value;
                                    urlRows.push({
                                      url: _url,
                                      type: 'image',
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator14.e(err);
                                } finally {
                                  _iterator14.f();
                                }

                                _iterator15 = _createForOfIteratorHelper(new Set(row.json.videos));

                                try {
                                  for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                                    _url2 = _step15.value;
                                    urlRows.push({
                                      url: _url2,
                                      type: 'video',
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator15.e(err);
                                } finally {
                                  _iterator15.f();
                                }
                              }
                            } catch (err) {
                              _iterator11.e(err);
                            } finally {
                              _iterator11.f();
                            }

                            _context23.next = 9;
                            return _TweetHashtag["default"].query(trx).insert(hashtagRows);

                          case 9:
                            _context23.next = 11;
                            return _TweetUrl["default"].query(trx).insert(urlRows);

                          case 11:
                            return _context23.abrupt("return", results.length);

                          case 12:
                          case "end":
                            return _context23.stop();
                        }
                      }
                    }, _callee23);
                  }));

                  return function (_x21) {
                    return _ref3.apply(this, arguments);
                  };
                }());

              case 6:
                _context24.next = 11;
                break;

              case 8:
                _context24.prev = 8;
                _context24.t0 = _context24["catch"](3);
                console.log("loadTweets transaction failed: ".concat(_context24.t0));

              case 11:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, null, [[3, 8]]);
      }));

      function loadTweets(_x19, _x20) {
        return _loadTweets.apply(this, arguments);
      }

      return loadTweets;
    }()
  }, {
    key: "getTweets",
    value: function getTweets(search) {
      var includeRetweets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
      var where = {
        searchId: search.id
      };

      if (!includeRetweets) {
        where.retweetId = null;
      }

      return this.pickJson(_Tweet["default"].query().select().where(where).offset(offset).limit(limit));
    }
  }, {
    key: "getAllTweets",
    value: function () {
      var _getAllTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee25(search) {
        return _regenerator["default"].wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                return _context25.abrupt("return", this.pickJson(_Tweet["default"].query().where('searchId', search.id)));

              case 1:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function getAllTweets(_x22) {
        return _getAllTweets.apply(this, arguments);
      }

      return getAllTweets;
    }()
  }, {
    key: "getTweetsForUrl",
    value: function () {
      var _getTweetsForUrl = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee26(search, url) {
        var type,
            _args26 = arguments;
        return _regenerator["default"].wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                type = _args26.length > 2 && _args26[2] !== undefined ? _args26[2] : 'page';
                return _context26.abrupt("return", this.pickJson(_Tweet["default"].query().where({
                  searchId: search.id,
                  url: url,
                  type: type
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('json').limit(100)));

              case 2:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function getTweetsForUrl(_x23, _x24) {
        return _getTweetsForUrl.apply(this, arguments);
      }

      return getTweetsForUrl;
    }()
  }, {
    key: "getTweetsForImage",
    value: function getTweetsForImage(search, url) {
      return this.getTweetsForUrl(search, url, 'image');
    }
  }, {
    key: "getTweetsForVideo",
    value: function getTweetsForVideo(search, url) {
      return this.getTweetsForUrl(search, url, 'video');
    }
  }, {
    key: "getTweetsForUser",
    value: function () {
      var _getTweetsForUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee27(search, handle) {
        return _regenerator["default"].wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                return _context27.abrupt("return", this.pickJson(_Tweet["default"].query().where({
                  searchId: search.id,
                  screenName: handle
                }).orderBy('id', 'DESC').limit(100)));

              case 1:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function getTweetsForUser(_x25, _x26) {
        return _getTweetsForUser.apply(this, arguments);
      }

      return getTweetsForUser;
    }()
  }, {
    key: "getTweetsByIds",
    value: function () {
      var _getTweetsByIds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee28(search, ids) {
        return _regenerator["default"].wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                return _context28.abrupt("return", this.pickJson(_Tweet["default"].query().where('search', search.id).whereIn('tweetId', ids).orderBy('id', 'DESC').limit(100)));

              case 1:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function getTweetsByIds(_x27, _x28) {
        return _getTweetsByIds.apply(this, arguments);
      }

      return getTweetsByIds;
    }()
  }, {
    key: "getTwitterUsers",
    value: function () {
      var _getTwitterUsers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee29(search) {
        var userCounts, users, seen, results, _iterator17, _step17, u;

        return _regenerator["default"].wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                _context29.next = 2;
                return _Tweet["default"].query().select('screenName').count('* as total').where('searchId', search.id).groupBy('screenName').orderBy('total', 'DESC').limit(100);

              case 2:
                userCounts = _context29.sent;
                this.convertCounts(userCounts, 'total'); // turn database results into a map of screename -> total

                userCounts = new Map(userCounts.map(function (r) {
                  return [r.screenName, r.total];
                })); // it might be more efficient to model users on import? 
                // but perhaps its better to pull them out adhoc until
                // we actually have a conversaton with them?

                _context29.next = 7;
                return _Tweet["default"].query().select('json', 'screenName').where('searchId', search.id).whereIn('screenName', Array.from(userCounts.keys()));

              case 7:
                users = _context29.sent;
                // seen is needed because we could get multiple tweets from the same user
                // and would end up with more than one results for a user 
                seen = new Set();
                results = [];
                _iterator17 = _createForOfIteratorHelper(users);

                try {
                  for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                    u = _step17.value;

                    if (!seen.has(u.screenName)) {
                      results.push(_objectSpread(_objectSpread({}, u.json.user), {}, {
                        tweetsInSearch: userCounts.get(u.screenName)
                      }));
                      seen.add(u.screenName);
                    }
                  } // sort them again

                } catch (err) {
                  _iterator17.e(err);
                } finally {
                  _iterator17.f();
                }

                results.sort(function (a, b) {
                  return b.tweetsInSearch - a.tweetsInSearch;
                });
                return _context29.abrupt("return", results);

              case 14:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function getTwitterUsers(_x29) {
        return _getTwitterUsers.apply(this, arguments);
      }

      return getTwitterUsers;
    }()
  }, {
    key: "getHashtags",
    value: function () {
      var _getHashtags = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee30(search) {
        var results;
        return _regenerator["default"].wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                _context30.next = 2;
                return _Tweet["default"].query().where('searchId', search.id).join('tweetHashtag', 'tweet.id', 'tweetHashtag.tweetId').select('name as hashtag').count('name').groupBy('hashtag').orderBy('count', 'DESC');

              case 2:
                results = _context30.sent;
                return _context30.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function getHashtags(_x30) {
        return _getHashtags.apply(this, arguments);
      }

      return getHashtags;
    }()
  }, {
    key: "getUrls",
    value: function () {
      var _getUrls = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee31(search) {
        var results;
        return _regenerator["default"].wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                _context31.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'page'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url').count('url').groupBy('url').orderBy('count', 'DESC');

              case 2:
                results = _context31.sent;
                return _context31.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function getUrls(_x31) {
        return _getUrls.apply(this, arguments);
      }

      return getUrls;
    }()
  }, {
    key: "getImages",
    value: function () {
      var _getImages = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee32(search) {
        var results;
        return _regenerator["default"].wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                _context32.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'image'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url').count('url').groupBy('url').orderBy('count', 'DESC');

              case 2:
                results = _context32.sent;
                return _context32.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function getImages(_x32) {
        return _getImages.apply(this, arguments);
      }

      return getImages;
    }()
  }, {
    key: "getVideos",
    value: function () {
      var _getVideos = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee33(search) {
        var results;
        return _regenerator["default"].wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                _context33.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'video'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url').count('url').groupBy('url').orderBy('count', 'DESC');

              case 2:
                results = _context33.sent;
                return _context33.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function getVideos(_x33) {
        return _getVideos.apply(this, arguments);
      }

      return getVideos;
    }()
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
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.redis.blpopAsync('urlqueue', 0).then(function (result) {
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
  }, {
    key: "getSystemStats",
    value: function () {
      var _getSystemStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee34() {
        var tweets, users;
        return _regenerator["default"].wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                _context34.next = 2;
                return _Tweet["default"].query().count().first();

              case 2:
                tweets = _context34.sent;
                _context34.next = 5;
                return _User["default"].query().count().first();

              case 5:
                users = _context34.sent;
                return _context34.abrupt("return", {
                  tweetCount: Number.parseInt(tweets.count, 10),
                  userCount: Number.parseInt(users.count, 10)
                });

              case 7:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34);
      }));

      function getSystemStats() {
        return _getSystemStats.apply(this, arguments);
      }

      return getSystemStats;
    }()
  }, {
    key: "pickJson",
    value: function () {
      var _pickJson = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee35(query) {
        var results;
        return _regenerator["default"].wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                _context35.next = 2;
                return query;

              case 2:
                results = _context35.sent;
                return _context35.abrupt("return", results.map(function (o) {
                  return o.json;
                }));

              case 4:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35);
      }));

      function pickJson(_x34) {
        return _pickJson.apply(this, arguments);
      }

      return pickJson;
    }()
  }, {
    key: "convertCounts",
    value: function () {
      var _convertCounts = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee36(l) {
        var prop,
            _iterator18,
            _step18,
            o,
            _args36 = arguments;

        return _regenerator["default"].wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                prop = _args36.length > 1 && _args36[1] !== undefined ? _args36[1] : 'count';
                _iterator18 = _createForOfIteratorHelper(l);

                try {
                  for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
                    o = _step18.value;
                    o[prop] = Number.parseInt(o[prop], 10);
                  }
                } catch (err) {
                  _iterator18.e(err);
                } finally {
                  _iterator18.f();
                }

                return _context36.abrupt("return", l);

              case 4:
              case "end":
                return _context36.stop();
            }
          }
        }, _callee36);
      }));

      function convertCounts(_x35) {
        return _convertCounts.apply(this, arguments);
      }

      return convertCounts;
    }()
  }]);
  return Database;
}();

exports.Database = Database;