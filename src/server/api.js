import express from 'express'
import { Database } from './db'
import { activateKeys } from './auth'

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
})

app.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(401)
    res.json({message: 'not logged in'})
  }
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
  const settings = {appKey: req.body.appKey, appSecret: req.body.appSecret}
  db.addSettings(settings)
    .then(() => {
      activateKeys()
      res.json({status: 'updated'})
    })
})

app.get('/places', (req, res) => {
  db.getUserPlaces(req.user.id)
    .then((places) => {
      res.json(places)
    })
})


app.put('/places', (req, res) => {
  db.setUserPlaces(req.user.id, req.body)
    .then(() => {
      db.importLatestTrendsForUser(req.user.id)
        .then(res.json({status: 'updated'}))
    })
})

app.get('/trends', (req, res) => {
  if (req.user) {
    db.getUserTrends(req.user.id)
      .then((result) => {
        res.json(result)
      })
  } else {
    res.json([])
  }
})

module.exports = app
