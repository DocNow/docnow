#!/usr/bin/env node
'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _api = require('../server/api');

var _api2 = _interopRequireDefault(_api);

var _auth = require('../server/auth');

var _auth2 = _interopRequireDefault(_auth);

var _logger = require('../server/logger');

var _logger2 = _interopRequireDefault(_logger);

var _webpackDevConfig = require('../../webpack.dev.config.js');

var _webpackDevConfig2 = _interopRequireDefault(_webpackDevConfig);

var _urlFetcher = require('../server/url-fetcher');

var _streamLoader = require('../server/stream-loader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectDir = _path2.default.join(__dirname, '..', '..');
var clientDir = _path2.default.join(projectDir, 'dist', 'client');
var staticAssets = _path2.default.join(projectDir, 'userData');
var htmlFile = _path2.default.join(clientDir, 'index.html');
var isDevelopment = process.env.NODE_ENV !== 'production';
var defaultPort = 3000;
var compiler = (0, _webpack2.default)(_webpackDevConfig2.default);

var app = (0, _express2.default)();

app.set('port', process.env.PORT || defaultPort);

app.use((0, _cookieParser2.default)());
app.use(_bodyParser2.default.json());
app.use((0, _cookieSession2.default)({
  secret: process.env.COOKIE_SECRET || 'F5478D6D-0896-4A00-92F4-C3E121DC4CC4',
  resave: true,
  saveUninitialized: true
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());
app.use((0, _morgan2.default)('combined'));

app.use('/api/v1', _api2.default);
app.use('/auth', _auth2.default.app);
app.use('/userData', _express2.default.static(staticAssets));

if (isDevelopment) {
  app.use((0, _webpackDevMiddleware2.default)(compiler, {
    publicPath: _webpackDevConfig2.default.output.publicPath
  }));
  app.use((0, _webpackHotMiddleware2.default)(compiler));
  app.get('*', function (req, res) {
    res.write(compiler.outputFileSystem.readFileSync(htmlFile));
    res.end();
  });

  // log additional information about unhandled promises so they can be debugged
  process.on('unhandledRejection', function (reason, p) {
    _logger2.default.warn('Unhandled Rejection at:', p, 'reason:', reason);
  });
} else {
  app.use(_express2.default.static(clientDir));
  app.get('*', function (req, res) {
    return res.sendFile(_path2.default.join(clientDir, 'index.html'));
  });
}

// As a convenience embed a UrlFetcher and StreamLoader in development mode.
// This would not be a good idea to do in production as a it could
// really bog down the web server process if lots of data collection is
// going on.

if (isDevelopment) {
  var urlFetcher = new _urlFetcher.UrlFetcher();
  urlFetcher.start();

  var streamLoader = new _streamLoader.StreamLoader();
  streamLoader.start();
}

_logger2.default.info('starting app');
app.listen(app.get('port'));