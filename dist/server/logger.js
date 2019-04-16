"use strict";

var _path = _interopRequireDefault(require("path"));

var _winston = _interopRequireDefault(require("winston"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var logger = _winston["default"].createLogger();

var env = process.env.NODE_ENV;

if (env === 'development') {
  logger.add(new _winston["default"].transports.Console({
    level: 'debug'
  }));
} else if (env === 'test') {
  var logFile = _path["default"].join(__dirname, '..', '..', 'test.log');

  logger.add(new _winston["default"].transports.File({
    filename: logFile
  }));
} else if (env === 'production') {
  var _logFile = _path["default"].join(__dirname, '..', '..', 'app.log');

  logger.add(new _winston["default"].transports.File({
    filename: _logFile
  }));
}

module.exports = logger;