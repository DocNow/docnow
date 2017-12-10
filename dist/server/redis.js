'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waybackKey = exports.deselectedUrlsKey = exports.selectedUrlsKey = exports.tweetsKey = exports.urlsCountKey = exports.queueCountKey = exports.urlsKey = exports.metadataKey = exports.urlKey = undefined;
exports.getRedis = getRedis;

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_redis2.default.RedisClient.prototype);

var env = process.env.NODE_ENV;

function getRedis() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (env === 'production') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1';
    opts.db = 0;
  } else if (env === 'test') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1';
    opts.db = 9;
  } else if (env === 'development') {
    opts.host = opts.host || process.env.REDIS_HOST || '127.0.0.1';
    opts.db = 0;
  }
  _logger2.default.info('connecting to redis: ', opts);
  return _redis2.default.createClient(opts);
}

// Functions to help construct redis keys consistently.

// url to url mappings
var urlKey = exports.urlKey = function urlKey(url) {
  return 'url:' + url;
};

// url metadata
var metadataKey = exports.metadataKey = function metadataKey(url) {
  return 'metadata:' + url;
};

// a search's sorted set of url counts
var urlsKey = exports.urlsKey = function urlsKey(search) {
  return 'urls:' + search.id;
};

// the number of urls yet to be fetched for a search
var queueCountKey = exports.queueCountKey = function queueCountKey(search) {
  return 'queue:' + search.id;
};

// the total number of urls to be checked in a search
var urlsCountKey = exports.urlsCountKey = function urlsCountKey(search) {
  return 'urlscount:' + search.id;
};

// the set of tweet ids that mention a url in a search
var tweetsKey = exports.tweetsKey = function tweetsKey(search, url) {
  return 'tweets:' + url + ':' + search.id;
};

// the selected urls in a search
var selectedUrlsKey = exports.selectedUrlsKey = function selectedUrlsKey(search) {
  return 'urlsselected:' + search.id;
};

// the deselected urls in a search
var deselectedUrlsKey = exports.deselectedUrlsKey = function deselectedUrlsKey(search) {
  return 'urlsdeselected:' + search.id;
};

// metadata for wayback information for a url
var waybackKey = exports.waybackKey = function waybackKey(url) {
  return 'wayback:' + url;
};