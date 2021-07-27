"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var _streamLoader = require("./stream-loader");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var app = (0, _express["default"])();
var db = new _db.Database();
var streamLoader = new _streamLoader.StreamLoaderController();
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
              _context4.next = 18;
              break;
            }

            settings = {
              logoUrl: req.body.logoUrl,
              instanceTitle: req.body.instanceTitle,
              appKey: req.body.appKey,
              appSecret: req.body.appSecret,
              instanceInfoLink: req.body.instanceInfoLink,
              instanceDescription: req.body.instanceDescription,
              instanceTweetText: req.body.instanceTweetText,
              emailHost: req.body.emailHost,
              emailPort: req.body.emailPort,
              emailUser: req.body.emailUser,
              emailPassword: req.body.emailPassword,
              emailFromAddress: req.body.emailFromAddress,
              defaultQuota: parseInt(req.body.defaultQuota, 10) || 50000
            };
            _context4.prev = 5;
            _context4.next = 8;
            return db.addSettings(settings);

          case 8:
            (0, _auth.activateKeys)();
            res.json({
              status: 'updated'
            });
            _context4.next = 16;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](5);
            console.error(_context4.t0);
            res.json({
              status: 'error'
            });

          case 16:
            _context4.next = 19;
            break;

          case 18:
            notAuthorized(res);

          case 19:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[5, 12]]);
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
    var search, summ, lastQuery, _search, _summ, _lastQuery;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!req.user) {
              _context7.next = 12;
              break;
            }

            _context7.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context7.sent;
            _context7.next = 6;
            return db.getSearchSummary(search);

          case 6:
            summ = _context7.sent;
            lastQuery = summ.queries[summ.queries.length - 1];
            summ.query = lastQuery.value.or;
            res.json(summ);
            _context7.next = 25;
            break;

          case 12:
            _context7.next = 14;
            return db.getPublicSearch(req.params.searchId);

          case 14:
            _search = _context7.sent;

            if (!_search) {
              _context7.next = 24;
              break;
            }

            _context7.next = 18;
            return db.getSearchSummary(_search);

          case 18:
            _summ = _context7.sent;
            _lastQuery = _summ.queries[_summ.queries.length - 1];
            _summ.query = _lastQuery.value.or;
            res.json(_summ);
            _context7.next = 25;
            break;

          case 24:
            res.status(401).json({
              error: 'Not Authorized'
            });

          case 25:
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
app.put('/search/:searchId', function (req, res) {
  if (req.user) {
    db.getSearch(req.body.id).then(function (search) {
      var newSearch = _objectSpread(_objectSpread({}, search), req.body);

      db.updateSearch(newSearch).then(function () {
        if (req.query.refreshTweets) {
          db.importFromSearch(search);
        } else if (search.active && !newSearch.active) {
          streamLoader.stopStream(search.id);
        } else if (!search.active && newSearch.active) {
          streamLoader.startStream(search.id);
        } else if (!search.archiveStarted && newSearch.archiveStarted) {
          var archive = new _archive.Archive();
          archive.createArchive(search);
        }
      });
      res.json(newSearch);
    });
  } else {
    notAuthorized(res);
  }
});
app["delete"]('/search/:searchId', /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res) {
    var search, userOwnsSearch, result;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!req.user) {
              _context8.next = 15;
              break;
            }

            _context8.next = 3;
            return db.getSearch(req.body.id);

          case 3:
            search = _context8.sent;
            userOwnsSearch = search && search.userId == req.user.id;

            if (!(userOwnsSearch || req.user.admin)) {
              _context8.next = 12;
              break;
            }

            _context8.next = 8;
            return db.deleteSearch(search);

          case 8:
            result = _context8.sent;
            res.json(result);
            _context8.next = 13;
            break;

          case 12:
            notAuthorized(res);

          case 13:
            _context8.next = 16;
            break;

          case 15:
            notAuthorized(res);

          case 16:
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
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res) {
    var userId, twitterUserId, searchId, tweetIds, result;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!req.user) {
              _context9.next = 11;
              break;
            }

            userId = req.user.id;
            twitterUserId = req.user.twitterUserId;
            searchId = req.body.searchId;
            tweetIds = req.body.tweetIds;
            _context9.next = 7;
            return db.deleteTweets(searchId, tweetIds, twitterUserId);

          case 7:
            result = _context9.sent;
            res.json({
              message: "Deleted ".concat(result, " tweets (").concat(tweetIds, ") from ").concat(searchId, " for ").concat(userId, ":").concat(twitterUserId)
            });
            _context9.next = 12;
            break;

          case 11:
            notAuthorized(res);

          case 12:
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
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(req, res) {
    var search, webpages;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!req.user) {
              _context10.next = 10;
              break;
            }

            _context10.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context10.sent;
            _context10.next = 6;
            return db.getWebpages(search);

          case 6:
            webpages = _context10.sent;
            res.json(webpages);
            _context10.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
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
app.put('/search/:searchId/webpages', /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(req, res) {
    var search, url;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!req.user) {
              _context11.next = 16;
              break;
            }

            _context11.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context11.sent;
            url = req.body.url;

            if (!(req.body.selected === true)) {
              _context11.next = 10;
              break;
            }

            _context11.next = 8;
            return db.selectWebpage(search, url);

          case 8:
            _context11.next = 13;
            break;

          case 10:
            if (!(req.body.deselected === true)) {
              _context11.next = 13;
              break;
            }

            _context11.next = 13;
            return db.deselectWebpage(search, url);

          case 13:
            res.json({
              status: 'updated'
            });
            _context11.next = 17;
            break;

          case 16:
            notAuthorized(res);

          case 17:
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
app.get('/search/:searchId/queue', /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(req, res) {
    var search, result;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (!req.user) {
              _context12.next = 10;
              break;
            }

            _context12.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context12.sent;
            _context12.next = 6;
            return db.queueStats(search);

          case 6:
            result = _context12.sent;
            res.json(result);
            _context12.next = 11;
            break;

          case 10:
            notAuthorized(res);

          case 11:
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
app.get('/search/:searchId/actions', /*#__PURE__*/function () {
  var _ref13 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(req, res) {
    var search, userOwnsSearch, actions;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            if (!req.user) {
              _context13.next = 18;
              break;
            }

            _context13.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context13.sent;
            userOwnsSearch = search.userId == req.user.id;
            actions = null;

            if (!(req.query.all && (userOwnsSearch || req.user.admin || req.user.isSuperUser))) {
              _context13.next = 12;
              break;
            }

            _context13.next = 9;
            return db.getActions(search);

          case 9:
            actions = _context13.sent;
            _context13.next = 15;
            break;

          case 12:
            _context13.next = 14;
            return db.getActions(search, req.user);

          case 14:
            actions = _context13.sent;

          case 15:
            res.json(actions);
            _context13.next = 19;
            break;

          case 18:
            notAuthorized(res);

          case 19:
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
app.put('/search/:searchId/actions', /*#__PURE__*/function () {
  var _ref14 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(req, res) {
    var search, actions;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            if (!req.user) {
              _context14.next = 12;
              break;
            }

            _context14.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context14.sent;
            _context14.next = 6;
            return db.setActions(search, req.user, req.body.tweets, req.body.action.label, req.body.action.remove);

          case 6:
            _context14.next = 8;
            return db.getActions(search, req.user);

          case 8:
            actions = _context14.sent;
            res.json(actions);
            _context14.next = 13;
            break;

          case 12:
            notAuthorized(res);

          case 13:
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
app.get('/actions', /*#__PURE__*/function () {
  var _ref15 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(req, res) {
    var actions;
    return _regenerator["default"].wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            if (!req.user) {
              _context15.next = 7;
              break;
            }

            _context15.next = 3;
            return db.getUserActions(req.user);

          case 3:
            actions = _context15.sent;
            res.json(actions);
            _context15.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
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
app.get('/wayback/:url', /*#__PURE__*/function () {
  var _ref16 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(req, res) {
    var result;
    return _regenerator["default"].wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            if (!req.user) {
              _context16.next = 7;
              break;
            }

            _context16.next = 3;
            return _wayback["default"].closest(req.params.url);

          case 3:
            result = _context16.sent;
            res.json(result);
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
app.put('/wayback/:url', /*#__PURE__*/function () {
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
            return _wayback["default"].saveArchive(req.params.url);

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
app.get('/stats', /*#__PURE__*/function () {
  var _ref18 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(req, res) {
    return _regenerator["default"].wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            if (!req.user) {
              _context18.next = 8;
              break;
            }

            _context18.t0 = res;
            _context18.next = 4;
            return db.getSystemStats();

          case 4:
            _context18.t1 = _context18.sent;

            _context18.t0.json.call(_context18.t0, _context18.t1);

            _context18.next = 9;
            break;

          case 8:
            notAuthorized(res);

          case 9:
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
app.get('/users', /*#__PURE__*/function () {
  var _ref19 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(req, res) {
    return _regenerator["default"].wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            if (!req.user.isSuperUser) {
              _context19.next = 8;
              break;
            }

            _context19.t0 = res;
            _context19.next = 4;
            return db.getUsers();

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
app.get('/findme', /*#__PURE__*/function () {
  var _ref20 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(req, res) {
    var results;
    return _regenerator["default"].wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            if (!req.user) {
              _context20.next = 7;
              break;
            }

            _context20.next = 3;
            return db.getSearchesWithUser(req.user.twitterScreenName);

          case 3:
            results = _context20.sent;
            res.json(results);
            _context20.next = 8;
            break;

          case 7:
            notAuthorized(res);

          case 8:
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
module.exports = app;