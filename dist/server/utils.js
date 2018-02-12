'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var sep = '-';

var addPrefix = exports.addPrefix = function addPrefix(prefix, id) {
  var idString = String(id);
  if (!idString.match('^' + prefix + sep)) {
    idString = prefix + sep + idString;
  }
  return idString;
};

var stripPrefix = exports.stripPrefix = function stripPrefix(s) {
  var pattern = new RegExp('^.+?' + sep);
  return String(s).replace(pattern, '');
};

var addPrefixes = exports.addPrefixes = function addPrefixes(ids, prefix) {
  return ids.map(function (id) {
    return addPrefix(prefix, id);
  });
};