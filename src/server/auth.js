import express from 'express'
import passport from 'passport'
import twitter from 'passport-twitter'
import { sendNewUserEmail } from './email'
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
          includeEmail: true,
          passReqToCallback: true
        },
        (req, token, tokenSecret, profile, cb) => {
          db.getUserByTwitterUserId(profile.id).then((user) => {
            if (! user) {
              const newUser = {
                name: profile.displayName,
                description: profile._json.description,
                email: profile.email || '',
                location: profile._json.location,
                twitterUserId: profile.id,
                twitterScreenName: profile.username,
                twitterAvatarUrl: profile.photos[0].value,
                twitterAccessToken: token,
                twitterAccessTokenSecret: tokenSecret
              }
              db.addUser(newUser).then((u) => {
                sendNewUserEmail(u)
                return cb(null, u.id)
              })
            } else {
              db.updateUser({
                ...user, 
                twitterScreenName: profile.username,
                twitterAvatarUrl: profile.photos[0].value,
                twitterAccessToken: token,
                twitterAccessTokenSecret: tokenSecret
              })
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

app.get('/twitter', (req, res, next) => {
  const opts = req.query.dest
    ? {callbackURL: `/auth/twitter/callback?dest=${req.query.dest}`}
    : {}
  passport.authenticate('twitter',  opts, err => {
    if (err) { 
      return res.redirect(`/settings/?error=${encodeURIComponent(err.message)}`)
    }
  })(req, res, next)
})

app.get('/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/'}),
  async (req, res) => {
    const user = await db.getUser(req.user)
    if (req.query.dest) {
      res.redirect(req.query.dest)
    } else if (user.active && user.termsOfService) {
      res.redirect('/')
    } else {
      res.redirect('/profile/')
    }
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
