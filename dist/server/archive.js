"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Archive = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _sync = _interopRequireDefault(require("csv-stringify/lib/sync"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _archiver = _interopRequireDefault(require("archiver"));

var _db = require("./db");

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

        var projectDir, userDataDir, archivesDir, searchDir;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                projectDir = _path["default"].dirname(_path["default"].dirname(__dirname));
                userDataDir = _path["default"].join(projectDir, 'userData');
                archivesDir = _path["default"].join(userDataDir, 'archives');
                searchDir = _path["default"].join(archivesDir, search.id);

                if (!_fs["default"].existsSync(searchDir)) {
                  _fs["default"].mkdirSync(searchDir);
                }

                _context2.next = 7;
                return this.saveTweetIds(search, searchDir);

              case 7:
                _context2.next = 9;
                return this.saveUrls(search, searchDir);

              case 9:
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
                              return _this.db.updateSearch((0, _objectSpread2["default"])({}, search, {
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

              case 10:
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
    key: "saveTweetIds",
    value: function () {
      var _saveTweetIds = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4(search, searchDir) {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref2 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee3(resolve) {
                    var idsPath, fh;
                    return _regenerator["default"].wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            idsPath = _path["default"].join(searchDir, 'ids.csv');
                            fh = _fs["default"].createWriteStream(idsPath);
                            _context3.next = 4;
                            return _this2.db.getAllTweets(search, function (tweet) {
                              fh.write(tweet.id + '\r\n');
                            });

                          case 4:
                            fh.end('');
                            fh.on('close', function () {
                              resolve(idsPath);
                            });

                          case 6:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));

                  return function (_x4) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function saveTweetIds(_x2, _x3) {
        return _saveTweetIds.apply(this, arguments);
      }

      return saveTweetIds;
    }()
  }, {
    key: "saveUrls",
    value: function () {
      var _saveUrls = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee6(search, searchDir) {
        var _this3 = this;

        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref3 = (0, _asyncToGenerator2["default"])(
                  /*#__PURE__*/
                  _regenerator["default"].mark(function _callee5(resolve) {
                    var urlsPath, fh, offset, webpages, s;
                    return _regenerator["default"].wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            urlsPath = _path["default"].join(searchDir, 'urls.csv');
                            fh = _fs["default"].createWriteStream(urlsPath);
                            offset = 0;
                            fh.write('url,title,count\r\n');

                          case 4:
                            if (!true) {
                              _context5.next = 15;
                              break;
                            }

                            _context5.next = 7;
                            return _this3.db.getWebpages(search, offset);

                          case 7:
                            webpages = _context5.sent;

                            if (!(webpages.length === 0)) {
                              _context5.next = 10;
                              break;
                            }

                            return _context5.abrupt("break", 15);

                          case 10:
                            s = (0, _sync["default"])(webpages, {
                              columns: ['url', 'title', 'count']
                            });
                            fh.write(s + '\r\n');
                            offset += 100;
                            _context5.next = 4;
                            break;

                          case 15:
                            fh.end('');
                            fh.on('close', function () {
                              resolve(urlsPath);
                            });

                          case 17:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  }));

                  return function (_x7) {
                    return _ref3.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
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