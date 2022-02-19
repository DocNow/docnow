"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _multiparty = _interopRequireDefault(require("multiparty"));

var fs = _interopRequireWildcard(require("fs"));

var _logger = _interopRequireDefault(require("./logger"));

var _wayback = _interopRequireDefault(require("./wayback"));

var _db = require("./db");

var _archive = require("./archive");

var _auth = require("./auth");

var _twitter = require("./twitter");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var app = (0, _express["default"])();
var db = new _db.Database();
db.startTrendsWatcher({
  interval: 60 * 1000
});

function notAuthorized(res) {
  res.status(401).json({
    error: 'Not Authorized'
  });
}

app.get('/setup', function (req, res) {
  db.getSettings().then(function (result) {
    if (result && result.appKey && result.appSecret) {
      res.json(true);
    } else {
      res.json(false);
    }
  })["catch"](function () {
    res.json(false);
  });
});
app.get('/user', function (req, res) {
  if (req.user) {
    db.getUser(req.user.id).then(function (user) {
      delete user.twitterAccessToken;
      delete user.twitterAccessTokenSecret;
      res.json(user);
    })["catch"](function () {
      res.status(401);
      res.json({
        message: 'no such user'
      });
    });
  } else {
    notAuthorized(res);
  }
});
app.put('/user', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var user, newUser;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!req.user) {
              _context.next = 10;
              break;
            }

            _context.next = 3;
            return db.getUser(req.user.id);

          case 3:
            user = _context.sent;
            newUser = _objectSpread(_objectSpread({}, user), {}, {
              email: req.body.email
            });
            _context.next = 7;
            return db.updateUser(newUser);

          case 7:
            res.json(newUser);
            _context.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.put('/user/:userId', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var user, newUser;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(req.user && req.user.isSuperUser)) {
              _context2.next = 10;
              break;
            }

            _context2.next = 3;
            return db.getUser(req.params.userId);

          case 3:
            user = _context2.sent;
            newUser = _objectSpread(_objectSpread({}, user), req.body);
            _context2.next = 7;
            return db.updateUser(newUser);

          case 7:
            res.json(newUser);
            _context2.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('/settings', /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var settings;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return db.getSettings();

          case 2:
            settings = _context3.sent;

            // if they aren't logged in or the they're not an admin
            // be sure to delete the app key settings!
            if (!req.user || req.user && !req.user.isSuperUser) {
              delete settings.appKey;
              delete settings.appSecret;
            }

            res.json(settings);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
app.put('/settings', /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var superUser, settings;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return db.getSuperUser();

          case 2:
            superUser = _context4.sent;

            if (!(!superUser || req.user && req.user.isSuperUser)) {
              _context4.next = 34;
              break;
            }

            _context4.t0 = req.body.logoUrl;
            _context4.t1 = req.body.instanceTitle;
            _context4.t2 = req.body.appKey;
            _context4.t3 = req.body.appSecret;
            _context4.t4 = req.body.instanceInfoLink;
            _context4.t5 = req.body.instanceDescription;
            _context4.t6 = req.body.instanceTweetText;
            _context4.t7 = req.body.emailHost;
            _context4.t8 = req.body.emailPort;
            _context4.t9 = req.body.emailUser;
            _context4.t10 = req.body.emailPassword;
            _context4.t11 = req.body.emailFromAddress;
            _context4.t12 = parseInt(req.body.defaultQuota, 10) || 50000;
            _context4.next = 19;
            return (0, _twitter.isAcademic)(req.body.appKey, req.body.appSecret);

          case 19:
            _context4.t13 = _context4.sent;
            settings = {
              logoUrl: _context4.t0,
              instanceTitle: _context4.t1,
              appKey: _context4.t2,
              appSecret: _context4.t3,
              instanceInfoLink: _context4.t4,
              instanceDescription: _context4.t5,
              instanceTweetText: _context4.t6,
              emailHost: _context4.t7,
              emailPort: _context4.t8,
              emailUser: _context4.t9,
              emailPassword: _context4.t10,
              emailFromAddress: _context4.t11,
              defaultQuota: _context4.t12,
              academic: _context4.t13
            };
            _context4.prev = 21;
            _context4.next = 24;
            return db.addSettings(settings);

          case 24:
            (0, _auth.activateKeys)();
            res.json({
              status: 'updated'
            });
            _context4.next = 32;
            break;

          case 28:
            _context4.prev = 28;
            _context4.t14 = _context4["catch"](21);
            console.error(_context4.t14);
            res.json({
              status: 'error'
            });

          case 32:
            _context4.next = 35;
            break;

          case 34:
            notAuthorized(res);

          case 35:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[21, 28]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
app.get('/world', function (req, res) {
  db.getPlaces().then(function (places) {
    var world = {};

    var _iterator = _createForOfIteratorHelper(places),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var place = _step.value;
        world[place.id] = place;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    res.json(world);
  });
});
app.get('/trends', /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var results, user;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            results = null;

            if (!req.user) {
              _context5.next = 7;
              break;
            }

            _context5.next = 4;
            return db.getUserTrends(req.user);

          case 4:
            results = _context5.sent;
            _context5.next = 13;
            break;

          case 7:
            _context5.next = 9;
            return db.getSuperUser();

          case 9:
            user = _context5.sent;
            _context5.next = 12;
            return db.getUserTrends(user);

          case 12:
            results = _context5.sent;

          case 13:
            res.json(results);

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
app.put('/trends', /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var user, newPlaceIds, _iterator2, _step2, place;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!req.user) {
              _context6.next = 29;
              break;
            }

            _context6.next = 3;
            return db.getUser(req.user.id);

          case 3:
            user = _context6.sent;
            // create sparse object of places with the place ids
            newPlaceIds = req.body;
            user.places = newPlaceIds.map(function (placeId) {
              return {
                id: placeId
              };
            }); // update the users place ids

            _context6.next = 8;
            return db.updateUser(user);

          case 8:
            user = _context6.sent;
            // load latest data for these places
            _iterator2 = _createForOfIteratorHelper(user.places);
            _context6.prev = 10;

            _iterator2.s();

          case 12:
            if ((_step2 = _iterator2.n()).done) {
              _context6.next = 18;
              break;
            }

            place = _step2.value;
            _context6.next = 16;
            return db.importLatestTrendsForPlace(place, user);

          case 16:
            _context6.next = 12;
            break;

          case 18:
            _context6.next = 23;
            break;

          case 20:
            _context6.prev = 20;
            _context6.t0 = _context6["catch"](10);

            _iterator2.e(_context6.t0);

          case 23:
            _context6.prev = 23;

            _iterator2.f();

            return _context6.finish(23);

          case 26:
            res.json({
              status: 'updated'
            });
            _context6.next = 30;
            break;

          case 29:
            notAuthorized(res);

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[10, 20, 23, 26]]);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());
app.post('/logo', function (req, res) {
  if (req.user) {
    if (req.user.isSuperUser) {
      var form = new _multiparty["default"].Form();
      form.parse(req, function (parseErr, fields, files) {
        var path = files.imageFile[0].path;
        var newPath = './userData/images/logo.png';
        fs.readFile(path, function (readErr, data) {
          if (readErr) {
            _logger["default"].error(readErr);
          } else {
            fs.writeFile(newPath, data, function (writeErr) {
              if (writeErr) {
                _logger["default"].error(writeErr);
              } else {
                fs.unlink(path, function () {
                  res.send('File uploaded to: ' + newPath);
                });
              }
            });
          }
        });
      });
    }
  } else {
    notAuthorized(res);
  }
});
app.get('/searches', function (req, res) {
  // if the user is logged in and they aren't asking for public searches
  if (req.user && !req.query["public"]) {
    var userId = req.user.id;

    if (req.query.userId && req.user.isSuperUser) {
      userId = req.query.userId;
    }

    db.getUserSearches({
      id: userId
    }).then(function (searches) {
      res.json(searches);
    });
  } else {
    // otherwise they just get the public
    db.getPublicSearches().then(function (searches) {
      res.json(searches);
    });
  }
});
app.post('/searches', function (req, res) {
  if (req.user) {
    var searchInfo = {
      userId: req.user.id,
      title: req.body.query.map(function (o) {
        return o.value;
      }).join(' '),
      queries: [{
        value: {
          or: req.body.query
        }
      }]
    };
    db.createSearch(searchInfo).then(function (search) {
      db.importFromSearch(search);
      res.redirect(303, "/api/v1/search/".concat(search.id));
    })["catch"](function (e) {
      var msg = 'unable to createSearch: ' + e;

      _logger["default"].error(msg);

      res.error(msg);
    });
  } else {
    notAuthorized(res);
  }
});
app.get('/search/:searchId', /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res) {
    var searchId, includeSummary, ttl, search, lastQuery, _search, _lastQuery;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            searchId = req.params.searchId;
            includeSummary = true;
            ttl = 2;

            if (!req.user) {
              _context7.next = 12;
              break;
            }

            _context7.next = 6;
            return db.getSearch(searchId, includeSummary, ttl);

          case 6:
            search = _context7.sent;
            // need to ensure that user owns the search!
            lastQuery = search.queries[search.queries.length - 1];
            search.query = lastQuery.value.or;
            res.json(search);
            _context7.next = 16;
            break;

          case 12:
            _context7.next = 14;
            return db.getPublicSearch(req.params.searchId, includeSummary, ttl);

          case 14:
            _search = _context7.sent;

            if (_search) {
              _lastQuery = _search.queries[_search.queries.length - 1];
              _search.query = _lastQuery.value.or;
              res.json(_search);
            } else {
              res.status(401).json({
                error: 'Not Authorized'
              });
            }

          case 16:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
app.put('/search/:searchId', /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res) {
    var search, error, tweetText, startDate, endDate, limit, newSearch, tweetId, twtr, lastQuery, now, archive;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!req.user) {
              _context8.next = 64;
              break;
            }

            _context8.next = 3;
            return db.getSearch(req.body.id, true);

          case 3:
            search = _context8.sent;
            error = null; // these are important but aren't part of the search body

            tweetText = req.body.tweetText;
            delete req.body.tweetText;
            startDate = req.body.startDate;
            delete req.body.startDate;
            endDate = req.body.endDate;
            delete req.body.endDate;
            limit = req.body.limit;
            delete req.body.limit; // update the search

            newSearch = _objectSpread(_objectSpread({}, search), req.body);
            _context8.next = 16;
            return db.updateSearch(newSearch);

          case 16:
            if (!req.query.refreshTweets) {
              _context8.next = 20;
              break;
            }

            db.importFromSearch(search); // are they stopping collection?

            _context8.next = 61;
            break;

          case 20:
            if (!(search.active && !newSearch.active)) {
              _context8.next = 27;
              break;
            }

            _context8.next = 23;
            return db.stopStream(search);

          case 23:
            _context8.next = 25;
            return db.stopSearch(search);

          case 25:
            _context8.next = 61;
            break;

          case 27:
            if (!(!search.active && newSearch.active)) {
              _context8.next = 60;
              break;
            }

            _context8.next = 30;
            return db.userOverQuota(req.user);

          case 30:
            if (!_context8.sent) {
              _context8.next = 35;
              break;
            }

            error = {
              message: 'You have exceeded your tweet quota.',
              code: 1
            };
            newSearch.active = false;
            _context8.next = 58;
            break;

          case 35:
            _context8.next = 37;
            return db.updateSearch({
              id: search.id,
              "public": new Date()
            });

          case 37:
            // tweet the announcement if we were given text to tweet
            tweetId = null;

            if (!tweetText) {
              _context8.next = 45;
              break;
            }

            _context8.next = 41;
            return db.getTwitterClientForUser(req.user);

          case 41:
            twtr = _context8.sent;
            _context8.next = 44;
            return twtr.sendTweet(tweetText);

          case 44:
            tweetId = _context8.sent;

          case 45:
            // update the query with any limit or startDate that were given
            lastQuery = newSearch.queries[newSearch.queries.length - 1];
            lastQuery.value.startDate = startDate;
            lastQuery.value.endDate = endDate;
            lastQuery.value.limit = limit;
            _context8.next = 51;
            return db.updateQuery(lastQuery);

          case 51:
            // start a search if either startDate or endDate are in the past
            now = new Date();

            if (!(new Date(startDate) < now)) {
              _context8.next = 55;
              break;
            }

            _context8.next = 55;
            return db.startSearch(newSearch, tweetId);

          case 55:
            if (!(new Date(endDate) > now)) {
              _context8.next = 58;
              break;
            }

            _context8.next = 58;
            return db.startStream(newSearch, tweetId);

          case 58:
            _context8.next = 61;
            break;

          case 60:
            if (!search.archiveStarted && newSearch.archiveStarted) {
              archive = new _archive.Archive();
              archive.createArchive(search);
            }

          case 61:
            // if we ran into an error return that, otherwise return the new search!
            if (error) {
              newSearch.error = error;
              res.status(403).json(newSearch);
            } else {
              res.json(newSearch);
            }

            _context8.next = 65;
            break;

          case 64:
            notAuthorized(res);

          case 65:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}());
