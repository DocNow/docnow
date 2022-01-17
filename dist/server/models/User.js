"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var path = require('path');

var _require = require('objection'),
    Model = _require.Model;

var Place = require('./Place');

var User = /*#__PURE__*/function (_Model) {
  (0, _inherits2["default"])(User, _Model);

  var _super = _createSuper(User);

  function User() {
    (0, _classCallCheck2["default"])(this, User);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(User, [{
    key: "isAdmin",
    value: function isAdmin() {
      return this.admin || this.isSuperUser;
    }
  }], [{
    key: "tableName",
    get: function get() {
      return 'user';
    }
  }, {
    key: "relationMappings",
    get: function get() {
      return {
        places: {
          relation: Model.ManyToManyRelation,
          modelClass: Place,
          join: {
            from: 'user.id',
            through: {
              from: 'user_place.user_id',
              to: 'user_place.place_id',
              extra: ['position']
            },
            to: 'place.id'
          }
        },
        searches: {
          relation: Model.HasManyRelation,
          modelClass: path.join(__dirname, 'Search'),
          join: {
            from: 'user.id',
            to: 'search.user_id'
          }
        }
      };
    }
  }]);
  return User;
}(Model);

module.exports = User;