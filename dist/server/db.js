"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Database = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

require("../env");

var _knex = _interopRequireDefault(require("knex"));

var _moment = _interopRequireDefault(require("moment"));

var _objection = require("objection");

var _Setting = _interopRequireDefault(require("./models/Setting"));

var _Place = _interopRequireDefault(require("./models/Place"));

var _User = _interopRequireDefault(require("./models/User"));

var _Trend = _interopRequireDefault(require("./models/Trend"));

var _Search = _interopRequireDefault(require("./models/Search"));

var _Tweet = _interopRequireDefault(require("./models/Tweet"));

var _TweetHashtag = _interopRequireDefault(require("./models/TweetHashtag"));

var _TweetUrl = _interopRequireDefault(require("./models/TweetUrl"));

var _Action = _interopRequireDefault(require("./models/Action"));

var _logger = _interopRequireDefault(require("./logger"));

var _twitter = require("./twitter");

var _urlFetcher = require("./url-fetcher");

var _knexfile = _interopRequireDefault(require("../../knexfile"));

var _Query = _interopRequireDefault(require("./models/Query"));

var _SearchJob = _interopRequireDefault(require("./models/SearchJob"));

var _redis = require("./redis");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

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

                settings.academic = settings.academic == "true" ? true : false;

                if (!settings.instanceTweetText) {
                  settings.instanceTweetText = "I'm creating a collection of tweets that match {query}. You can learn more about why I'm creating it and specify your terms of your consent here {collection-url}";
                }

                return _context4.abrupt("return", settings);

              case 9:
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
                user.tweetQuota = user.tweetQuota || settings.defaultQuota; // first user is the super user (and an admin)

                _context5.next = 6;
                return this.getSuperUser();

              case 6:
                su = _context5.sent;
                user.isSuperUser = su ? false : true;
                user.admin = user.isSuperUser;
                _context5.prev = 9;
                _context5.next = 12;
                return _User["default"].query().insert(user);

              case 12:
                newUser = _context5.sent;

                if (!newUser.isSuperUser) {
                  _context5.next = 16;
                  break;
                }

                _context5.next = 16;
                return this.loadPlaces();

              case 16:
                return _context5.abrupt("return", newUser);

              case 19:
                _context5.prev = 19;
                _context5.t0 = _context5["catch"](9);

                _logger["default"].error(_context5.t0);

              case 22:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[9, 19]]);
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
                } // don't update searches as they could be stale


                delete user.searches; // don't set tweetCount since it's not a column in user and is
                // added by the API

                delete user.tweetCount;
                _context6.next = 5;
                return _User["default"].query().allowGraph('places').upsertGraph(user, {
                  relate: true,
                  unrelate: true
                });

              case 5:
                u = _context6.sent;
                return _context6.abrupt("return", u);

              case 7:
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
        var users, _iterator2, _step2, user;

        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _User["default"].query().withGraphJoined('places').withGraphJoined('searches').orderBy('user.twitterScreenName');

              case 2:
                users = _context8.sent;
                _iterator2 = _createForOfIteratorHelper(users);
                _context8.prev = 4;

                _iterator2.s();

              case 6:
                if ((_step2 = _iterator2.n()).done) {
                  _context8.next = 13;
                  break;
                }

                user = _step2.value;
                _context8.next = 10;
                return this.getUserTweetCount(user);

              case 10:
                user.tweetCount = _context8.sent;

              case 11:
                _context8.next = 6;
                break;

              case 13:
                _context8.next = 18;
                break;

              case 15:
                _context8.prev = 15;
                _context8.t0 = _context8["catch"](4);

                _iterator2.e(_context8.t0);

              case 18:
                _context8.prev = 18;

                _iterator2.f();

                return _context8.finish(18);

              case 21:
                return _context8.abrupt("return", users);

              case 22:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[4, 15, 18, 21]]);
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
    key: "getAdminUsers",
    value: function getAdminUsers() {
      return _User["default"].query().where('admin', '=', true).orWhere('isSuperUser', '=', true);
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
        var trends, seenPlaces, _iterator3, _step3, user, _iterator4, _step4, place;

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
                _iterator3 = (0, _context9.t0)(_context9.t1);
                _context9.prev = 7;

                _iterator3.s();

              case 9:
                if ((_step3 = _iterator3.n()).done) {
                  _context9.next = 36;
                  break;
                }

                user = _step3.value;

                if (!user.places) {
                  _context9.next = 34;
                  break;
                }

                _iterator4 = _createForOfIteratorHelper(user.places);
                _context9.prev = 13;

                _iterator4.s();

              case 15:
                if ((_step4 = _iterator4.n()).done) {
                  _context9.next = 26;
                  break;
                }

                place = _step4.value;

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

                _iterator4.e(_context9.t4);

              case 31:
                _context9.prev = 31;

                _iterator4.f();

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

                _iterator3.e(_context9.t5);

              case 41:
                _context9.prev = 41;

                _iterator3.f();

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
        var twitter, allTrends, created, trends, _iterator5, _step5, trend, newTrends;

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
                _iterator5 = _createForOfIteratorHelper(trends);

                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    trend = _step5.value;

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
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
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
        var results, _iterator6, _step6, place;

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

                _iterator6 = _createForOfIteratorHelper(user.places);
                _context12.prev = 3;

                _iterator6.s();

              case 5:
                if ((_step6 = _iterator6.n()).done) {
                  _context12.next = 13;
                  break;
                }

                place = _step6.value;
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

                _iterator6.e(_context12.t0);

              case 18:
                _context12.prev = 18;

                _iterator6.f();

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
    value: function () {
      var _getTwitterClientForUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(user) {
        var settings;
        return _regenerator["default"].wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return this.getSettings();

              case 2:
                settings = _context14.sent;
                return _context14.abrupt("return", new _twitter.Twitter({
                  consumerKey: settings.appKey,
                  consumerSecret: settings.appSecret,
                  accessToken: user.twitterAccessToken,
                  accessTokenSecret: user.twitterAccessTokenSecret
                }));

              case 4:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function getTwitterClientForUser(_x10) {
        return _getTwitterClientForUser.apply(this, arguments);
      }

      return getTwitterClientForUser;
    }()
  }, {
    key: "getTwitterClientForApp",
    value: function () {
      var _getTwitterClientForApp = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15() {
        var settings;
        return _regenerator["default"].wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return this.getSettings();

              case 2:
                settings = _context15.sent;

                if (!(settings.appKey && settings.appSecret)) {
                  _context15.next = 7;
                  break;
                }

                return _context15.abrupt("return", new _twitter.Twitter({
                  consumerKey: settings.appKey,
                  consumerSecret: settings.appSecret
                }));

              case 7:
                return _context15.abrupt("return", null);

              case 8:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function getTwitterClientForApp() {
        return _getTwitterClientForApp.apply(this, arguments);
      }

      return getTwitterClientForApp;
    }()
  }, {
    key: "createSearch",
    value: function () {
      var _createSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(search) {
        var s1, s2;
        return _regenerator["default"].wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                search.updated = new Date();
                _context16.next = 3;
                return _Search["default"].query().upsertGraphAndFetch(search, {
                  relate: true,
                  unrelate: true,
                  insertMissing: true
                });

              case 3:
                s1 = _context16.sent;
                _context16.next = 6;
                return _Search["default"].query().select().where('search.id', s1.id).withGraphJoined('creator').withGraphJoined('queries').first();

              case 6:
                s2 = _context16.sent;
                return _context16.abrupt("return", s2);

              case 8:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16);
      }));

      function createSearch(_x11) {
        return _createSearch.apply(this, arguments);
      }

      return createSearch;
    }()
    /**
     * Fetches a search from the database.
     * @param {number} searchId the search id to look up
     * @param {boolean} includeSummary whether to calcuate summary statistics
     * @param {number} ttl how many seconds to cache summary stats for 
     * @returns a search object
     */

  }, {
    key: "getSearch",
    value: function () {
      var _getSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17(searchId) {
        var includeSummary,
            ttl,
            search,
            stats,
            _args17 = arguments;
        return _regenerator["default"].wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                includeSummary = _args17.length > 1 && _args17[1] !== undefined ? _args17[1] : false;
                ttl = _args17.length > 2 && _args17[2] !== undefined ? _args17[2] : 60;
                _context17.next = 4;
                return _Search["default"].query().findById(searchId).withGraphJoined('creator').withGraphJoined('queries.searchJobs');

              case 4:
                search = _context17.sent;

                if (search) {
                  _context17.next = 7;
                  break;
                }

                return _context17.abrupt("return", null);

              case 7:
                if (!includeSummary) {
                  _context17.next = 12;
                  break;
                }

                _context17.next = 10;
                return this.getSearchStats(search, ttl);

              case 10:
                stats = _context17.sent;
                search = _objectSpread(_objectSpread({}, search), stats);

              case 12:
                return _context17.abrupt("return", search);

              case 13:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function getSearch(_x12) {
        return _getSearch.apply(this, arguments);
      }

      return getSearch;
    }()
  }, {
    key: "getPublicSearch",
    value: function () {
      var _getPublicSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(searchId) {
        var search, stats;
        return _regenerator["default"].wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return _Search["default"].query().findById(searchId).whereNotNull("public").withGraphJoined('creator').withGraphJoined('queries');

              case 2:
                search = _context18.sent;

                if (search) {
                  _context18.next = 5;
                  break;
                }

                return _context18.abrupt("return", null);

              case 5:
                _context18.next = 7;
                return this.getSearchStats(search);

              case 7:
                stats = _context18.sent;
                return _context18.abrupt("return", _objectSpread(_objectSpread({}, search), stats));

              case 9:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function getPublicSearch(_x13) {
        return _getPublicSearch.apply(this, arguments);
      }

      return getPublicSearch;
    }()
  }, {
    key: "deleteSearch",
    value: function () {
      var _deleteSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(search) {
        return _regenerator["default"].wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _logger["default"].info("deleting search ".concat(search.id));

                _context19.next = 3;
                return this.stopSearch(search);

              case 3:
                _context19.next = 5;
                return this.stopStream(search);

              case 5:
                return _context19.abrupt("return", _Search["default"].query().del().where('id', search.id));

              case 6:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function deleteSearch(_x14) {
        return _deleteSearch.apply(this, arguments);
      }

      return deleteSearch;
    }()
  }, {
    key: "getUserSearches",
    value: function () {
      var _getUserSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(user) {
        var results, _iterator7, _step7, search;

        return _regenerator["default"].wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return _Search["default"].query().where({
                  userId: user.id,
                  saved: true
                }).withGraphJoined('creator').withGraphJoined('queries').orderBy('created', 'DESC');

              case 2:
                results = _context20.sent;
                _iterator7 = _createForOfIteratorHelper(results);
                _context20.prev = 4;

                _iterator7.s();

              case 6:
                if ((_step7 = _iterator7.n()).done) {
                  _context20.next = 13;
                  break;
                }

                search = _step7.value;
                _context20.next = 10;
                return this.getSearchTweetCount(search);

              case 10:
                search.tweetCount = _context20.sent;

              case 11:
                _context20.next = 6;
                break;

              case 13:
                _context20.next = 18;
                break;

              case 15:
                _context20.prev = 15;
                _context20.t0 = _context20["catch"](4);

                _iterator7.e(_context20.t0);

              case 18:
                _context20.prev = 18;

                _iterator7.f();

                return _context20.finish(18);

              case 21:
                return _context20.abrupt("return", results);

              case 22:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this, [[4, 15, 18, 21]]);
      }));

      function getUserSearches(_x15) {
        return _getUserSearches.apply(this, arguments);
      }

      return getUserSearches;
    }()
  }, {
    key: "getActiveSearches",
    value: function () {
      var _getActiveSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee21() {
        var results, _iterator8, _step8, search;

        return _regenerator["default"].wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return _Search["default"].query().where({
                  "search.active": true,
                  "saved": true
                }).withGraphJoined('creator').withGraphJoined('queries.searchJobs').orderBy('created', 'DESC');

              case 2:
                results = _context21.sent;
                _iterator8 = _createForOfIteratorHelper(results);
                _context21.prev = 4;

                _iterator8.s();

              case 6:
                if ((_step8 = _iterator8.n()).done) {
                  _context21.next = 13;
                  break;
                }

                search = _step8.value;
                _context21.next = 10;
                return this.getSearchTweetCount(search);

              case 10:
                search.tweetCount = _context21.sent;

              case 11:
                _context21.next = 6;
                break;

              case 13:
                _context21.next = 18;
                break;

              case 15:
                _context21.prev = 15;
                _context21.t0 = _context21["catch"](4);

                _iterator8.e(_context21.t0);

              case 18:
                _context21.prev = 18;

                _iterator8.f();

                return _context21.finish(18);

              case 21:
                return _context21.abrupt("return", results);

              case 22:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this, [[4, 15, 18, 21]]);
      }));

      function getActiveSearches() {
        return _getActiveSearches.apply(this, arguments);
      }

      return getActiveSearches;
    }()
  }, {
    key: "getSearchTweetCount",
    value: function () {
      var _getSearchTweetCount = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee22(search) {
        var result;
        return _regenerator["default"].wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                _context22.next = 2;
                return this.pg('tweet').join('search', 'tweet.search_id', '=', 'search.id').where('search.id', '=', search.id).count().first();

              case 2:
                result = _context22.sent;
                return _context22.abrupt("return", parseInt(result.count, 10));

              case 4:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function getSearchTweetCount(_x16) {
        return _getSearchTweetCount.apply(this, arguments);
      }

      return getSearchTweetCount;
    }()
  }, {
    key: "getUserTweetCount",
    value: function () {
      var _getUserTweetCount = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee23(user) {
        var result;
        return _regenerator["default"].wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                _context23.next = 2;
                return this.pg('tweet').join('search', 'tweet.search_id', '=', 'search.id').join('user', 'search.user_id', '=', 'user.id').where({
                  'user.id': user.id,
                  'search.saved': true
                }).count().first();

              case 2:
                result = _context23.sent;
                return _context23.abrupt("return", parseInt(result.count, 10));

              case 4:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function getUserTweetCount(_x17) {
        return _getUserTweetCount.apply(this, arguments);
      }

      return getUserTweetCount;
    }()
  }, {
    key: "getSearchCounts",
    value: function () {
      var _getSearchCounts = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee24(searchIds) {
        var results, counts, _iterator9, _step9, r;

        return _regenerator["default"].wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                _context24.next = 2;
                return this.pg('tweet').select('search_id').whereIn('search_id', searchIds).groupBy('search_id').count('tweet.id');

              case 2:
                results = _context24.sent;
                counts = {};
                _iterator9 = _createForOfIteratorHelper(results);

                try {
                  for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                    r = _step9.value;
                    counts[r.searchId] = parseInt(r.count, 10);
                  }
                } catch (err) {
                  _iterator9.e(err);
                } finally {
                  _iterator9.f();
                }

                return _context24.abrupt("return", counts);

              case 7:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function getSearchCounts(_x18) {
        return _getSearchCounts.apply(this, arguments);
      }

      return getSearchCounts;
    }()
  }, {
    key: "getPublicSearches",
    value: function () {
      var _getPublicSearches = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee25() {
        var results, searches, _iterator10, _step10, search, stats;

        return _regenerator["default"].wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                _context25.next = 2;
                return _Search["default"].query().whereNotNull("public").withGraphJoined('creator').withGraphJoined('queries').orderBy('created', 'DESC');

              case 2:
                results = _context25.sent;
                // remove all info except for the creator's name and id
                results.map(function (s) {
                  s.creator = {
                    id: s.creator.id,
                    name: s.creator.name,
                    email: s.creator.email,
                    twitterScreenName: s.creator.twitterScreenName
                  };
                }); // add stats to each search

                searches = [];
                _iterator10 = _createForOfIteratorHelper(results);
                _context25.prev = 6;

                _iterator10.s();

              case 8:
                if ((_step10 = _iterator10.n()).done) {
                  _context25.next = 16;
                  break;
                }

                search = _step10.value;
                _context25.next = 12;
                return this.getSearchStats(search);

              case 12:
                stats = _context25.sent;
                searches.push(_objectSpread(_objectSpread({}, search), stats));

              case 14:
                _context25.next = 8;
                break;

              case 16:
                _context25.next = 21;
                break;

              case 18:
                _context25.prev = 18;
                _context25.t0 = _context25["catch"](6);

                _iterator10.e(_context25.t0);

              case 21:
                _context25.prev = 21;

                _iterator10.f();

                return _context25.finish(21);

              case 24:
                return _context25.abrupt("return", searches);

              case 25:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this, [[6, 18, 21, 24]]);
      }));

      function getPublicSearches() {
        return _getPublicSearches.apply(this, arguments);
      }

      return getPublicSearches;
    }()
  }, {
    key: "userOverQuota",
    value: function () {
      var _userOverQuota = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee26(user) {
        var count;
        return _regenerator["default"].wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                _context26.next = 2;
                return this.getUserTweetCount(user);

              case 2:
                count = _context26.sent;
                return _context26.abrupt("return", count > user.tweetQuota);

              case 4:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function userOverQuota(_x19) {
        return _userOverQuota.apply(this, arguments);
      }

      return userOverQuota;
    }()
  }, {
    key: "updateSearch",
    value: function () {
      var _updateSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee27(search) {
        var safeSearch;
        return _regenerator["default"].wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                // search properties are explicitly used to guard against trying
                // to persist properties that were added by getSearchStats
                safeSearch = this.removeStatsProps(search);
                _context27.next = 3;
                return _Search["default"].query().patch(_objectSpread(_objectSpread({}, safeSearch), {}, {
                  updated: new Date()
                })).where('id', safeSearch.id);

              case 3:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function updateSearch(_x20) {
        return _updateSearch.apply(this, arguments);
      }

      return updateSearch;
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
      var _getSearchStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee29(search) {
        var ttl,
            key,
            _args29 = arguments;
        return _regenerator["default"].wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                ttl = _args29.length > 1 && _args29[1] !== undefined ? _args29[1] : 60;
                key = (0, _redis.searchStatsKey)(search);
                return _context29.abrupt("return", this.cache(key, ttl, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee28() {
                  var dates, users, tweets, urls, urlCounts;
                  return _regenerator["default"].wrap(function _callee28$(_context28) {
                    while (1) {
                      switch (_context28.prev = _context28.next) {
                        case 0:
                          _context28.next = 2;
                          return _Tweet["default"].query().min('created').max('created').where({
                            'searchId': search.id
                          });

                        case 2:
                          dates = _context28.sent;
                          _context28.next = 5;
                          return _Tweet["default"].query().countDistinct('screenName').where({
                            searchId: search.id
                          }).first();

                        case 5:
                          users = _context28.sent;
                          _context28.next = 8;
                          return _Tweet["default"].query().count('tweetId').where({
                            searchId: search.id
                          }).first();

                        case 8:
                          tweets = _context28.sent;
                          _context28.next = 11;
                          return _Tweet["default"].query().join('tweetUrl', 'id', 'tweetUrl.tweetId').select('type').countDistinct('url').where({
                            searchId: search.id
                          }).groupBy('type');

                        case 11:
                          urls = _context28.sent;
                          urlCounts = new Map(urls.map(function (r) {
                            return [r.type, r.count];
                          }));
                          return _context28.abrupt("return", {
                            minDate: dates[0].min,
                            maxDate: dates[0].max,
                            tweetCount: parseInt(tweets.count, 10),
                            userCount: parseInt(users.count, 10),
                            imageCount: parseInt(urlCounts.get('image'), 10),
                            videoCount: parseInt(urlCounts.get('video'), 10),
                            urlCount: parseInt(urlCounts.get('page'), 10)
                          });

                        case 14:
                        case "end":
                          return _context28.stop();
                      }
                    }
                  }, _callee28);
                }))));

              case 3:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function getSearchStats(_x21) {
        return _getSearchStats.apply(this, arguments);
      }

      return getSearchStats;
    }()
  }, {
    key: "importFromSearch",
    value: function () {
      var _importFromSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee31(search) {
        var _this = this;

        var maxTweets,
            user,
            twtr,
            lastQuery,
            q,
            maxTweetId,
            count,
            _args31 = arguments;
        return _regenerator["default"].wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                maxTweets = _args31.length > 1 && _args31[1] !== undefined ? _args31[1] : 1000;
                _context31.next = 3;
                return this.getUser(search.creator.id);

              case 3:
                user = _context31.sent;
                _context31.next = 6;
                return this.getTwitterClientForUser(user);

              case 6:
                twtr = _context31.sent;
                _context31.next = 9;
                return this.updateSearch({
                  id: search.id,
                  active: true
                });

              case 9:
                // determine the query to run
                lastQuery = search.queries[search.queries.length - 1];
                q = lastQuery.twitterQuery(); // run the search!

                maxTweetId = null;
                count = 0;
                return _context31.abrupt("return", new Promise(function (resolve, reject) {
                  twtr.search({
                    q: q,
                    sinceId: search.maxTweetId,
                    count: maxTweets
                  }, /*#__PURE__*/function () {
                    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee30(err, results) {
                      return _regenerator["default"].wrap(function _callee30$(_context30) {
                        while (1) {
                          switch (_context30.prev = _context30.next) {
                            case 0:
                              if (!err) {
                                _context30.next = 5;
                                break;
                              }

                              _logger["default"].error("caught error during search: ".concat(err));

                              reject(err);
                              _context30.next = 17;
                              break;

                            case 5:
                              if (!(results.length === 0)) {
                                _context30.next = 12;
                                break;
                              }

                              _context30.next = 8;
                              return _this.updateSearch({
                                id: search.id,
                                maxTweetId: maxTweetId,
                                active: false
                              });

                            case 8:
                              _logger["default"].info("no more search results, returning ".concat(count));

                              resolve(count);
                              _context30.next = 17;
                              break;

                            case 12:
                              if (maxTweetId === null) {
                                maxTweetId = results[0].id;
                              }

                              _context30.next = 15;
                              return _this.loadTweets(search, results);

                            case 15:
                              count += results.length;

                              _logger["default"].info("bulk loaded ".concat(results.length, " tweets, with total=").concat(count));

                            case 17:
                            case "end":
                              return _context30.stop();
                          }
                        }
                      }, _callee30);
                    }));

                    return function (_x23, _x24) {
                      return _ref3.apply(this, arguments);
                    };
                  }());
                }));

              case 14:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function importFromSearch(_x22) {
        return _importFromSearch.apply(this, arguments);
      }

      return importFromSearch;
    }()
  }, {
    key: "startStream",
    value: function () {
      var _startStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee32(search, tweetId) {
        var lastQuery, q, job, twtr;
        return _regenerator["default"].wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                _logger["default"].info("starting stream for ".concat(search.id));

                lastQuery = search.queries[search.queries.length - 1];
                q = lastQuery.twitterQuery();
                _context32.next = 5;
                return this.createSearchJob({
                  type: 'stream',
                  queryId: lastQuery.id,
                  tweetId: tweetId,
                  started: new Date(),
                  tweets_start: new Date(),
                  tweets_end: lastQuery.value.endDate
                });

              case 5:
                job = _context32.sent;

                _logger["default"].info("created job ".concat(job.id));

                _context32.next = 9;
                return this.getTwitterClientForApp();

              case 9:
                twtr = _context32.sent;
                return _context32.abrupt("return", twtr.addFilterRule(q, "search-".concat(search.id)));

              case 11:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function startStream(_x25, _x26) {
        return _startStream.apply(this, arguments);
      }

      return startStream;
    }()
  }, {
    key: "stopStream",
    value: function () {
      var _stopStream = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee33(search) {
        var twtr, _iterator11, _step11, rule, query, _iterator12, _step12, job;

        return _regenerator["default"].wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                _logger["default"].info("stopping stream for search ".concat(search.id)); // remove all filter rules for this search


                _context33.next = 3;
                return this.getTwitterClientForApp();

              case 3:
                twtr = _context33.sent;
                _context33.t0 = _createForOfIteratorHelper;
                _context33.next = 7;
                return twtr.getFilterRules();

              case 7:
                _context33.t1 = _context33.sent;
                _iterator11 = (0, _context33.t0)(_context33.t1);
                _context33.prev = 9;

                _iterator11.s();

              case 11:
                if ((_step11 = _iterator11.n()).done) {
                  _context33.next = 19;
                  break;
                }

                rule = _step11.value;

                if (!(rule.tag == "search-".concat(search.id))) {
                  _context33.next = 17;
                  break;
                }

                _context33.next = 16;
                return twtr.deleteFilterRule(rule.id);

              case 16:
                _logger["default"].info("removing filter rule ".concat(rule.id, " for ").concat(search.id));

              case 17:
                _context33.next = 11;
                break;

              case 19:
                _context33.next = 24;
                break;

              case 21:
                _context33.prev = 21;
                _context33.t2 = _context33["catch"](9);

                _iterator11.e(_context33.t2);

              case 24:
                _context33.prev = 24;

                _iterator11.f();

                return _context33.finish(24);

              case 27:
                // need a better way to identify the search job that needs to 
                // be ended but for now just mark any search job that has no 
                // ended time. once we can do historical collection it will be 
                // important to only end the filter stream job
                query = search.queries[search.queries.length - 1];
                _iterator12 = _createForOfIteratorHelper(query.searchJobs);
                _context33.prev = 29;

                _iterator12.s();

              case 31:
                if ((_step12 = _iterator12.n()).done) {
                  _context33.next = 38;
                  break;
                }

                job = _step12.value;

                if (job.ended) {
                  _context33.next = 36;
                  break;
                }

                _context33.next = 36;
                return this.updateSearchJob({
                  id: job.id,
                  ended: new Date()
                });

              case 36:
                _context33.next = 31;
                break;

              case 38:
                _context33.next = 43;
                break;

              case 40:
                _context33.prev = 40;
                _context33.t3 = _context33["catch"](29);

                _iterator12.e(_context33.t3);

              case 43:
                _context33.prev = 43;

                _iterator12.f();

                return _context33.finish(43);

              case 46:
                return _context33.abrupt("return", this.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
                  active: false,
                  archived: false
                })));

              case 47:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this, [[9, 21, 24, 27], [29, 40, 43, 46]]);
      }));

      function stopStream(_x27) {
        return _stopStream.apply(this, arguments);
      }

      return stopStream;
    }()
  }, {
    key: "startSearch",
    value: function () {
      var _startSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee34(search, tweetId) {
        var lastQuery, tweetsEnd, tweetsStart, job;
        return _regenerator["default"].wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                _logger["default"].info("starting search for ".concat(search.id));

                _context34.next = 3;
                return this.updateSearch({
                  id: search.id,
                  active: true
                });

              case 3:
                // get the most recent query
                lastQuery = search.queries[search.queries.length - 1]; // can't search into the future

                tweetsEnd = (0, _moment["default"])().subtract(1, 'minutes');

                if ((0, _moment["default"])(lastQuery.value.endDate) < tweetsEnd) {
                  tweetsEnd = lastQuery.value.endDate;
                }

                tweetsStart = lastQuery.value.startDate;

                if (!(tweetsStart < tweetsEnd)) {
                  _context34.next = 13;
                  break;
                }

                _context34.next = 10;
                return this.createSearchJob({
                  type: 'search',
                  queryId: lastQuery.id,
                  tweetId: tweetId,
                  started: new Date(),
                  tweetsStart: tweetsStart,
                  tweetsEnd: tweetsEnd
                });

              case 10:
                job = _context34.sent;

                _logger["default"].info("adding job ".concat(job.id, " to search job queue"));

                return _context34.abrupt("return", this.redis.lpushAsync(_redis.startSearchJobKey, job.id));

              case 13:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function startSearch(_x28, _x29) {
        return _startSearch.apply(this, arguments);
      }

      return startSearch;
    }()
  }, {
    key: "stopSearch",
    value: function () {
      var _stopSearch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee35(search) {
        var query, _iterator13, _step13, job;

        return _regenerator["default"].wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                _logger["default"].info("stopping search ".concat(search.id)); // need a better way to identify the search job that needs to 
                // be ended but for now just mark any search job that has no 
                // ended time. 


                query = search.queries[search.queries.length - 1];
                _iterator13 = _createForOfIteratorHelper(query.searchJobs);
                _context35.prev = 3;

                _iterator13.s();

              case 5:
                if ((_step13 = _iterator13.n()).done) {
                  _context35.next = 12;
                  break;
                }

                job = _step13.value;

                if (job.ended) {
                  _context35.next = 10;
                  break;
                }

                _context35.next = 10;
                return this.updateSearchJob({
                  id: job.id,
                  ended: new Date()
                });

              case 10:
                _context35.next = 5;
                break;

              case 12:
                _context35.next = 17;
                break;

              case 14:
                _context35.prev = 14;
                _context35.t0 = _context35["catch"](3);

                _iterator13.e(_context35.t0);

              case 17:
                _context35.prev = 17;

                _iterator13.f();

                return _context35.finish(17);

              case 20:
                return _context35.abrupt("return", this.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
                  active: false,
                  archived: false
                })));

              case 21:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this, [[3, 14, 17, 20]]);
      }));

      function stopSearch(_x30) {
        return _stopSearch.apply(this, arguments);
      }

      return stopSearch;
    }()
  }, {
    key: "loadTweets",
    value: function () {
      var _loadTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee37(search, tweets) {
        var _this2 = this;

        var tweetRows, _iterator14, _step14, tweet, _iterator20, _step20, url;

        return _regenerator["default"].wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                _logger["default"].info("loading ".concat(tweets.length, " tweets for searchId=").concat(search.id));

                tweetRows = [];
                _iterator14 = _createForOfIteratorHelper(tweets);

                try {
                  for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                    tweet = _step14.value;
                    _iterator20 = _createForOfIteratorHelper(tweet.urls);

                    try {
                      for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
                        url = _step20.value;
                        urlFetcher.add(search, url["long"], tweet.id);
                      }
                    } catch (err) {
                      _iterator20.e(err);
                    } finally {
                      _iterator20.f();
                    }

                    tweetRows.push({
                      searchId: search.id,
                      tweetId: tweet.id,
                      created: tweet.created,
                      screenName: tweet.user.screenName,
                      userId: tweet.user.id,
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
                  _iterator14.e(err);
                } finally {
                  _iterator14.f();
                }

                _context37.prev = 4;
                _context37.next = 7;
                return _Tweet["default"].transaction( /*#__PURE__*/function () {
                  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee36(trx) {
                    var results, hashtagRows, urlRows, _iterator15, _step15, row, hashtags, _iterator16, _step16, name, urls, _iterator17, _step17, url, _iterator18, _step18, _url, _iterator19, _step19, mediaId, job;

                    return _regenerator["default"].wrap(function _callee36$(_context36) {
                      while (1) {
                        switch (_context36.prev = _context36.next) {
                          case 0:
                            _context36.next = 2;
                            return _Tweet["default"].query(trx).insert(tweetRows).returning(['id', 'tweetId']);

                          case 2:
                            results = _context36.sent;
                            // now we have the tweet id we can attach relevant 
                            // hashtags and urls
                            hashtagRows = [];
                            urlRows = [];
                            _iterator15 = _createForOfIteratorHelper(results);

                            try {
                              for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                                row = _step15.value;
                                // make sure the hashtags are unique!
                                hashtags = new Set(row.json.hashtags);
                                _iterator16 = _createForOfIteratorHelper(hashtags);

                                try {
                                  for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
                                    name = _step16.value;
                                    hashtagRows.push({
                                      name: name,
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator16.e(err);
                                } finally {
                                  _iterator16.f();
                                }

                                urls = new Set(row.json.urls.map(function (r) {
                                  return r["long"];
                                }));
                                _iterator17 = _createForOfIteratorHelper(urls);

                                try {
                                  for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                                    url = _step17.value;
                                    urlRows.push({
                                      url: url,
                                      type: 'page',
                                      tweetId: row.id
                                    });
                                  }
                                } catch (err) {
                                  _iterator17.e(err);
                                } finally {
                                  _iterator17.f();
                                }

                                _iterator18 = _createForOfIteratorHelper(new Set(row.json.images));

                                try {
                                  for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
                                    _url = _step18.value;
                                    urlRows.push({
                                      url: _url,
                                      type: 'image',
                                      tweetId: row.id
                                    });
                                  } // NOTE: For now we need to queue a video lookup job to get the mp4
                                  // url for tweets. Hopefully the v2 API will eventually return mp4 URLs 
                                  // for videos like v1.1 

                                } catch (err) {
                                  _iterator18.e(err);
                                } finally {
                                  _iterator18.f();
                                } // NOTE: For now we need to queue a video lookup job to get the mp4
                                // url for tweets. Hopefully the v2 API will eventually return mp4 URLs 
                                // for videos like v1.1 


                                // NOTE: For now we need to queue a video lookup job to get the mp4
                                // url for tweets. Hopefully the v2 API will eventually return mp4 URLs 
                                // for videos like v1.1 
                                _iterator19 = _createForOfIteratorHelper(row.json.videos);

                                try {
                                  // NOTE: For now we need to queue a video lookup job to get the mp4
                                  // url for tweets. Hopefully the v2 API will eventually return mp4 URLs 
                                  // for videos like v1.1 
                                  for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
                                    mediaId = _step19.value;
                                    job = {
                                      searchId: search.id,
                                      tweetRowId: row.id,
                                      tweetId: row.json.id,
                                      mediaId: mediaId
                                    };

                                    _this2.redis.lpushAsync(_redis.fetchVideoKey, JSON.stringify(job));
                                  }
                                } catch (err) {
                                  _iterator19.e(err);
                                } finally {
                                  _iterator19.f();
                                }
                              }
                            } catch (err) {
                              _iterator15.e(err);
                            } finally {
                              _iterator15.f();
                            }

                            _context36.next = 9;
                            return _TweetHashtag["default"].query(trx).insert(hashtagRows);

                          case 9:
                            _context36.next = 11;
                            return _TweetUrl["default"].query(trx).insert(urlRows);

                          case 11:
                            return _context36.abrupt("return", results.length);

                          case 12:
                          case "end":
                            return _context36.stop();
                        }
                      }
                    }, _callee36);
                  }));

                  return function (_x33) {
                    return _ref4.apply(this, arguments);
                  };
                }());

              case 7:
                _context37.next = 12;
                break;

              case 9:
                _context37.prev = 9;
                _context37.t0 = _context37["catch"](4);

                _logger["default"].error("loadTweets transaction failed: ".concat(_context37.t0));

              case 12:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, null, [[4, 9]]);
      }));

      function loadTweets(_x31, _x32) {
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
    key: "deleteTweets",
    value: function deleteTweets(searchId, tweetIds, twitterUserId) {
      return _Tweet["default"].query()["delete"]().where('tweetId', 'in', tweetIds).andWhere({
        searchId: searchId,
        userId: twitterUserId
      });
    }
  }, {
    key: "getAllTweets",
    value: function () {
      var _getAllTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee38(search) {
        return _regenerator["default"].wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                return _context38.abrupt("return", this.pickJson(_Tweet["default"].query().where('searchId', search.id)));

              case 1:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function getAllTweets(_x34) {
        return _getAllTweets.apply(this, arguments);
      }

      return getAllTweets;
    }()
  }, {
    key: "getTweetsForUrl",
    value: function () {
      var _getTweetsForUrl = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee39(search, url) {
        var type,
            _args39 = arguments;
        return _regenerator["default"].wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                type = _args39.length > 2 && _args39[2] !== undefined ? _args39[2] : 'page';
                return _context39.abrupt("return", this.pickJson(_Tweet["default"].query().where({
                  searchId: search.id,
                  url: url,
                  type: type
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('json').limit(100)));

              case 2:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function getTweetsForUrl(_x35, _x36) {
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
      var _getTweetsForUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee40(search, userId) {
        return _regenerator["default"].wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                return _context40.abrupt("return", this.pickJson(_Tweet["default"].query().where({
                  searchId: search.id,
                  userId: userId
                }).whereNull('retweetId').orderBy('id', 'DESC').limit(100)));

              case 1:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function getTweetsForUser(_x37, _x38) {
        return _getTweetsForUser.apply(this, arguments);
      }

      return getTweetsForUser;
    }()
  }, {
    key: "getTweetsByIds",
    value: function () {
      var _getTweetsByIds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee41(search, ids) {
        return _regenerator["default"].wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                return _context41.abrupt("return", this.pickJson(_Tweet["default"].query().where({
                  searchId: search.id
                }).whereIn('tweetId', ids).orderBy('id', 'DESC').limit(100)));

              case 1:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function getTweetsByIds(_x39, _x40) {
        return _getTweetsByIds.apply(this, arguments);
      }

      return getTweetsByIds;
    }()
  }, {
    key: "getTwitterUsers",
    value: function () {
      var _getTwitterUsers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee42(search) {
        var offset,
            limit,
            userCounts,
            users,
            seen,
            results,
            _iterator21,
            _step21,
            u,
            _args42 = arguments;

        return _regenerator["default"].wrap(function _callee42$(_context42) {
          while (1) {
            switch (_context42.prev = _context42.next) {
              case 0:
                offset = _args42.length > 1 && _args42[1] !== undefined ? _args42[1] : 0;
                limit = _args42.length > 2 && _args42[2] !== undefined ? _args42[2] : 100;
                _context42.next = 4;
                return _Tweet["default"].query().select('screenName').count('* as total').where('searchId', search.id).groupBy('screenName').orderBy('total', 'DESC').offset(offset).limit(limit);

              case 4:
                userCounts = _context42.sent;
                this.convertCounts(userCounts, 'total'); // turn database results into a map of screename -> total

                userCounts = new Map(userCounts.map(function (r) {
                  return [r.screenName, r.total];
                })); // it might be more efficient to model users on import? 
                // but perhaps its better to pull them out adhoc until
                // we actually have a conversaton with them?

                _context42.next = 9;
                return _Tweet["default"].query().select('json', 'screenName').where('searchId', search.id).whereIn('screenName', Array.from(userCounts.keys()));

              case 9:
                users = _context42.sent;
                // seen is needed because we could get multiple tweets from the same user
                // and would end up with more than one results for a user 
                seen = new Set();
                results = [];
                _iterator21 = _createForOfIteratorHelper(users);

                try {
                  for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
                    u = _step21.value;

                    if (!seen.has(u.screenName)) {
                      results.push(_objectSpread(_objectSpread({}, u.json.user), {}, {
                        tweetsInSearch: userCounts.get(u.screenName)
                      }));
                      seen.add(u.screenName);
                    }
                  } // sort them again

                } catch (err) {
                  _iterator21.e(err);
                } finally {
                  _iterator21.f();
                }

                results.sort(function (a, b) {
                  return b.tweetsInSearch - a.tweetsInSearch;
                });
                return _context42.abrupt("return", results);

              case 16:
              case "end":
                return _context42.stop();
            }
          }
        }, _callee42, this);
      }));

      function getTwitterUsers(_x41) {
        return _getTwitterUsers.apply(this, arguments);
      }

      return getTwitterUsers;
    }()
  }, {
    key: "getHashtags",
    value: function () {
      var _getHashtags = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee43(search) {
        var results;
        return _regenerator["default"].wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                _context43.next = 2;
                return _Tweet["default"].query().where('searchId', search.id).join('tweetHashtag', 'tweet.id', 'tweetHashtag.tweetId').select('name as hashtag').count('name').groupBy('hashtag').orderBy('count', 'DESC');

              case 2:
                results = _context43.sent;
                return _context43.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this);
      }));

      function getHashtags(_x42) {
        return _getHashtags.apply(this, arguments);
      }

      return getHashtags;
    }()
  }, {
    key: "getUrls",
    value: function () {
      var _getUrls = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee44(search) {
        var results;
        return _regenerator["default"].wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                _context44.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'page'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url').count('url').groupBy('url').orderBy('count', 'DESC');

              case 2:
                results = _context44.sent;
                return _context44.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function getUrls(_x43) {
        return _getUrls.apply(this, arguments);
      }

      return getUrls;
    }()
  }, {
    key: "getImages",
    value: function () {
      var _getImages = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee45(search) {
        var results;
        return _regenerator["default"].wrap(function _callee45$(_context45) {
          while (1) {
            switch (_context45.prev = _context45.next) {
              case 0:
                _context45.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'image'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url').count('url').groupBy('url').orderBy('count', 'DESC');

              case 2:
                results = _context45.sent;
                return _context45.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context45.stop();
            }
          }
        }, _callee45, this);
      }));

      function getImages(_x44) {
        return _getImages.apply(this, arguments);
      }

      return getImages;
    }()
  }, {
    key: "getVideos",
    value: function () {
      var _getVideos = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee46(search) {
        var results;
        return _regenerator["default"].wrap(function _callee46$(_context46) {
          while (1) {
            switch (_context46.prev = _context46.next) {
              case 0:
                _context46.next = 2;
                return _Tweet["default"].query().where({
                  searchId: search.id,
                  type: 'video'
                }).join('tweetUrl', 'tweet.id', 'tweetUrl.tweetId').select('url', 'thumbnailUrl').count('url').groupBy(['url', 'thumbnailUrl']).orderBy('count', 'DESC');

              case 2:
                results = _context46.sent;
                return _context46.abrupt("return", this.convertCounts(results));

              case 4:
              case "end":
                return _context46.stop();
            }
          }
        }, _callee46, this);
      }));

      function getVideos(_x45) {
        return _getVideos.apply(this, arguments);
      }

      return getVideos;
    }()
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
    key: "getSearchesWithUser",
    value: function () {
      var _getSearchesWithUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee47(twitterScreenName) {
        var results, counts, _iterator22, _step22, row, tweets;

        return _regenerator["default"].wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                _context47.next = 2;
                return _Tweet["default"].query().where({
                  screenName: twitterScreenName
                }).whereNull('retweetId').select('searchId', 'tweetId').groupBy('searchId', 'tweetId');

              case 2:
                results = _context47.sent;
                counts = new Map();
                _iterator22 = _createForOfIteratorHelper(results);

                try {
                  for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
                    row = _step22.value;
                    tweets = counts.get(row.searchId) || [];
                    tweets.push(row.tweetId);
                    counts.set(row.searchId, tweets);
                  }
                } catch (err) {
                  _iterator22.e(err);
                } finally {
                  _iterator22.f();
                }

                return _context47.abrupt("return", Object.fromEntries(counts));

              case 7:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47);
      }));

      function getSearchesWithUser(_x46) {
        return _getSearchesWithUser.apply(this, arguments);
      }

      return getSearchesWithUser;
    }()
  }, {
    key: "getSystemStats",
    value: function () {
      var _getSystemStats = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee48() {
        var tweets, users;
        return _regenerator["default"].wrap(function _callee48$(_context48) {
          while (1) {
            switch (_context48.prev = _context48.next) {
              case 0:
                _context48.next = 2;
                return _Tweet["default"].query().count().first();

              case 2:
                tweets = _context48.sent;
                _context48.next = 5;
                return _User["default"].query().count().first();

              case 5:
                users = _context48.sent;
                return _context48.abrupt("return", {
                  tweetCount: Number.parseInt(tweets.count, 10),
                  userCount: Number.parseInt(users.count, 10)
                });

              case 7:
              case "end":
                return _context48.stop();
            }
          }
        }, _callee48);
      }));

      function getSystemStats() {
        return _getSystemStats.apply(this, arguments);
      }

      return getSystemStats;
    }()
  }, {
    key: "pickJson",
    value: function () {
      var _pickJson = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee49(query) {
        var results;
        return _regenerator["default"].wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                _context49.next = 2;
                return query;

              case 2:
                results = _context49.sent;
                return _context49.abrupt("return", results.map(function (o) {
                  return o.json;
                }));

              case 4:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49);
      }));

      function pickJson(_x47) {
        return _pickJson.apply(this, arguments);
      }

      return pickJson;
    }()
  }, {
    key: "convertCounts",
    value: function () {
      var _convertCounts = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee50(l) {
        var prop,
            _iterator23,
            _step23,
            o,
            _args50 = arguments;

        return _regenerator["default"].wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                prop = _args50.length > 1 && _args50[1] !== undefined ? _args50[1] : 'count';
                _iterator23 = _createForOfIteratorHelper(l);

                try {
                  for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
                    o = _step23.value;
                    o[prop] = Number.parseInt(o[prop], 10);
                  }
                } catch (err) {
                  _iterator23.e(err);
                } finally {
                  _iterator23.f();
                }

                return _context50.abrupt("return", l);

              case 4:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50);
      }));

      function convertCounts(_x48) {
        return _convertCounts.apply(this, arguments);
      }

      return convertCounts;
    }()
  }, {
    key: "getActions",
    value: function () {
      var _getActions = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee51(search) {
        var user,
            includeArchived,
            q,
            _args51 = arguments;
        return _regenerator["default"].wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                user = _args51.length > 1 && _args51[1] !== undefined ? _args51[1] : null;
                includeArchived = _args51.length > 2 && _args51[2] !== undefined ? _args51[2] : false;
                q = {
                  'action.searchId': search.id
                };

                if (user) {
                  q['action.userId'] = user.id;
                }

                if (!includeArchived) {
                  _context51.next = 8;
                  break;
                }

                return _context51.abrupt("return", _Action["default"].query().withGraphFetched('tweet').withGraphFetched('user').where(q).orderBy('created', 'desc'));

              case 8:
                return _context51.abrupt("return", _Action["default"].query().withGraphFetched('tweet').withGraphFetched('user').where(q).whereNull('archived').orderBy('created', 'desc'));

              case 9:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51);
      }));

      function getActions(_x49) {
        return _getActions.apply(this, arguments);
      }

      return getActions;
    }()
  }, {
    key: "setActions",
    value: function () {
      var _setActions = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee52(search, user, tweetIds, name) {
        var remove,
            results,
            localTweetIds,
            _iterator24,
            _step24,
            tweetId,
            _args52 = arguments;

        return _regenerator["default"].wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                remove = _args52.length > 4 && _args52[4] !== undefined ? _args52[4] : false;
                _context52.next = 3;
                return _Tweet["default"].query().where('searchId', search.id).andWhere('tweetId', 'in', tweetIds);

              case 3:
                results = _context52.sent;
                localTweetIds = results.map(function (t) {
                  return t.id;
                }); // archive existing label actions for these tweet ids

                _context52.next = 7;
                return _Action["default"].query().patch({
                  archived: new Date()
                }).where({
                  searchId: search.id,
                  userId: user.id,
                  name: name
                }).andWhere('tweetId', 'in', localTweetIds);

              case 7:
                if (remove) {
                  _context52.next = 25;
                  break;
                }

                _iterator24 = _createForOfIteratorHelper(localTweetIds);
                _context52.prev = 9;

                _iterator24.s();

              case 11:
                if ((_step24 = _iterator24.n()).done) {
                  _context52.next = 17;
                  break;
                }

                tweetId = _step24.value;
                _context52.next = 15;
                return _Action["default"].query().insert({
                  searchId: search.id,
                  userId: user.id,
                  tweetId: tweetId,
                  name: name
                });

              case 15:
                _context52.next = 11;
                break;

              case 17:
                _context52.next = 22;
                break;

              case 19:
                _context52.prev = 19;
                _context52.t0 = _context52["catch"](9);

                _iterator24.e(_context52.t0);

              case 22:
                _context52.prev = 22;

                _iterator24.f();

                return _context52.finish(22);

              case 25:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, null, [[9, 19, 22, 25]]);
      }));

      function setActions(_x50, _x51, _x52, _x53) {
        return _setActions.apply(this, arguments);
      }

      return setActions;
    }()
  }, {
    key: "getUserActions",
    value: function () {
      var _getUserActions = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee53(user) {
        var includeArchived,
            q,
            _args53 = arguments;
        return _regenerator["default"].wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                includeArchived = _args53.length > 1 && _args53[1] !== undefined ? _args53[1] : false;
                q = {
                  'action.userId': user.id
                };

                if (!includeArchived) {
                  _context53.next = 6;
                  break;
                }

                return _context53.abrupt("return", _Action["default"].query().withGraphFetched('tweet').withGraphFetched('user').where(q).orderBy('created', 'desc'));

              case 6:
                return _context53.abrupt("return", _Action["default"].query().withGraphFetched('tweet').withGraphFetched('user').where(q).whereNull('archived').orderBy('created', 'desc'));

              case 7:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53);
      }));

      function getUserActions(_x54) {
        return _getUserActions.apply(this, arguments);
      }

      return getUserActions;
    }()
  }, {
    key: "getQuery",
    value: function () {
      var _getQuery = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee54(queryId) {
        var query;
        return _regenerator["default"].wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                _context54.next = 2;
                return _Query["default"].query().findById(queryId).withGraphJoined('search').withGraphJoined('searchJobs').withGraphJoined('search.creator').orderBy('searchJobs.created', 'ASC');

              case 2:
                query = _context54.sent;
                return _context54.abrupt("return", query);

              case 4:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54);
      }));

      function getQuery(_x55) {
        return _getQuery.apply(this, arguments);
      }

      return getQuery;
    }()
  }, {
    key: "createSearchJob",
    value: function createSearchJob(job) {
      return _SearchJob["default"].query().insertAndFetch(job);
    }
  }, {
    key: "getSearchJob",
    value: function () {
      var _getSearchJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee55(searchJobId) {
        var job;
        return _regenerator["default"].wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                _context55.next = 2;
                return _SearchJob["default"].query().findById(searchJobId).withGraphJoined('query.search');

              case 2:
                job = _context55.sent;
                return _context55.abrupt("return", job);

              case 4:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55);
      }));

      function getSearchJob(_x56) {
        return _getSearchJob.apply(this, arguments);
      }

      return getSearchJob;
    }()
  }, {
    key: "updateSearchJob",
    value: function () {
      var _updateSearchJob = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee56(job) {
        return _regenerator["default"].wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                _context56.next = 2;
                return _SearchJob["default"].query().patch(_objectSpread(_objectSpread({}, job), {}, {
                  updated: new Date()
                })).where('id', job.id);

              case 2:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56);
      }));

      function updateSearchJob(_x57) {
        return _updateSearchJob.apply(this, arguments);
      }

      return updateSearchJob;
    }()
  }, {
    key: "updateQuery",
    value: function () {
      var _updateQuery = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee57(query) {
        return _regenerator["default"].wrap(function _callee57$(_context57) {
          while (1) {
            switch (_context57.prev = _context57.next) {
              case 0:
                _context57.next = 2;
                return _Query["default"].query().patch(query).where('id', query.id);

              case 2:
              case "end":
                return _context57.stop();
            }
          }
        }, _callee57);
      }));

      function updateQuery(_x58) {
        return _updateQuery.apply(this, arguments);
      }

      return updateQuery;
    }()
  }, {
    key: "getEarliestTweet",
    value: function () {
      var _getEarliestTweet = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee58(search) {
        var results;
        return _regenerator["default"].wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
                _context58.next = 2;
                return _Tweet["default"].query().min('created').where({
                  'searchId': search.id
                });

              case 2:
                results = _context58.sent;

                if (!(results.length > 0)) {
                  _context58.next = 7;
                  break;
                }

                return _context58.abrupt("return", results[0].min);

              case 7:
                return _context58.abrupt("return", null);

              case 8:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58);
      }));

      function getEarliestTweet(_x59) {
        return _getEarliestTweet.apply(this, arguments);
      }

      return getEarliestTweet;
    }()
  }, {
    key: "insertUrls",
    value: function insertUrls(urls) {
      return _TweetUrl["default"].query().insert(urls);
    }
  }, {
    key: "cache",
    value: function () {
      var _cache = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee59(key) {
        var ttl,
            f,
            value,
            _args59 = arguments;
        return _regenerator["default"].wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
                ttl = _args59.length > 1 && _args59[1] !== undefined ? _args59[1] : 60;
                f = _args59.length > 2 ? _args59[2] : undefined;
                _context59.next = 4;
                return this.redis.getAsync(key);

              case 4:
                value = _context59.sent;

                if (!value) {
                  _context59.next = 9;
                  break;
                }

                return _context59.abrupt("return", JSON.parse(value));

              case 9:
                _context59.next = 11;
                return f();

              case 11:
                value = _context59.sent;
                _context59.next = 14;
                return this.redis.setAsync(key, JSON.stringify(value), "EX", ttl);

              case 14:
                return _context59.abrupt("return", value);

              case 15:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this);
      }));

      function cache(_x60) {
        return _cache.apply(this, arguments);
      }

      return cache;
    }()
  }]);
  return Database;
}();

exports.Database = Database;