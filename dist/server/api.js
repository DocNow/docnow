'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _multiparty = require('multiparty');

var _multiparty2 = _interopRequireDefault(_multiparty);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _wayback = require('./wayback');

var _wayback2 = _interopRequireDefault(_wayback);

var _db = require('./db');

var _auth = require('./auth');

var _streamLoader = require('./stream-loader');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var db = new _db.Database();

var streamLoader = new _streamLoader.StreamLoaderController();

db.setupIndexes();
db.startTrendsWatcher({ interval: 60 * 1000 });

app.get('/setup', function (req, res) {
  db.getSettings().then(function (result) {
    if (result && result.appKey && result.appSecret) {
      res.json(true);
    } else {
      res.json(false);
    }
  }).catch(function () {
    res.json(false);
  });
});

app.get('/user', function (req, res) {
  if (req.user) {
    db.getUser(req.user.id).then(function (user) {
      delete user.twitterAccessToken;
      delete user.twitterAccessTokenSecret;
      res.json(user);
    }).catch(function () {
      res.status(401);
      res.json({ message: 'no such user' });
    });
  } else {
    res.status(401);
    res.json({ message: 'not logged in' });
  }
});

app.put('/user', function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res) {
    var user, newUser;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!req.user) {
              _context.next = 8;
              break;
            }

            _context.next = 3;
            return db.getUser(req.user.id);

          case 3:
            user = _context.sent;
            newUser = (0, _extends3.default)({}, user, req.body);
            _context.next = 7;
            return db.updateUser(newUser);

          case 7:
            res.json(newUser);

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

app.get('/settings', function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
    var settings;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return db.getSettings();

          case 2:
            settings = _context2.sent;

            if (!settings || !req.user) {
              res.json({});
            } else {
              if (!req.user.isSuperUser) {
                delete settings.appKey;
                delete settings.appSecret;
              }
              res.json(settings);
            }

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

app.put('/settings', function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res) {
    var superUser, settings;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return db.getSuperUser();

          case 2:
            superUser = _context3.sent;

            if (!(!superUser || req.user && req.user.isSuperUser)) {
              _context3.next = 9;
              break;
            }

            settings = {
              logoUrl: req.body.logoUrl,
              instanceTitle: req.body.instanceTitle,
              appKey: req.body.appKey,
              appSecret: req.body.appSecret };
            _context3.next = 7;
            return db.addSettings(settings);

          case 7:
            (0, _auth.activateKeys)();
            res.json({ status: 'updated' });

          case 9:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());

app.get('/world', function (req, res) {
  db.getPlaces().then(function (places) {
    var world = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(places), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var place = _step.value;

        world[place.id] = place;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    res.json(world);
  });
});

app.get('/trends', function (req, res) {
  var lookup = null;
  if (req.user) {
    lookup = db.getUserTrends(req.user);
  } else {
    lookup = db.getSuperUser().then(function (user) {
      return db.getUserTrends(user);
    });
  }
  lookup.then(function (result) {
    res.json(result);
  });
});

app.put('/trends', function (req, res) {
  db.getUser(req.user.id).then(function (user) {
    user.places = req.body;
    db.updateUser(user).then(function () {
      db.importLatestTrendsForUser(user).then(function () {
        res.json({ status: 'updated' });
      });
    });
  });
});

app.post('/logo', function (req, res) {
  if (req.user) {
    if (req.user.isSuperUser) {
      var form = new _multiparty2.default.Form();

      form.parse(req, function (parseErr, fields, files) {
        var path = files.imageFile[0].path;

        var newPath = './userData/images/logo.png';

        fs.readFile(path, function (readErr, data) {
          if (readErr) {
            _logger2.default.error(readErr);
          } else {
            fs.writeFile(newPath, data, function (writeErr) {
              if (writeErr) {
                _logger2.default.error(writeErr);
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
  }
});

app.get('/searches', function (req, res) {
  if (req.user) {
    db.getUserSearches(req.user).then(function (searches) {
      res.json(searches);
    });
  }
});

app.post('/searches', function (req, res) {
  if (req.user) {
    db.createSearch(req.user, req.body.query).then(function (search) {
      db.importFromSearch(search);
      res.redirect(303, '/api/v1/search/' + search.id);
    }).catch(function (e) {
      var msg = 'unable to createSearch: ' + e;
      _logger2.default.error(msg);
      res.error(msg);
    });
  }
});

app.get('/search/:searchId', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getSearchSummary(search).then(function (summ) {
        res.json(summ);
      });
    });
  }
});

app.put('/search/:searchId', function (req, res) {
  if (req.user) {
    db.getSearch(req.body.id).then(function (search) {
      var newSearch = (0, _extends3.default)({}, search, req.body);

      db.updateSearch(newSearch).then(function () {
        if (req.query.refreshTweets) {
          db.importFromSearch(search);
        } else if (search.active && !newSearch.active) {
          streamLoader.stopStream(search.id);
        } else if (!search.active && newSearch.active) {
          streamLoader.startStream(search.id);
        } else if (!search.archiveStarted && newSearch.archiveStarted) {
          db.createArchive(search);
        }
      });

      res.json(newSearch);
    });
  }
});

app.delete('/search/:searchId', function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {
    var search, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!req.user) {
              _context4.next = 8;
              break;
            }

            _context4.next = 3;
            return db.getSearch(req.body.id);

          case 3:
            search = _context4.sent;
            _context4.next = 6;
            return db.deleteSearch(search);

          case 6:
            result = _context4.sent;

            res.json(result);

          case 8:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());

app.get('/search/:searchId/tweets', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      if (req.query.url) {
        db.getTweetsForUrl(search, req.query.url).then(function (tweets) {
          res.json(tweets);
        });
      } else {
        var includeRetweets = req.query.includeRetweets ? true : false;
        db.getTweets(search, includeRetweets).then(function (tweets) {
          res.json(tweets);
        });
      }
    });
  }
});

app.get('/search/:searchId/users', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getTwitterUsers(search).then(function (users) {
        res.json(users);
      });
    });
  }
});

