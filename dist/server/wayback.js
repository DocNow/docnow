"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _http = _interopRequireDefault(require("http"));

var _moment = _interopRequireDefault(require("moment"));

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _logger = _interopRequireDefault(require("./logger"));

var _redis = require("./redis");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var pool = new _http["default"].Agent({
  keepAlive: true,
  maxSockets: 1
});
var redis = (0, _redis.getRedis)();
/**
 * Save Wayback metadata by URL in Redis.
 * @param {string} The URL that was archived.
 * @param {object} Metadata (url, time) about the Wayback snapshot.
 * @returns {promise}
 */

function save(url, metadata) {
  return redis.setAsync((0, _redis.waybackKey)(url), JSON.stringify(metadata));
}
/**
 * Get saved Wayback metadata by URL from Redis.
 * @param {string}
 * @param {promise} The Wayback snapshot metadata.
 */


function get(_x) {
  return _get.apply(this, arguments);
}
/**
 * Tells Wayback Machine to archive a URL.
 * @param {string} a URL string
 * @returns {object} an object
 */


function _get() {
  _get = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(url) {
    var json;
    return _regenerator["default"].wrap(function _callee$(_context) {
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

            return _context.abrupt("return", JSON.parse(json));

          case 7:
            return _context.abrupt("return", null);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _get.apply(this, arguments);
}

function saveArchive(_x2) {
  return _saveArchive.apply(this, arguments);
}
/**
 * Fetch metadata for archival snapshots at the Internet Archive.
 * @param {string} the URL you want to search for.
 * @returns {array} a list of link objects
 */


function _saveArchive() {
  _saveArchive = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(url) {
    var saveUrl, resp, location, iaUrl, time, metadata;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            saveUrl = "https://web.archive.org/save/" + url;
            _context2.prev = 1;
            _context2.next = 4;
            return _requestPromise["default"].get({
              url: saveUrl,
              resolveWithFullResponse: true
            });

          case 4:
            resp = _context2.sent;
            location = resp.headers.location;
            iaUrl = 'https://wayback.archive.org/' + location;
            time = (0, _moment["default"])(location.split('/')[2] + 'Z', 'YYYYMMDDhhmmssZ').toDate();
            metadata = {
              url: iaUrl,
              time: time
            };
            save(url, metadata);
            return _context2.abrupt("return", metadata);

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](1);

            _logger["default"].warn("got error when fetching ".concat(saveUrl), _context2.t0);

            return _context2.abrupt("return", null);

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 13]]);
  }));
  return _saveArchive.apply(this, arguments);
}

function memento(_x3) {
  return _memento.apply(this, arguments);
}
/**
 * Fetch the closest Wayback snapshot by URL.
 * @param {string} A URL
 * @param {boolean} Set to true to ignore cache and go back to the web.
 * @returns {object} Metadata about the Wayback snapshot.
 */


function _memento() {
  _memento = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(url) {
    var iaUrl, text, lines, links, _iterator, _step, line, match;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            iaUrl = "http://web.archive.org/web/timemap/link/".concat(url);
            _context3.next = 3;
            return _requestPromise["default"].get(iaUrl, {
              pool: pool
            });

          case 3:
            text = _context3.sent;
            lines = text.split('\n');
            links = [];
            _iterator = _createForOfIteratorHelper(lines);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
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
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            return _context3.abrupt("return", links);

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _memento.apply(this, arguments);
}

function closest(_x4) {
  return _closest.apply(this, arguments);
}

function _closest() {
  _closest = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(url) {
    var refresh,
        result,
        today,
        q,
        iaUrl,
        _result,
        snap,
        metadata,
        _args4 = arguments;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            refresh = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : false;

            if (refresh) {
              _context4.next = 7;
              break;
            }

            _context4.next = 4;
            return get(url);

          case 4:
            result = _context4.sent;

            if (!result) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", result);

          case 7:
            today = (0, _moment["default"])().format('YYYYMMDD');
            q = {
              url: url,
              timestamp: today
            };
            iaUrl = 'https://archive.org/wayback/available';
            _context4.prev = 10;
            _context4.next = 13;
            return _requestPromise["default"].get({
              url: iaUrl,
              qs: q,
              pool: pool,
              json: true
            });

          case 13:
            _result = _context4.sent;

            if (_result) {
              _context4.next = 16;
              break;
            }

            return _context4.abrupt("return", null);

          case 16:
            snap = _result.archived_snapshots.closest;

            if (snap) {
              _context4.next = 19;
              break;
            }

            return _context4.abrupt("return", null);

          case 19:
            metadata = {
              url: snap.url,
              time: (0, _moment["default"])(snap.timestamp, 'YYYYMMDDHHmmss').toDate()
            };
            save(url, metadata);
            return _context4.abrupt("return", metadata);

          case 24:
            _context4.prev = 24;
            _context4.t0 = _context4["catch"](10);

            _logger["default"].error("wayback error for: ".concat(url));

            return _context4.abrupt("return", null);

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[10, 24]]);
  }));
  return _closest.apply(this, arguments);
}

function close() {
  return _close.apply(this, arguments);
}

function _close() {
  _close = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return redis.quit();

          case 2:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _close.apply(this, arguments);
}

module.exports = {
  memento: memento,
  closest: closest,
  saveArchive: saveArchive,
  get: get,
  close: close
};