app["delete"]('/search/:searchId', /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res) {
    var search, userOwnsSearch, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!req.user) {
              _context9.next = 15;
              break;
            }

            _context9.next = 3;
            return db.getSearch(req.body.id);

          case 3:
            search = _context9.sent;
            userOwnsSearch = search && search.userId == req.user.id;

            if (!(userOwnsSearch || req.user.admin)) {
              _context9.next = 12;
              break;
            }

            _context9.next = 8;
            return db.deleteSearch(search);

          case 8:
            result = _context9.sent;
            res.json(result);
            _context9.next = 13;
            break;

          case 12:
            notAuthorized(res);

          case 13:
            _context9.next = 16;
            break;

          case 15:
            notAuthorized(res);

          case 16:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}());
app.get('/search/:searchId/tweets', function (req, res) {
  var searchReq = null;

  if (req.user) {
    searchReq = db.getSearch(req.params.searchId);
  } else {
    searchReq = db.getPublicSearch(req.params.searchId);

    if (!searchReq) {
      return notAuthorized(res);
    }
  }

  searchReq.then(function (search) {
    if (req.query.url) {
      db.getTweetsForUrl(search, req.query.url).then(function (tweets) {
        res.json(tweets);
      });
    } else if (req.query.mine) {
      if (req.user) {
        db.getTweetsForUser(search, req.user.twitterUserId).then(function (tweets) {
          res.json(tweets);
        });
      } else {
        res.json([]);
      }
    } else if (req.query.image) {
      db.getTweetsForImage(search, req.query.image).then(function (tweets) {
        res.json(tweets);
      });
    } else if (req.query.video) {
      db.getTweetsForVideo(search, req.query.video).then(function (tweets) {
        res.json(tweets);
      });
    } else if (req.query.ids) {
      db.getTweetsByIds(search, req.query.ids.split(',')).then(function (tweets) {
        res.json(tweets);
      });
    } else {
      var includeRetweets = req.query.includeRetweets ? true : false;
      var offset = req.query.offset ? req.query.offset : 0;
      var limit = req.query.limit ? req.query.limit : 100;
      db.getTweets(search, includeRetweets, offset, limit).then(function (tweets) {
        res.json(tweets);
      });
    }
  });
});
app.put('/search/:searchId/tweets', /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res) {
    var userId, twitterUserId, searchId, tweetIds, result;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!req.user) {
              _context10.next = 11;
              break;
            }

            userId = req.user.id;
            twitterUserId = req.user.twitterUserId;
            searchId = req.body.searchId;
            tweetIds = req.body.tweetIds;
            _context10.next = 7;
            return db.deleteTweets(searchId, tweetIds, twitterUserId);

          case 7:
            result = _context10.sent;
            res.json({
              message: "Deleted ".concat(result, " tweets (").concat(tweetIds, ") from ").concat(searchId, " for ").concat(userId, ":").concat(twitterUserId)
            });
            _context10.next = 12;
            break;

          case 11:
            notAuthorized(res);

          case 12:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}());