app.get('/search/:searchId/hashtags', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getHashtags(search).then(function (hashtags) {
        res.json(hashtags);
      });
    });
  }
});

app.get('/search/:searchId/urls', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getUrls(search).then(function (urls) {
        res.json(urls);
      });
    });
  }
});

app.get('/search/:searchId/images', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getImages(search).then(function (images) {
        res.json(images);
      });
    });
  }
});

app.get('/search/:searchId/videos', function (req, res) {
  if (req.user) {
    db.getSearch(req.params.searchId).then(function (search) {
      db.getVideos(search).then(function (videos) {
        res.json(videos);
      });
    });
  }
});

app.get('/search/:searchId/webpages', function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(req, res) {
    var search, webpages;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!req.user) {
              _context5.next = 8;
              break;
            }

            _context5.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context5.sent;
            _context5.next = 6;
            return db.getWebpages(search);

          case 6:
            webpages = _context5.sent;

            res.json(webpages);

          case 8:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());

app.put('/search/:searchId/webpages', function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(req, res) {
    var search, url;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!req.user) {
              _context6.next = 14;
              break;
            }

            _context6.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context6.sent;
            url = req.body.url;

            if (!(req.body.selected === true)) {
              _context6.next = 10;
              break;
            }

            _context6.next = 8;
            return db.selectWebpage(search, url);

          case 8:
            _context6.next = 13;
            break;

          case 10:
            if (!(req.body.deselected === true)) {
              _context6.next = 13;
              break;
            }

            _context6.next = 13;
            return db.deselectWebpage(search, url);

          case 13:
            res.json({ status: 'updated' });

          case 14:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());

app.get('/search/:searchId/queue', function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(req, res) {
    var search, result;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!req.user) {
              _context7.next = 8;
              break;
            }

            _context7.next = 3;
            return db.getSearch(req.params.searchId);

          case 3:
            search = _context7.sent;
            _context7.next = 6;
            return db.queueStats(search);

          case 6:
            result = _context7.sent;

            res.json(result);

          case 8:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());

app.get('/wayback/:url', function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(req, res) {
    var result;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!req.user) {
              _context8.next = 5;
              break;
            }

            _context8.next = 3;
            return _wayback2.default.closest(req.params.url);

          case 3:
            result = _context8.sent;

            res.json(result);

          case 5:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}());

app.put('/wayback/:url', function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(req, res) {
    var result;
    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!req.user) {
              _context9.next = 5;
              break;
            }

            _context9.next = 3;
            return _wayback2.default.saveArchive(req.params.url);

          case 3:
            result = _context9.sent;

            res.json(result);

          case 5:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}());

app.get('/stats', function () {
  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(req, res) {
    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!req.user) {
              _context10.next = 6;
              break;
            }

            _context10.t0 = res;
            _context10.next = 4;
            return db.getSystemStats();

          case 4:
            _context10.t1 = _context10.sent;

            _context10.t0.json.call(_context10.t0, _context10.t1);

          case 6:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined);
  }));

  return function (_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
}());

module.exports = app;