import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import { Database } from './db'
import { activateKeys } from './auth'
import log from './logger'

const app = express()

const db = new Database()

db.startTrendsWatcher({interval: 60 * 1000})

app.get('/setup', (req, res) => {
  db.getSettings()
    .then((result) => {
      if (result && result.appKey && result.appSecret) {
        res.json(true)
      } else {
        res.json(false)
      }
    })
    .catch(() => {
      res.json(false)
    })
})

app.get('/user', (req, res) => {
  if (req.user) {
    db.getUser(req.user.id)
      .then((user) => {res.json(user)})
      .catch(() => {
        res.status(401)
        res.json({message: 'no such user'})
      })
  } else {
    res.status(401)
    res.json({message: 'not logged in'})
  }
})

app.put('/user', (req, res) => {
  db.updateUser(req.body)
    .then(() => {
      res.json({status: 'updated'})
    })
})

app.get('/settings', (req, res) => {
  db.getSettings()
    .then((result) => {
      if (! result) {
        res.json({})
      } else {
        res.json(result)
      }
    })
})

app.put('/settings', (req, res) => {
  const settings = {
    logoUrl: req.body.logoUrl,
    reinstanceTitle: req.body.instanceTitle,
    appKey: req.body.appKey,
    appSecret: req.body.appSecret}
  db.addSettings(settings)
    .then(() => {
      activateKeys()
      res.json({status: 'updated'})
    })
})

app.get('/world', (req, res) => {
  db.getPlaces().then((places) => {
    const world = {}
    for (const place of places) {
      world[place.id] = place
    }
    res.json(world)
  })
})

app.get('/trends', (req, res) => {
  let lookup = null
  if (req.user) {
    lookup = db.getUserTrends(req.user)
  } else {
    lookup = db.getSuperUser().then((user) => {
      return db.getUserTrends(user)
    })
  }
  lookup.then((result) => { res.json(result) })
})

app.put('/trends', (req, res) => {
  db.getUser(req.user.id)
    .then((user) => {
      user.places = req.body
      console.log('xxx', user.places)
      db.updateUser(user)
        .then(() => {
          db.importLatestTrendsForUser(user)
            .then(() => {
              res.json({status: 'updated'})
            })
        })
    })
})

app.post('/logo', (req, res) => {
  if (req.user) {
    if (req.user.isSuperUser) {
      const form = new multiparty.Form()

      form.parse(req, (parseErr, fields, files) => {
        const {path} = files.imageFile[0]
        const newPath = './userData/images/logo.png'

        fs.readFile(path, (readErr, data) => {
          if (readErr) {
            log.error(readErr)
          } else {
            fs.writeFile(newPath, data, (writeErr) => {
              if (writeErr) {
                log.error(writeErr)
              } else {
                fs.unlink(path, () => {
                  res.send('File uploaded to: ' + newPath)
                })
              }
            })
          }
        })
      })
    }
  }
})

app.post('/searches', (req, res) => {
  if (req.user) {
    db.createSearch(req.user, req.body.q)
      .then((search) => {
        db.importFromSearch(search)
        res.redirect(303, `/api/v1/search/${search.id}`)
      })
      .catch((e) => {
        const msg = 'unable to createSearch: ' + e
        console.log(msg)
        res.error(msg)
      })
  }
})

app.get('/search/:searchId/tweets', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getTweets(search)
          .then((tweets) => {
            res.json(tweets)
          })
      })
  }
})

app.get('/search/:searchId', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId).then((search) => {
      db.getSearchSummary(search).then((summ) => {
        res.json(summ)
      })
    })
  }
})

app.put('/search/:searchId', (req, res) => {
  if (req.user) {
    db.getSearch(req.body.id).then((search) => {
      db.importFromSearch(search)
        .then(() => {
          res.json(search)
        })
        .catch((e) => {
          console.log(e)
          res.json(search)
        })
    })
  }
})

app.get('/search/:searchId/users', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getTwitterUsers(search)
          .then((users) => {
            res.json(users)
          })
      })
  }
})

app.get('/search/:searchId/hashtags', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getHashtags(search)
          .then((hashtags) => {
            res.json(hashtags)
          })
      })
  }
})

module.exports = app
