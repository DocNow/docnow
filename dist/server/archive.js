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

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackArchive = _interopRequireDefault(require("../../webpack.archive.config"));

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Archive = /*#__PURE__*/function () {
  function Archive() {
    (0, _classCallCheck2["default"])(this, Archive);
    this.db = new _db.Database();
  }

  (0, _createClass2["default"])(Archive, [{
    key: "createArchive",
    value: function () {
      var _createArchive = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(search) {
        var _this = this;

        var user, projectDir, userDataDir, archivesDir, searchDir, dataDir, appDir, appSrcDir, appBuildDir, appDataDir, data, files, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, ext, src, dst, tweetsData, users, images, videos, hashtags;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _logger["default"].info("Creating archive for ".concat(search.id));

                _context4.next = 3;
                return this.db.getUser(search.creator);

              case 3:
                user = _context4.sent;
                projectDir = _path["default"].dirname(_path["default"].dirname(__dirname));
                userDataDir = _path["default"].join(projectDir, 'userData');
                archivesDir = _path["default"].join(userDataDir, 'archives');
                searchDir = _path["default"].join(archivesDir, search.id);
                dataDir = _path["default"].join(searchDir, 'data');
                appDir = _path["default"].join(projectDir, 'src', 'archive');
                appSrcDir = _path["default"].join(appDir, 'app');
                appBuildDir = _path["default"].join(appDir, search.id);
                appDataDir = _path["default"].join(appBuildDir, 'data');
                data = {
                  id: search.id,
                  creator: user.name,
                  query: search.query,
                  startDate: search.created,
                  endDate: search.updated,
                  tweetCount: search.tweetCount,
                  imageCount: search.imageCount,
                  videoCount: search.videoCount,
                  userCount: search.userCount,
                  urlCount: search.urlCount,
                  title: search.title
                };
                _context4.prev = 14;

                if (!_fs["default"].existsSync(searchDir)) {
                  _fs["default"].mkdirSync(searchDir);
                }

                if (!_fs["default"].existsSync(dataDir)) {
                  _fs["default"].mkdirSync(dataDir);
                }

                if (!_fs["default"].existsSync(appBuildDir)) {
                  _fs["default"].mkdirSync(appBuildDir);
                }

                _context4.next = 24;
                break;

              case 20:
                _context4.prev = 20;
                _context4.t0 = _context4["catch"](14);
                console.error(_context4.t0);
                throw _context4.t0;

              case 24:
                // copy source of Archive app to unique directory
                files = _fs["default"].readdirSync(appSrcDir);
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context4.prev = 28;
                _iterator = files[Symbol.iterator]();

              case 30:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context4.next = 41;
                  break;
                }

                file = _step.value;
                ext = _path["default"].extname(file).toLowerCase();

                if (!(ext !== '.js' && ext !== '.html' && ext !== '.css')) {
                  _context4.next = 35;
                  break;
                }

                return _context4.abrupt("continue", 38);

              case 35:
                src = _path["default"].join(appSrcDir, file);
                dst = _path["default"].join(appBuildDir, file);

                try {
                  _fs["default"].copyFileSync(src, dst);
                } catch (err) {
                  console.error("unable to copy ".concat(src, " to ").concat(dst, ": ").concat(err));
                }

              case 38:
                _iteratorNormalCompletion = true;
                _context4.next = 30;
                break;

              case 41:
                _context4.next = 47;
                break;

              case 43:
                _context4.prev = 43;
                _context4.t1 = _context4["catch"](28);
                _didIteratorError = true;
                _iteratorError = _context4.t1;

              case 47:
                _context4.prev = 47;
                _context4.prev = 48;

                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }

              case 50:
                _context4.prev = 50;

                if (!_didIteratorError) {
                  _context4.next = 53;
                  break;
                }

                throw _iteratorError;

              case 53:
                return _context4.finish(50);

              case 54:
                return _context4.finish(47);

              case 55:
                // Create data dir in build
                if (!_fs["default"].existsSync(appDataDir)) {
                  _fs["default"].mkdirSync(appDataDir);
                } // get tweets
                // Create both a CSV file and get the list back


                _context4.next = 58;
                return this.saveTweets(search, dataDir);

              case 58:
                tweetsData = _context4.sent;
                data.tweets = tweetsData; // get users

                _context4.next = 62;
                return this.db.getTwitterUsers(search);

              case 62:
                users = _context4.sent;
                data.users = users; // get images

                _context4.next = 66;
                return this.db.getImages(search);

              case 66:
                images = _context4.sent;
                data.images = images; // get videos

                _context4.next = 70;
                return this.db.getVideos(search);

              case 70:
                videos = _context4.sent;
                data.videos = videos; // get hashtags

                _context4.next = 74;
                return this.db.getHashtags(search);

              case 74:
                hashtags = _context4.sent;
                data.hashtags = hashtags;

                _logger["default"].info("Archive: obtained search data."); // get webpages
                // Create both a CSV and a JSON file.


                _context4.next = 79;
                return this.saveUrls(search, dataDir, appDataDir);

              case 79:
                _logger["default"].info("Archive: saved webpages"); // Create search JSON file.


                _context4.next = 82;
                return this.saveSearchData(data, dataDir, appDataDir);

              case 82:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  // Set webpack config to correct dirs
                  _webpackArchive["default"].context = appBuildDir;
                  _webpackArchive["default"].output.path = searchDir;
                  (0, _webpack["default"])(_webpackArchive["default"], /*#__PURE__*/function () {
                    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(err, stats) {
                      var zipPath, zipOut, archive;
                      return _regenerator["default"].wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              if (err || stats.hasErrors()) {
                                console.error("caught error during webpack: ".concat(err));
                                reject(err);
                              } // Zip it up.


                              zipPath = _path["default"].join(archivesDir, "".concat(search.id, ".zip"));
                              zipOut = _fs["default"].createWriteStream(zipPath);
                              archive = (0, _archiver["default"])('zip');
                              archive.pipe(zipOut);
                              archive.directory(searchDir, search.id);
                              archive.on('finish', function () {
                                _logger["default"].info("Archive: zip created, cleaning up.");

                                (0, _rimraf["default"])(appBuildDir, {}, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                                    while (1) {
                                      switch (_context2.prev = _context2.next) {
                                        case 0:
                                          (0, _rimraf["default"])(searchDir, {}, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
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

                                        case 1:
                                        case "end":
                                          return _context2.stop();
                                      }
                                    }
                                  }, _callee2);
                                })));
                              });
                              archive.finalize();

                            case 8:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      }, _callee3);
                    }));

                    return function (_x2, _x3) {
                      return _ref.apply(this, arguments);
                    };
                  }());
                }));

              case 83:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[14, 20], [28, 43, 47, 55], [48,, 50, 54]]);
      }));

      function createArchive(_x) {
        return _createArchive.apply(this, arguments);
      }

      return createArchive;
    }()
  }, {
    key: "saveTweets",
    value: function () {
      var _saveTweets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(search, dataDir) {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(resolve, reject) {
                    var tweetsPath, fh, tweetsData;
                    return _regenerator["default"].wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.prev = 0;
                            tweetsPath = _path["default"].join(dataDir, 'tweets.csv');
                            fh = _fs["default"].createWriteStream(tweetsPath);
                            fh.write("id,screen_name,retweet\r\n");
                            tweetsData = [];
                            _context5.next = 7;
                            return _this2.db.getAllTweets(search, function (tweet) {
                              // CSV
                              var isRetweet = tweet.retweet ? true : false;
                              var row = [tweet.id, tweet.user.screenName, isRetweet];
                              fh.write(row.join(',') + '\r\n'); // JSON

                              tweetsData.push({
                                id: tweet.id,
                                retweet: tweet.retweet
                              });
                            });

                          case 7:
                            fh.end('');
                            fh.on('close', function () {
                              resolve(tweetsData);
                            });
                            _context5.next = 14;
                            break;

                          case 11:
                            _context5.prev = 11;
                            _context5.t0 = _context5["catch"](0);
                            reject(_context5.t0);

                          case 14:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5, null, [[0, 11]]);
                  }));

                  return function (_x6, _x7) {
                    return _ref4.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function saveTweets(_x4, _x5) {
        return _saveTweets.apply(this, arguments);
      }

      return saveTweets;
    }()
  }, {
    key: "saveUrls",
    value: function () {
      var _saveUrls = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(search, dataDir, archiveDataDir) {
        var _this3 = this;

        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(resolve, reject) {
                    var offset, urlsPath, fh, urlsJSONPath, jsonFh, urlsJsPath, jsFh, webpages, s;
                    return _regenerator["default"].wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            _context7.prev = 0;
                            offset = 0; // CSV

                            urlsPath = _path["default"].join(dataDir, 'webpages.csv');
                            fh = _fs["default"].createWriteStream(urlsPath);
                            fh.write('url,title,count\r\n'); // JSON

                            urlsJSONPath = _path["default"].join(dataDir, 'webpages.json');
                            jsonFh = _fs["default"].createWriteStream(urlsJSONPath); // JS

                            urlsJsPath = _path["default"].join(archiveDataDir, 'webpages.js');
                            jsFh = _fs["default"].createWriteStream(urlsJsPath);
                            jsFh.write('/* eslint-disable */\r\nexport default\r\n');
                            webpages = [];

                          case 11:
                            if (!true) {
                              _context7.next = 24;
                              break;
                            }

                            _context7.next = 14;
                            return _this3.db.getWebpages(search, offset);

                          case 14:
                            webpages = _context7.sent;

                            if (!(webpages.length === 0)) {
                              _context7.next = 17;
                              break;
                            }

                            return _context7.abrupt("break", 24);

                          case 17:
                            // CSV
                            s = (0, _sync["default"])(webpages, {
                              columns: ['url', 'title', 'count']
                            });
                            fh.write(s + '\r\n'); // JSON

                            jsonFh.write(JSON.stringify(webpages)); // JS

                            jsFh.write(JSON.stringify(webpages));
                            offset += 100;
                            _context7.next = 11;
                            break;

                          case 24:
                            fh.end('');
                            jsonFh.end('');
                            jsFh.end('');
                            fh.on('close', function () {
                              jsonFh.on('close', function () {
                                jsFh.on('close', function () {
                                  resolve(webpages);
                                });
                              });
                            });
                            _context7.next = 33;
                            break;

                          case 30:
                            _context7.prev = 30;
                            _context7.t0 = _context7["catch"](0);
                            reject(_context7.t0);

                          case 33:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7, null, [[0, 30]]);
                  }));

                  return function (_x11, _x12) {
                    return _ref5.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function saveUrls(_x8, _x9, _x10) {
        return _saveUrls.apply(this, arguments);
      }

      return saveUrls;
    }()
  }, {
    key: "saveSearchData",
    value: function () {
      var _saveSearchData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(data, searchDir, archiveDataDir) {
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt("return", new Promise( /*#__PURE__*/function () {
                  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(resolve, reject) {
                    var searchPath, jsonFh, searchJsPath, jsFh;
                    return _regenerator["default"].wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            try {
                              // JSON
                              searchPath = _path["default"].join(searchDir, 'search.json');
                              jsonFh = _fs["default"].createWriteStream(searchPath);
                              jsonFh.write(JSON.stringify(data)); // JS

                              searchJsPath = _path["default"].join(archiveDataDir, 'data.js');
                              jsFh = _fs["default"].createWriteStream(searchJsPath);
                              jsFh.write('/* eslint-disable */\r\nexport default\r\n');
                              jsFh.write(JSON.stringify(data));
                              jsonFh.end('');
                              jsFh.end('');
                              jsonFh.on('close', function () {
                                jsFh.on('close', function () {
                                  resolve(data);
                                });
                              });
                            } catch (err) {
                              reject(err);
                            }

                          case 1:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee9);
                  }));

                  return function (_x16, _x17) {
                    return _ref6.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }));

      function saveSearchData(_x13, _x14, _x15) {
        return _saveSearchData.apply(this, arguments);
      }

      return saveSearchData;
    }()
  }, {
    key: "close",
    value: function () {
      var _close = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                this.db.close();

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }]);
  return Archive;
}();

exports.Archive = Archive;