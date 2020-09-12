#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = _interopRequireDefault(require("path"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _morgan = _interopRequireDefault(require("morgan"));

var _webpack = _interopRequireDefault(require("webpack"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _cookieSession = _interopRequireDefault(require("cookie-session"));

var _passport = _interopRequireDefault(require("passport"));

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _webpackHotMiddleware = _interopRequireDefault(require("webpack-hot-middleware"));

var _api = _interopRequireDefault(require("../server/api"));

var _auth = _interopRequireDefault(require("../server/auth"));

var _logger = _interopRequireDefault(require("../server/logger"));

var _webpackDevConfig = _interopRequireDefault(require("../../webpack.dev.config.js"));

var _urlFetcher = require("../server/url-fetcher");

var _streamLoader = require("../server/stream-loader");

var projectDir = _path["default"].join(__dirname, '..', '..');

var clientDir = _path["default"].join(projectDir, 'dist', 'client');

var staticAssets = _path["default"].join(projectDir, 'userData');

var htmlFile = _path["default"].join(clientDir, 'index.html');

var isDevelopment = process.env.NODE_ENV !== 'production';
var defaultPort = 3000;
var compiler = (0, _webpack["default"])(_webpackDevConfig["default"]);
var app = (0, _express["default"])();
app.set('port', process.env.PORT || defaultPort);
app.use((0, _cookieParser["default"])());
app.use(_bodyParser["default"].json());
app.use((0, _cookieSession["default"])({
  secret: process.env.COOKIE_SECRET || 'F5478D6D-0896-4A00-92F4-C3E121DC4CC4',
  resave: true,
  saveUninitialized: true
}));
app.use(_passport["default"].initialize());
app.use(_passport["default"].session());
app.use((0, _morgan["default"])('combined'));
app.use('/api/v1', _api["default"]);
app.use('/auth', _auth["default"].app);
app.use('/userData', _express["default"]["static"](staticAssets));

if (isDevelopment) {
  app.use((0, _webpackDevMiddleware["default"])(compiler, {
    publicPath: _webpackDevConfig["default"].output.publicPath
  }));
  app.use((0, _webpackHotMiddleware["default"])(compiler));
  app.get('*', function (req, res) {
    res.write(compiler.outputFileSystem.readFileSync(htmlFile));
    res.end();
  }); // log additional information about unhandled promises so they can be debugged

  process.on('unhandledRejection', function (event) {
    console.warn(event);

    _logger["default"].warn("Unhandled promise rejection: ".concat(event));
  });
} else {
  app.use(_express["default"]["static"](clientDir));
  app.get('*', function (req, res) {
    return res.sendFile(_path["default"].join(clientDir, 'index.html'));
  });
} // As a convenience embed a UrlFetcher and StreamLoader in development mode.
// This would not be a good idea to do in production as a it could
// really bog down the web server process if lots of data collection is
// going on.


if (isDevelopment) {
  var urlFetcher = new _urlFetcher.UrlFetcher();
  urlFetcher.start();
  var streamLoader = new _streamLoader.StreamLoader();
  streamLoader.start();
}

_logger["default"].info('starting app');

app.listen(app.get('port'));