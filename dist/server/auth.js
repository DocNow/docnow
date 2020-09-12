"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _passport = _interopRequireDefault(require("passport"));

var _passportTwitter = _interopRequireDefault(require("passport-twitter"));

var _db = require("./db");

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
        includeEmail: true
      }, function (token, tokenSecret, profile, cb) {
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
              return cb(null, u.id);
            });
          } else {
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
app.get('/twitter', _passport["default"].authenticate('twitter'));
app.get('/twitter/callback', _passport["default"].authenticate('twitter', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect('/');
});
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