"use strict";

var _streamLoader = require("../server/stream-loader");

var _searchLoader = require("../server/search-loader");

var streamLoader = new _streamLoader.StreamLoader();
streamLoader.start();
var searchLoader = new _searchLoader.SearchLoader();
searchLoader.start();