"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _express = _interopRequireDefault(require("express"));

var _passport = _interopRequireDefault(require("passport"));

var _passportTwitter = _interopRequireDefault(require("passport-twitter"));

var _email = require("./email");

var _db = require("./db");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var db = new _db.Database();
var app = (0, _express["default"])();

var activateKeys = function activateKeys() {
  db.getSettings().then(function (settings) {
    if (settings && settings.appKey && settings.appSecret) {
      _passport["default"].use(new _passportTwitter["default"].Strategy({
        consumerKey: settings.appKey,
        consumerSecret: settings.appSecret,
        callbackURL: '/auth/twitter/callback',
        proxy: true,
        includeEmail: true,
        passReqToCallback: true
      }, function (req, token, tokenSecret, profile, cb) {
        db.getUserByTwitterUserId(profile.id).then(function (user) {
          if (!user) {
            var newUser = {
              name: profile.displayName,
              description: profile._json.description,
              email: profile.email || '',
              location: profile._json.location,
              twitterUserId: profile.id,
              twitterScreenName: profile.username,
              twitterAvatarUrl: profile.photos[0].value,
              twitterAccessToken: token,
              twitterAccessTokenSecret: tokenSecret
            };
            db.addUser(newUser).then(function (u) {
              (0, _email.sendNewUserEmail)(u);
              return cb(null, u.id);
            });
          } else {
            db.updateUser(_objectSpread(_objectSpread({}, user), {}, {
              twitterScreenName: profile.username,
              twitterAvatarUrl: profile.photos[0].value,
              twitterAccessToken: token,
              twitterAccessTokenSecret: tokenSecret
            }));
            return cb(null, user.id);
          }
        });
      }));
    }
  });
};

activateKeys();

_passport["default"].serializeUser(function (userId, done) {
  done(null, userId);
});

_passport["default"].deserializeUser(function (userId, done) {
  db.getUser(userId).then(function (user) {
    done(null, user);
  })["catch"](function () {
    done(null, false);
  });
});

app.use(_passport["default"].initialize());
app.use(_passport["default"].session());
app.get('/twitter', function (req, res, next) {
  var opts = req.query.dest ? {
    callbackURL: "/auth/twitter/callback?dest=".concat(req.query.dest)
  } : {};

  _passport["default"].authenticate('twitter', opts, function (err) {
    if (err) {
      return res.redirect("/settings/?error=".concat(encodeURIComponent(err.message)));
    }
  })(req, res, next);
});
app.get('/twitter/callback', _passport["default"].authenticate('twitter', {
  failureRedirect: '/'
}), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var user;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return db.getUser(req.user);

          case 2:
            user = _context.sent;

            if (req.query.dest) {
              res.redirect(req.query.dest);
            } else if (user.active && user.termsOfService) {
              res.redirect('/');
            } else {
              res.redirect('/profile/');
            }

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});
app.get('/user', function (req, res) {
  res.json({
    user: req.user
  });
});
module.exports = {
  app: app,
  activateKeys: activateKeys
};