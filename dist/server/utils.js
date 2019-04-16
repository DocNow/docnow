"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addPrefixes = exports.stripPrefix = exports.addPrefix = void 0;
var sep = '-';

var addPrefix = function addPrefix(prefix, id) {
  var idString = String(id);

  if (!idString.match('^' + prefix + sep)) {
    idString = prefix + sep + idString;
  }

  return idString;
};

exports.addPrefix = addPrefix;

var stripPrefix = function stripPrefix(s) {
  var pattern = new RegExp("^.+?".concat(sep));
  return String(s).replace(pattern, '');
};

exports.stripPrefix = stripPrefix;

var addPrefixes = function addPrefixes(ids, prefix) {
  return ids.map(function (id) {
    return addPrefix(prefix, id);
  });
};

exports.addPrefixes = addPrefixes;