'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = new _winston2.default.Logger();
var env = process.env.NODE_ENV;

if (env === 'development') {
  logger.add(_winston2.default.transports.Console, { level: 'debug' });
} else if (env === 'test') {
  var logFile = _path2.default.join(__dirname, '..', '..', 'test.log');
  logger.add(_winston2.default.transports.File, { filename: logFile });
} else if (env === 'production') {
  var _logFile = _path2.default.join(__dirname, '..', '..', 'app.log');
  logger.add(_winston2.default.transports.File, { filename: _logFile });
}

module.exports = logger;