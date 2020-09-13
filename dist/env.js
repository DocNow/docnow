"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _dotenv = _interopRequireDefault(require("dotenv"));

// look for a .env.test file or else default to .env
if (process.env.NODE_ENV === 'test') {
  var dotenvPath = _path["default"].resolve(process.cwd(), '.env.test');

  if (_fs["default"].existsSync(dotenvPath)) {
    _dotenv["default"].config({
      path: dotenvPath
    });
  }
} else {
  _dotenv["default"].config();
}