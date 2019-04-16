"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = _interopRequireDefault(require("path"));

var _winston = _interopRequireDefault(require("winston"));

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