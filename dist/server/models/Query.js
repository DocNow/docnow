"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var _require = require('objection'),
    Model = _require.Model;

var Search = require('./Search');

var Query = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(Query, _Model);

  var _super = _createSuper(Query);

  function Query() {
    (0, _classCallCheck2["default"])(this, Query);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Query, [{
    key: "searchQuery",
    value: function searchQuery() {
      var queryParts = [];

      var _iterator = _createForOfIteratorHelper(this.value.or),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var term = _step.value;

          if (term.type === 'keyword') {
            queryParts.push(term.value);
          } else if (term.type === 'user') {
            queryParts.push('@' + term.value);
          } else if (term.type === 'phrase') {
            queryParts.push("\"".concat(term.value, "\""));
          } else if (term.type === 'hashtag') {
            queryParts.push(term.value);
          } else {
            queryParts.push(term.value);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return queryParts.join(' OR ');
    }
  }, {
    key: "trackQuery",
    value: function trackQuery() {
      var queryParts = [];

      var _iterator2 = _createForOfIteratorHelper(this.value.or),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var term = _step2.value;

          if (term.type === 'keyword') {
            queryParts.push(term.value);
          } else if (term.type === 'user') {
            queryParts.push('@' + term.value);
          } else if (term.type === 'phrase') {
            queryParts.push(term.value.replace(/,/g, ' '));
          } else if (term.type === 'hashtag') {
            queryParts.push(term.value);
          } else {
            queryParts.push(term.value);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return queryParts.join(',');
    }
  }], [{
    key: "tableName",
    get: function get() {
      return 'query';
    }
  }, {
    key: "relationMappings",
    get: function get() {
      return {
        search: {
          relation: Model.HasOneRelation,
          modelClass: Search,
          join: {
            from: 'query.search_id',
            to: 'search.id'
          }
        }
      };
    }
  }]);
  return Query;
}(Model);

module.exports = Query;