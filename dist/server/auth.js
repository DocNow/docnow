'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportTwitter = require('passport-twitter');

var _passportTwitter2 = _interopRequireDefault(_passportTwitter);

var _db = require('./db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = new _db.Database();

var app = (0, _express2.default)();

var activateKeys = function activateKeys() {
  db.getSettings().then(function (settings) {
    if (settings && settings.appKey && settings.appSecret) {
      _passport2.default.use(new _passportTwitter2.default.Strategy({
        consumerKey: settings.appKey,
        consumerSecret: settings.appSecret,
        callbackURL: '/auth/twitter/callback',
        proxy: true,
        includeEmail: true
      }, function (token, tokenSecret, profile, cb) {
        db.getUserByTwitterUserId(profile.id).then(function (user) {
          console.log((0, _stringify2.default)(profile, null, 2));
          if (!user) {
            var newUser = {
              name: profile.displayName,
              description: profile._json.description,
              twitterUserId: profile.id,
              twitterScreenName: profile.username,
              twitterLocation: profile._json.location,
              twitterAvatarUrl: profile.photos[0].value,
              twitterEmail: profile.email || '',
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

_passport2.default.serializeUser(function (userId, done) {
  done(null, userId);
});

_passport2.default.deserializeUser(function (userId, done) {
  db.getUser(userId).then(function (user) {
    done(null, user);
  }).catch(function () {
    done(null, false);
  });
});

app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

app.get('/twitter', _passport2.default.authenticate('twitter'));

app.get('/twitter/callback', _passport2.default.authenticate('twitter', { failureRedirect: '/login' }), function (req, res) {
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/user', function (req, res) {
  res.json({ user: req.user });
});

module.exports = { app: app, activateKeys: activateKeys };