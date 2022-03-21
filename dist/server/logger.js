"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = _interopRequireDefault(require("path"));

var _winston = _interopRequireDefault(require("winston"));

var env = process.env.NODE_ENV;

var logger = _winston["default"].createLogger({
  format: _winston["default"].format.combine(_winston["default"].format.timestamp(), _winston["default"].format.json())
});

if (env === 'development') {
  logger.add(new _winston["default"].transports.Console({
    level: 'debug'
  }));
} else if (env === 'test') {
  logger.add(new _winston["default"].transports.File({
    filename: _path["default"].join(__dirname, '..', '..', 'test.log')
  }));
} else {
  logger.add(new _winston["default"].transports.File({
    filename: _path["default"].join(__dirname, '..', '..', 'app.log')
  }));
}

module.exports = logger;