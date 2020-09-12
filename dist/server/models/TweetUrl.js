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

var TweetUrl = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(TweetUrl, _Model);

  var _super = _createSuper(TweetUrl);

  function TweetUrl() {
    (0, _classCallCheck2["default"])(this, TweetUrl);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(TweetUrl, null, [{
    key: "tableName",
    get: function get() {
      return 'tweetUrl';
    }
  }, {
    key: "idColumn",
    get: function get() {
      return ['tweetId', 'url', 'type'];
    }
  }]);
  return TweetUrl;
}(Model);

module.exports = TweetUrl;