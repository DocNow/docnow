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

var _rimraf = _interopRequireDefault(require("rimraf"));

var _archiver = _interopRequireDefault(require("archiver"));

var _logger = _interopRequireDefault(require("./logger"));

var _db = require("./db");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Archive = /*#__PURE__*/function () {
  function Archive() {
    (0, _classCallCheck2["default"])(this, Archive);
    this.db = new _db.Database();
  }

  (0, _createClass2["default"])(Archive, [{
    key: "createArchive",
    value: function () {
      var _createArchive = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(search) {
        var projectDir, userDataDir, archivesDir, searchDir, appDir, files, _iterator, _step, file, ext, src, dst, user, data, zipPath;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _logger["default"].info("Creating archive for ".concat(search.id)); // set up some file paths that we will use


                projectDir = _path["default"].dirname(_path["default"].dirname(__dirname));
                userDataDir = _path["default"].join(projectDir, 'userData');
                archivesDir = _path["default"].join(userDataDir, 'archives');
                searchDir = _path["default"].join(archivesDir, search.id.toString());
                appDir = _path["default"].join(projectDir, 'dist', 'archive'); // create a directory to write the data an archive app to

                if (!_fs["default"].existsSync(searchDir)) {
                  _fs["default"].mkdirSync(searchDir);
                } // copy the prebuilt archive app to the directory


                files = _fs["default"].readdirSync(appDir);
                _iterator = _createForOfIteratorHelper(files);
                _context.prev = 9;

                _iterator.s();

              case 11:
                if ((_step = _iterator.n()).done) {
                  _context.next = 21;
                  break;
                }

                file = _step.value;
                ext = _path["default"].extname(file).toLowerCase();

                if (!(ext !== '.js' && ext !== '.map' && ext !== '.html' && ext !== '.css')) {
                  _context.next = 16;
                  break;
                }

                return _context.abrupt("continue", 19);

              case 16:
                src = _path["default"].join(appDir, file);
                dst = _path["default"].join(searchDir, file);

                _fs["default"].copyFileSync(src, dst);

              case 19:
                _context.next = 11;
                break;

              case 21:
                _context.next = 26;
                break;

              case 23:
                _context.prev = 23;
                _context.t0 = _context["catch"](9);

                _iterator.e(_context.t0);

              case 26:
                _context.prev = 26;

                _iterator.f();

                return _context.finish(26);

              case 29:
                _context.next = 31;
                return this.db.getUser(search.creator.id);

              case 31:
                user = _context.sent;
                data = {
                  id: search.id,
                  creator: user.name,
                  query: search.queries,
                  startDate: search.created,
                  endDate: search.updated,
                  tweetCount: search.tweetCount,
                  imageCount: search.imageCount,
                  videoCount: search.videoCount,
                  userCount: search.userCount,
                  urlCount: search.urlCount,
                  title: search.title
                };
                _context.next = 35;
                return this.getAllTweetIds(search);

              case 35:
                data.tweets = _context.sent;
                _context.next = 38;
                return this.db.getTwitterUsers(search);

              case 38:
                data.users = _context.sent;
                _context.next = 41;
                return this.db.getImages(search);

              case 41:
                data.images = _context.sent;
                _context.next = 44;
                return this.db.getVideos(search);

              case 44:
                data.videos = _context.sent;
                _context.next = 47;
                return this.db.getHashtags(search);

              case 47:
                data.hashtags = _context.sent;
                _context.next = 50;
                return this.db.getWebpages(search);

              case 50:
                data.webpages = _context.sent;
                _context.next = 53;
                return this.db.getActions(search);

              case 53:
                data.actions = _context.sent;

                _logger["default"].info("saving data to ".concat(searchDir)); // save the gathered data to the archive snapshot


                _context.next = 57;
                return this.saveData(data, searchDir);

              case 57:
                _logger["default"].info("saving ids to ".concat(searchDir)); // write out an addition ids.txt file for the hydrator


                _context.next = 60;
                return this.saveIds(data, searchDir);

              case 60:
                // zip up the directory
                zipPath = _path["default"].join(archivesDir, "".concat(search.id, ".zip"));
                _context.next = 63;
                return this.writeZip(searchDir, zipPath);

              case 63:
                _context.next = 65;
                return this.db.updateSearch(_objectSpread(_objectSpread({}, search), {}, {
                  archived: true,
                  archiveStarted: false
                }));

              case 65:
                return _context.abrupt("return", zipPath);

              case 66:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 23, 26, 29]]);
      }));

      function createArchive(_x) {
        return _createArchive.apply(this, arguments);
      }

      return createArchive;
    }()
  }, {
    key: "getAllTweetIds",
    value: function () {
      var _getAllTweetIds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(search) {
        var tweets, _iterator2, _step2, tweet;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                tweets = [];
                _context2.t0 = _createForOfIteratorHelper;
                _context2.next = 4;
                return this.db.getAllTweets(search);

              case 4:
                _context2.t1 = _context2.sent;
                _iterator2 = (0, _context2.t0)(_context2.t1);

                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    tweet = _step2.value;
                    tweets.push({
                      id: tweet.id,
                      retweet: tweet.retweet ? true : false
                    });
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }

                return _context2.abrupt("return", tweets);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAllTweetIds(_x2) {
        return _getAllTweetIds.apply(this, arguments);
      }

      return getAllTweetIds;
    }()
  }, {
    key: "saveIds",
    value: function saveIds(search, searchDir) {
      var tweetIdPath = _path["default"].join(searchDir, 'ids.txt');

      _logger["default"].info("writing archive ids to ".concat(tweetIdPath));

      return new Promise(function (resolve) {
        var count = 0;

        var fh = _fs["default"].createWriteStream(tweetIdPath);

        var _iterator3 = _createForOfIteratorHelper(search.tweets),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var tweet = _step3.value;
            count += 1;
            fh.write(tweet.id + '\r\n');
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        fh.on('close', function () {
          resolve(count);
        });
        fh.end();
      });
    }
  }, {
    key: "saveData",
    value: function () {
      var _saveData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(data, searchDir) {
        var jsonData, jsData;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                jsonData = JSON.stringify(data);

                _fs["default"].writeFileSync(_path["default"].join(searchDir, 'data.json'), jsonData);

                jsData = "var searchData = ".concat(jsonData, ";");

                _fs["default"].writeFileSync(_path["default"].join(searchDir, 'data.js'), jsData);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function saveData(_x3, _x4) {
        return _saveData.apply(this, arguments);
      }

      return saveData;
    }()
  }, {
    key: "writeZip",
    value: function writeZip(searchDir, zipPath) {
      return new Promise(function (resolve) {
        var zipOut = _fs["default"].createWriteStream(zipPath);

        var archive = (0, _archiver["default"])('zip');
        archive.pipe(zipOut);
        archive.directory(searchDir, _path["default"].basename(searchDir));
        archive.on('finish', function () {
          _logger["default"].info("Archive: zip created, cleaning up.");

          (0, _rimraf["default"])(searchDir, {}, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
            return _regenerator["default"].wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    resolve(zipPath);

                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          })));
        });
        archive.finalize();
      });
    }
  }, {
    key: "close",
    value: function () {
      var _close = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.db.close();

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
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