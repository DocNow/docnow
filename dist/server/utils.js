"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timer = void 0;

var timer = function timer(ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};

exports.timer = timer;