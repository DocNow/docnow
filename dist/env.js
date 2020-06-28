"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var dotenvFile = ".env.".concat(process.env.NODE_ENV);

var dotenvPath = _path["default"].join(__dirname, '..', dotenvFile);

if (_fs["default"].existsSync(dotenvPath)) {
  console.log("loading environment from ".concat(dotenvPath));

  _dotenv["default"].config({
    path: dotenvPath
  });
} else {
  console.log("skipping dotenv load because of missing file: ".concat(dotenvPath));
}
