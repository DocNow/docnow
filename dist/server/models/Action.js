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

var Tweet = require('./Tweet');

var User = require('./User');

var Action = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(Action, _Model);

  var _super = _createSuper(Action);

  function Action() {
    (0, _classCallCheck2["default"])(this, Action);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(Action, null, [{
    key: "tableName",
    get: function get() {
      return 'action';
    }
  }, {
    key: "relationMappings",
    get: function get() {
      return {
        tweet: {
          relation: Model.HasOneRelation,
          modelClass: Tweet,
          join: {
            from: 'action.tweetId',
            to: 'tweet.id'
          }
        },
        user: {
          relation: Model.HasOneRelation,
          modelClass: User,
          join: {
            from: 'action.userId',
            to: 'user.id'
          }
        }
      };
    }
  }]);
  return Action;
}(Model);

module.exports = Action;