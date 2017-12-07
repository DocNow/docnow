import express from 'express'
import passport from 'passport'
import twitter from 'passport-twitter'
import { Database } from './db'

const db = new Database()

const app = express()

const activateKeys = () => {
  db.getSettings().then((settings) => {
    if (settings && settings.appKey && settings.appSecret) {
      passport.use(new twitter.Strategy(
        {
          consumerKey: settings.appKey,
          consumerSecret: settings.appSecret,
          callbackURL: '/auth/twitter/callback',
          proxy: true,
          includeEmail: true
        },
        (token, tokenSecret, profile, cb) => {
          db.getUserByTwitterUserId(profile.id).then((user) => {
            if (! user) {
              const newUser = {
                name: profile.displayName,
                twitterUserId: profile.id,
                twitterScreenName: profile.username,
                twitterLocation: profile._json.location,
                twitterAvatarUrl: profile.photos[0].value,
                twitterEmail: profile.email || '',
                twitterAccessToken: token,
                twitterAccessTokenSecret: tokenSecret
              }
              db.addUser(newUser).then((u) => {
                return cb(null, u.id)
              })
            } else {
              return cb(null, user.id)
            }
          })
        }
      ))
    }
  })
}

activateKeys()

passport.serializeUser((userId, done) => {
  done(null, userId)
})

passport.deserializeUser((userId, done) => {
  db.getUser(userId)
    .then((user) => {
      done(null, user)
    })
    .catch(() => {
      done(null, false)
    })
})

app.use(passport.initialize())
app.use(passport.session())

app.get('/twitter', passport.authenticate('twitter'))

app.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/')
  }
)

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/user', (req, res) => {
  res.json({user: req.user})
})

module.exports = {app, activateKeys}
