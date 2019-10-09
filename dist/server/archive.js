"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Archive = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _sync = _interopRequireDefault(require("csv-stringify/lib/sync"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _archiver = _interopRequireDefault(require("archiver"));

var _tweetArchive = _interopRequireDefault(require("tweet-archive"));

var _db = require("./db");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Archive =
/*#__PURE__*/
function () {
  function Archive() {
    (0, _classCallCheck2["default"])(this, Archive);
    this.db = new _db.Database();
  }

  (0, _createClass2["default"])(Archive, [{
    key: "createArchive",
    value: function () {
      var _createArchive = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(search) {
        var _this = this;

        var user, projectDir, userDataDir, archivesDir, searchDir, tweetsPath, builder, metadata;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.db.getUser(search.creator);

              case 2:
                user = _context2.sent;
                projectDir = _path["default"].dirname(_path["default"].dirname(__dirname));
                userDataDir = _path["default"].join(projectDir, 'userData');
                archivesDir = _path["default"].join(userDataDir, 'archives');
                searchDir = _path["default"].join(archivesDir, search.id);

                if (!_fs["default"].existsSync(searchDir)) {
                  _fs["default"].mkdirSync(searchDir);
                }

                _context2.next = 10;
                return this.saveTweets(search, searchDir);

              case 10:
                tweetsPath = _context2.sent;
                _context2.next = 13;
                return this.saveUrls(search, searchDir);

              case 13:
                builder = new _tweetArchive["default"]();
                metadata = {
                  title: search.title,
                  creator: user.name,
                  startDate: search.created,
                  endDate: search.updated,
                  searchQuery: search.query.map(function (q) {
                    return q.value;
                  }).join(' ')
                };
                _context2.next = 17;
                return builder.build(tweetsPath, metadata, searchDir);

              case 17:
                return _context2.abrupt("return", new Promise(function (resolve) {
                  var zipPath = _path["default"].join(archivesDir, "".concat(search.id, ".zip"));

                  var zipOut = _fs["default"].createWriteStream(zipPath);

                  var archive = (0, _archiver["default"])('zip');
                  archive.pipe(zipOut);
                  archive.directory(searchDir, search.id);
                  archive.on('finish', function () {
                    (0, _rimraf["default"])(searchDir, {},
                    /*#__PURE__*/
                    (0, _asyncToGenerator2["default"])(
                    /*#__PURE__*/
                    _regenerator["default"].mark(function _callee() {
                      return _regenerator["default"].wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return _this.db.updateSearch(_objectSpread({}, search, {
                                archived: true,
                                archiveStarted: false
                              }));

                            case 2:
                              resolve(zipPath);

                            case 3:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    })));
                  });
                  archive.finalize();
                }));

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createArchive(_x) {
        return _createArchive.apply(this, arguments);
      }

      return createArchive;
    }()
  }, {
    key: "close",
    value: function () {
      var _close = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.db.close();

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: "saveTweets",
    value: function () {
      var _saveTweets = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5(search, searchDir) {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref2 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee4(resolve) {
                    var tweetsPath, fh;
                    return _regenerator["default"].wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            tweetsPath = _path["default"].join(searchDir, 'tweets.csv');
                            fh = _fs["default"].createWriteStream(tweetsPath);
                            fh.write("id,screen_name,retweet\r\n");
                            _context4.next = 5;
                            return _this2.db.getAllTweets(search, function (tweet) {
                              var isRetweet = tweet.retweet ? true : false;
                              var row = [tweet.id, tweet.user.screenName, isRetweet];
                              fh.write(row.join(',') + '\r\n');
                            });

                          case 5:
                            fh.end('');
                            fh.on('close', function () {
                              resolve(tweetsPath);
                            });

                          case 7:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function (_x4) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function saveTweets(_x2, _x3) {
        return _saveTweets.apply(this, arguments);
      }

      return saveTweets;
    }()
  }, {
    key: "saveUrls",
    value: function () {
      var _saveUrls = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee7(search, searchDir) {
        var _this3 = this;

        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref3 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee6(resolve) {
                    var urlsPath, fh, offset, webpages, s;
                    return _regenerator["default"].wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            urlsPath = _path["default"].join(searchDir, 'urls.csv');
                            fh = _fs["default"].createWriteStream(urlsPath);
                            offset = 0;
                            fh.write('url,title,count\r\n');

                          case 4:
                            if (!true) {
                              _context6.next = 15;
                              break;
                            }

                            _context6.next = 7;
                            return _this3.db.getWebpages(search, offset);

                          case 7:
                            webpages = _context6.sent;

                            if (!(webpages.length === 0)) {
                              _context6.next = 10;
                              break;
                            }

                            return _context6.abrupt("break", 15);

                          case 10:
                            s = (0, _sync["default"])(webpages, {
                              columns: ['url', 'title', 'count']
                            });
                            fh.write(s + '\r\n');
                            offset += 100;
                            _context6.next = 4;
                            break;

                          case 15:
                            fh.end('');
                            fh.on('close', function () {
                              resolve(urlsPath);
                            });

                          case 17:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _callee6);
                  }));

                  return function (_x7) {
                    return _ref3.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function saveUrls(_x5, _x6) {
        return _saveUrls.apply(this, arguments);
      }

      return saveUrls;
    }()
  }]);
  return Archive;
}();

exports.Archive = Archive;