import express from 'express'
import passport from 'passport'
import twitter from 'passport-twitter'
import { db } from './db'

export const app = express()

export const activateKeys = () => {
  db.hgetall('settings', (err, result) => {
    if (err) {
      console.log(err)
    } else if (! result.appKey || !result.appSecret) {
      console.log('Please set up your keys by visiting /settings/')
    } else {
      passport.use(new twitter.Strategy({
          consumerKey: result.appKey,
          consumerSecret: result.appSecret,
          callbackURL: 'http://localhost:3000/auth/twitter/callback'
        }, (token, tokenSecret, profile, cb) => {
          return cb(null, {user: profile})
        }
      ))
    }
  })
}

activateKeys()

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

app.use(passport.initialize())
app.use(passport.session())

app.get('/twitter', passport.authenticate('twitter'))

app.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
  res.redirect('/');
  }
)

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/user', (req, res) => {
  res.json({user: req.user})
})
