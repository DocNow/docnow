"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var _require = require('objection'),
    Model = _require.Model;

var SearchJob = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(SearchJob, _Model);

  var _super = _createSuper(SearchJob);

  function SearchJob() {
    (0, _classCallCheck2["default"])(this, SearchJob);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(SearchJob, null, [{
    key: "tableName",
    get: function get() {
      return 'searchJob';
    }
  }, {
    key: "relationMappings",
    get: function get() {
      var Query = require('./Query');

      return {
        query: {
          relation: Model.HasOneRelation,
          modelClass: Query,
          join: {
            from: 'searchJob.queryId',
            to: 'query.id'
          }
        }
      };
    }
  }]);
  return SearchJob;
}(Model);

module.exports = SearchJob;