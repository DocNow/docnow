'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Archive = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sync = require('csv-stringify/lib/sync');

var _sync2 = _interopRequireDefault(_sync);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _archiver = require('archiver');

var _archiver2 = _interopRequireDefault(_archiver);

var _db = require('./db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Archive = exports.Archive = function () {
  function Archive() {
    (0, _classCallCheck3.default)(this, Archive);

    this.db = new _db.Database();
  }

  (0, _createClass3.default)(Archive, [{
    key: 'createArchive',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(search) {
        var _this = this;

        var projectDir, userDataDir, archivesDir, searchDir;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                projectDir = _path2.default.dirname(_path2.default.dirname(__dirname));
                userDataDir = _path2.default.join(projectDir, 'userData');
                archivesDir = _path2.default.join(userDataDir, 'archives');
                searchDir = _path2.default.join(archivesDir, search.id);


                if (!_fs2.default.existsSync(searchDir)) {
                  _fs2.default.mkdirSync(searchDir);
                }

                _context2.next = 7;
                return this.saveTweetIds(search, searchDir);

              case 7:
                _context2.next = 9;
                return this.saveUrls(search, searchDir);

              case 9:
                return _context2.abrupt('return', new _promise2.default(function (resolve) {
                  var zipPath = _path2.default.join(archivesDir, search.id + '.zip');
                  var zipOut = _fs2.default.createWriteStream(zipPath);
                  var archive = (0, _archiver2.default)('zip');
                  archive.pipe(zipOut);
                  archive.directory(searchDir, search.id);

                  archive.on('finish', function () {
                    (0, _rimraf2.default)(searchDir, {}, (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                      return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return _this.db.updateSearch((0, _extends3.default)({}, search, {
                                archived: true,
                                archiveStarted: false
                              }));

                            case 2:
                              resolve(zipPath);

                            case 3:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, _this);
                    })));
                  });

                  archive.finalize();
                }));

              case 10:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createArchive(_x) {
        return _ref.apply(this, arguments);
      }

      return createArchive;
    }()
  }, {
    key: 'saveTweetIds',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(search, searchDir) {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt('return', new _promise2.default(function () {
                  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(resolve) {
                    var idsPath, fh;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            idsPath = _path2.default.join(searchDir, 'ids.csv');
                            fh = _fs2.default.createWriteStream(idsPath);
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
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x4) {
                    return _ref4.apply(this, arguments);
                  };
                }()));

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function saveTweetIds(_x2, _x3) {
        return _ref3.apply(this, arguments);
      }

      return saveTweetIds;
    }()
  }, {
    key: 'saveUrls',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(search, searchDir) {
        var _this3 = this;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt('return', new _promise2.default(function () {
                  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(resolve) {
                    var urlsPath, fh, offset, webpages, s;
                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            urlsPath = _path2.default.join(searchDir, 'urls.csv');
                            fh = _fs2.default.createWriteStream(urlsPath);
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

                            return _context5.abrupt('break', 15);

                          case 10:
                            s = (0, _sync2.default)(webpages, { columns: ['url', 'title', 'count'] });

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
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this3);
                  }));

                  return function (_x7) {
                    return _ref6.apply(this, arguments);
                  };
                }()));

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function saveUrls(_x5, _x6) {
        return _ref5.apply(this, arguments);
      }

      return saveUrls;
    }()
  }]);
  return Archive;
}();