app.get('/search/:searchId/users', function (req, res) {
  var searchReq = null;

  if (req.user) {
    searchReq = db.getSearch(req.params.searchId);
  } else {
    searchReq = db.getPublicSearch(req.params.searchId);

    if (!searchReq) {
      return res.status(401).json({
        error: 'Not Authorized'
      });
    }
  }

  searchReq.then(function (search) {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 100;
    db.getTwitterUsers(search, offset, limit).then(function (users) {
      res.json(users);
    });
  });
});
app.get('/search/:searchId/hashtags', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getHashtags(search).then(function (hashtags) {
        res.json(hashtags);
      });
    });
  } else {
    notAuthorized(res);
  }
});
app.get('/search/:searchId/urls', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getUrls(search).then(function (urls) {
        res.json(urls);
      });
    });
  } else {
    notAuthorized(res);
  }
});
app.get('/search/:searchId/images', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getImages(search).then(function (images) {
        res.json(images);
      });
    });
  } else {
    notAuthorized(res);
  }
});
app.get('/search/:searchId/videos', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getVideos(search).then(function (videos) {
        res.json(videos);
      });
    });
  } else {
    notAuthorized(res);
  }
});
app.get('/search/:searchId/webpages', /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res) {
    var search, webpages;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!req.user) {
              _context11.next = 10;
              break;
            }

            _context11.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context11.sent;
            _context11.next = 6;
            return db.getWebpages(search);

          case 6:
            webpages = _context11.sent;
            res.json(webpages);
            _context11.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
}());
app.put('/search/:searchId/webpages', /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res) {
    var search, url;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (!req.user) {
              _context12.next = 16;
              break;
            }

            _context12.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context12.sent;
            url = req.body.url;

            if (!(req.body.selected === true)) {
              _context12.next = 10;
              break;
            }

            _context12.next = 8;
            return db.selectWebpage(search, url);

          case 8:
            _context12.next = 13;
            break;

          case 10:
            if (!(req.body.deselected === true)) {
              _context12.next = 13;
              break;
            }

            _context12.next = 13;
            return db.deselectWebpage(search, url);

          case 13:
            res.json({
              status: 'updated'
            });
            _context12.next = 17;
            break;

          case 16:
            notAuthorized(res);

          case 17:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function (_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
}());
app.get('/search/:searchId/queue', /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(req, res) {
    var search, result;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            if (!req.user) {
              _context13.next = 10;
              break;
            }

            _context13.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context13.sent;
            _context13.next = 6;
            return db.queueStats(search);

          case 6:
            result = _context13.sent;
            res.json(result);
            _context13.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function (_x25, _x26) {
    return _ref13.apply(this, arguments);
  };
}());
app.get('/search/:searchId/actions', /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(req, res) {
    var search, userOwnsSearch, actions;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            if (!req.user) {
              _context14.next = 18;
              break;
            }

            _context14.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context14.sent;
            userOwnsSearch = search.userId == req.user.id;
            actions = null;

            if (!(req.query.all && (userOwnsSearch || req.user.admin || req.user.isSuperUser))) {
              _context14.next = 12;
              break;
            }

            _context14.next = 9;
            return db.getActions(search);

          case 9:
            actions = _context14.sent;
            _context14.next = 15;
            break;

          case 12:
            _context14.next = 14;
            return db.getActions(search, req.user);

          case 14:
            actions = _context14.sent;

          case 15:
            res.json(actions);
            _context14.next = 19;
            break;

          case 18:
            notAuthorized(res);

          case 19:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function (_x27, _x28) {
    return _ref14.apply(this, arguments);
  };
}());
app.put('/search/:searchId/actions', /*#__PURE__*/function () {
  var _ref15 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(req, res) {
    var search, actions;
    return _regenerator["default"].wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            if (!req.user) {
              _context15.next = 12;
              break;
            }

            _context15.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context15.sent;
            _context15.next = 6;
            return db.setActions(search, req.user, req.body.tweets, req.body.action.label, req.body.action.remove);

          case 6:
            _context15.next = 8;
            return db.getActions(search, req.user);

          case 8:
            actions = _context15.sent;
            res.json(actions);
            _context15.next = 13;
            break;

          case 12:
            notAuthorized(res);

          case 13:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));

  return function (_x29, _x30) {
    return _ref15.apply(this, arguments);
  };
}());
app.get('/actions', /*#__PURE__*/function () {
  var _ref16 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(req, res) {
    var actions;
    return _regenerator["default"].wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            if (!req.user) {
              _context16.next = 7;
              break;
            }

            _context16.next = 3;
            return db.getUserActions(req.user);

          case 3:
            actions = _context16.sent;
            res.json(actions);
            _context16.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));

  return function (_x31, _x32) {
    return _ref16.apply(this, arguments);
  };
}());
app.get('/wayback/:url', /*#__PURE__*/function () {
  var _ref17 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17(req, res) {
    var result;
    return _regenerator["default"].wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            if (!req.user) {
              _context17.next = 7;
              break;
            }

            _context17.next = 3;
            return _wayback["default"].closest(req.params.url);

          case 3:
            result = _context17.sent;
            res.json(result);
            _context17.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));

  return function (_x33, _x34) {
    return _ref17.apply(this, arguments);
  };
}());
app.put('/wayback/:url', /*#__PURE__*/function () {
  var _ref18 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(req, res) {
    var result;
    return _regenerator["default"].wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            if (!req.user) {
              _context18.next = 7;
              break;
            }

            _context18.next = 3;
            return _wayback["default"].saveArchive(req.params.url);

          case 3:
            result = _context18.sent;
            res.json(result);
            _context18.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));

  return function (_x35, _x36) {
    return _ref18.apply(this, arguments);
  };
}());
app.get('/stats', /*#__PURE__*/function () {
  var _ref19 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(req, res) {
    return _regenerator["default"].wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            if (!req.user) {
              _context19.next = 8;
              break;
            }

            _context19.t0 = res;
            _context19.next = 4;
            return db.getSystemStats();

          case 4:
            _context19.t1 = _context19.sent;

            _context19.t0.json.call(_context19.t0, _context19.t1);

            _context19.next = 9;
            break;

          case 8:
            notAuthorized(res);

          case 9:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));

  return function (_x37, _x38) {
    return _ref19.apply(this, arguments);
  };
}());
app.get('/users', /*#__PURE__*/function () {
  var _ref20 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(req, res) {
    return _regenerator["default"].wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            if (!req.user.isAdmin()) {
              _context20.next = 8;
              break;
            }

            _context20.t0 = res;
            _context20.next = 4;
            return db.getUsers();

          case 4:
            _context20.t1 = _context20.sent;

            _context20.t0.json.call(_context20.t0, _context20.t1);

            _context20.next = 9;
            break;

          case 8:
            notAuthorized(res);

          case 9:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));

  return function (_x39, _x40) {
    return _ref20.apply(this, arguments);
  };
}());
app.get('/findme', /*#__PURE__*/function () {
  var _ref21 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee21(req, res) {
    var results;
    return _regenerator["default"].wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            if (!req.user) {
              _context21.next = 7;
              break;
            }

            _context21.next = 3;
            return db.getSearchesWithUser(req.user.twitterScreenName);

          case 3:
            results = _context21.sent;
            res.json(results);
            _context21.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21);
  }));

  return function (_x41, _x42) {
    return _ref21.apply(this, arguments);
  };
}());
app.get('/counts', /*#__PURE__*/function () {
  var _ref22 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee22(req, res) {
    var searchIds, searchCounts;
    return _regenerator["default"].wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            if (!(req.user && req.query.searchIds)) {
              _context22.next = 12;
              break;
            }

            // turn searchIds into a list of numbers
            searchIds = req.query.searchIds.split(',').map(function (s) {
              return parseInt(s, 10);
            }).filter(function (n) {
              return !isNaN(n);
            });

            if (!(searchIds.length > 0)) {
              _context22.next = 9;
              break;
            }

            _context22.next = 5;
            return db.getSearchCounts(searchIds);

          case 5:
            searchCounts = _context22.sent;
            res.json(searchCounts);
            _context22.next = 10;
            break;

          case 9:
            res.status(400).json({
              error: 'searchIds must be a comma separated list of numbers'
            });

          case 10:
            _context22.next = 13;
            break;

          case 12:
            if (!req.query.searchIds) {
              res.status(400).json({
                error: 'please supply searchIds query parameter'
              });
            } else {
              notAuthorized(res);
            }

          case 13:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22);
  }));

  return function (_x43, _x44) {
    return _ref22.apply(this, arguments);
  };
}());
module.exports = app;