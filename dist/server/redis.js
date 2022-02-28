"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchVideoKey = exports.deselectedUrlsKey = void 0;
exports.getRedis = getRedis;
exports.waybackKey = exports.userTweetsCountKey = exports.urlsKey = exports.urlsCountKey = exports.urlKey = exports.tweetsKey = exports.startSearchJobKey = exports.selectedUrlsKey = exports.searchStatsKey = exports.queueCountKey = exports.metadataKey = void 0;

var _redis = _interopRequireDefault(require("redis"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _logger = _interopRequireDefault(require("./logger"));

_bluebird["default"].promisifyAll(_redis["default"].RedisClient.prototype);

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

  _logger["default"].info('connecting to redis: ', opts);

  return _redis["default"].createClient(opts);
} // Functions to help construct redis keys consistently.
// url to url mappings


var urlKey = function urlKey(url) {
  return "url:".concat(url);
}; // url metadata


exports.urlKey = urlKey;

var metadataKey = function metadataKey(url) {
  return "metadata:".concat(url);
}; // a search's sorted set of url counts


exports.metadataKey = metadataKey;

var urlsKey = function urlsKey(search) {
  return "urls:".concat(search.id);
}; // the number of urls yet to be fetched for a search


exports.urlsKey = urlsKey;

var queueCountKey = function queueCountKey(search) {
  return "queue:".concat(search.id);
}; // the total number of urls to be checked in a search


exports.queueCountKey = queueCountKey;

var urlsCountKey = function urlsCountKey(search) {
  return "urlscount:".concat(search.id);
}; // the set of tweet ids that mention a url in a search


exports.urlsCountKey = urlsCountKey;

var tweetsKey = function tweetsKey(search, url) {
  return "tweets:".concat(url, ":").concat(search.id);
}; // the selected urls in a search


exports.tweetsKey = tweetsKey;

var selectedUrlsKey = function selectedUrlsKey(search) {
  return "urlsselected:".concat(search.id);
}; // the deselected urls in a search


exports.selectedUrlsKey = selectedUrlsKey;

var deselectedUrlsKey = function deselectedUrlsKey(search) {
  return "urlsdeselected:".concat(search.id);
}; // metadata for wayback information for a url


exports.deselectedUrlsKey = deselectedUrlsKey;

var waybackKey = function waybackKey(url) {
  return "wayback:".concat(url);
}; // total number of tweets by user


exports.waybackKey = waybackKey;

var userTweetsCountKey = function userTweetsCountKey(user) {
  return "usertweetcount:".concat(user.id);
}; // a json blob of stats for a search


exports.userTweetsCountKey = userTweetsCountKey;

var searchStatsKey = function searchStatsKey(search) {
  return "searchstats:".concat(search.id);
}; // a queue for search jobs to run


exports.searchStatsKey = searchStatsKey;
var startSearchJobKey = "searchjob"; // a queue for video lookups

exports.startSearchJobKey = startSearchJobKey;
var fetchVideoKey = 'videoqueue';
exports.fetchVideoKey = fetchVideoKey;