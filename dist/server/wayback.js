'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

/**
 * Get saved Wayback metadata by URL from Redis.
 * @param {string}
 * @param {promise} The Wayback snapshot metadata.
 */

var get = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
    var json;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return redis.getAsync((0, _redis.waybackKey)(url));

          case 2:
            json = _context.sent;

            if (!json) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', JSON.parse(json));

          case 7:
            return _context.abrupt('return', null);

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function get(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Tells Wayback Machine to archive a URL.
 * @param {string} a URL string
 * @returns {object} an object
 */

var saveArchive = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(url) {
    var saveUrl, resp, location, iaUrl, time, metadata;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            saveUrl = 'https://web.archive.org/save/' + url;
            _context2.prev = 1;
            _context2.next = 4;
            return _requestPromise2.default.get({ url: saveUrl, resolveWithFullResponse: true });

          case 4:
            resp = _context2.sent;
            location = resp.headers['content-location'];
            iaUrl = 'https://wayback.archive.org/' + location;
            time = (0, _moment2.default)(location.split('/')[2] + 'Z', 'YYYYMMDDhhmmssZ').toDate();
            metadata = { url: iaUrl, time: time };

            save(url, metadata);
            return _context2.abrupt('return', metadata);

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2['catch'](1);

            _logger2.default.warn('got error when fetching ' + saveUrl, _context2.t0.response.statusCode);
            return _context2.abrupt('return', null);

          case 17:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 13]]);
  }));

  return function saveArchive(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Fetch metadata for archival snapshots at the Internet Archive.
 * @param {string} the URL you want to search for.
 * @returns {array} a list of link objects
 */

var memento = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(url) {
    var iaUrl, text, lines, links, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, match;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            iaUrl = 'http://web.archive.org/web/timemap/link/' + url;
            _context3.next = 3;
            return _requestPromise2.default.get(iaUrl, { pool: pool });

          case 3:
            text = _context3.sent;
            lines = text.split('\n');
            links = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 9;

            for (_iterator = (0, _getIterator3.default)(lines); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              line = _step.value;
              match = line.match(/<(.+)>; rel="(.+)"; datetime="(.+)",/);

              if (match) {
                links.push({
                  url: match[1],
                  rel: match[2],
                  time: new Date(match[3])
                });
              }
            }
            _context3.next = 17;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3['catch'](9);
            _didIteratorError = true;
            _iteratorError = _context3.t0;

          case 17:
            _context3.prev = 17;
            _context3.prev = 18;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 20:
            _context3.prev = 20;

            if (!_didIteratorError) {
              _context3.next = 23;
              break;
            }

            throw _iteratorError;

          case 23:
            return _context3.finish(20);

          case 24:
            return _context3.finish(17);

          case 25:
            return _context3.abrupt('return', links);

          case 26:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[9, 13, 17, 25], [18,, 20, 24]]);
  }));

  return function memento(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Fetch the closest Wayback snapshot by URL.
 * @param {string} A URL
 * @param {boolean} Set to true to ignore cache and go back to the web.
 * @returns {object} Metadata about the Wayback snapshot.
 */

var closest = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(url) {
    var refresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var result, today, q, iaUrl, _result, snap, metadata;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (refresh) {
              _context4.next = 6;
              break;
            }

            _context4.next = 3;
            return get(url);

          case 3:
            result = _context4.sent;

            if (!result) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt('return', result);

          case 6:
            today = (0, _moment2.default)().format('YYYYMMDD');
            q = { url: url, timestamp: today };
            iaUrl = 'https://archive.org/wayback/available';
            _context4.prev = 9;
            _context4.next = 12;
            return _requestPromise2.default.get({ url: iaUrl, qs: q, pool: pool, json: true });

          case 12:
            _result = _context4.sent;

            if (_result) {
              _context4.next = 15;
              break;
            }

            return _context4.abrupt('return', null);

          case 15:
            snap = _result.archived_snapshots.closest;

            if (snap) {
              _context4.next = 18;
              break;
            }

            return _context4.abrupt('return', null);

          case 18:
            metadata = {
              url: snap.url,
              time: (0, _moment2.default)(snap.timestamp, 'YYYYMMDDHHmmss').toDate()
            };


            save(url, metadata);
            return _context4.abrupt('return', metadata);

          case 23:
            _context4.prev = 23;
            _context4.t0 = _context4['catch'](9);

            _logger2.default.error('wayback error for: ' + url);
            return _context4.abrupt('return', null);

          case 27:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[9, 23]]);
  }));

  return function closest(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _redis = require('./redis');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pool = new _http2.default.Agent({ keepAlive: true, maxSockets: 1 });
var redis = (0, _redis.getRedis)();

/**
 * Save Wayback metadata by URL in Redis.
 * @param {string} The URL that was archived.
 * @param {object} Metadata (url, time) about the Wayback snapshot.
 * @returns {promise}
 */

function save(url, metadata) {
  return redis.setAsync((0, _redis.waybackKey)(url), (0, _stringify2.default)(metadata));
}

module.exports = { memento: memento, closest: closest, saveArchive: saveArchive, get: get };