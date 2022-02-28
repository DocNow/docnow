"use strict";

var _urlFetcher = require("../server/url-fetcher");

var _videoFetcher = require("../server/video-fetcher");

var urlFetcher = new _urlFetcher.UrlFetcher();
urlFetcher.start();
var videoFetcher = new _videoFetcher.VideoFetcher();
videoFetcher.start();