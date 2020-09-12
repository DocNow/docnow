"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var _require = require('objection'),
    Model = _require.Model;

var User = require('./User');

var Query = require('./Query');

var Search = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(Search, _Model);

  var _super = _createSuper(Search);

  function Search() {
    (0, _classCallCheck2["default"])(this, Search);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Search, null, [{
    key: "tableName",
    get: function get() {
      return 'search';
    }
  }, {
    key: "relationMappings",
    get: function get() {
      return {
        queries: {
          relation: Model.HasManyRelation,
          modelClass: Query,
          join: {
            from: 'search.id',
            to: 'query.search_id'
          }
        },
        creator: {
          relation: Model.HasOneRelation,
          modelClass: User,
          join: {
            from: 'search.user_id',
            to: 'user.id'
          }
        }
      };
    }
  }]);
  return Search;
}(Model);

module.exports = Search;