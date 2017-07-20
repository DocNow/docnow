import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
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

app.put('/user', (req, res) => {
  db.updateUser(req.user.id, req.body)
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

app.get('/world', (req, res) => {
  db.getPlaces().then((result) => {
    res.json(result)
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

app.post('/logo', (req, res) => {
  if (req.user) {
    if (req.user.isSuperUser) {
      const form = new multiparty.Form()

      form.parse(req, (parseErr, fields, files) => {
        const {path} = files.imageFile[0]
        const newPath = './userData/images/logo.png'

        fs.readFile(path, (readErr, data) => {
          if (readErr) {
            console.log(readErr)
          }
          fs.writeFile(newPath, data, (writeErr) => {
            if (writeErr) {
              console.log(writeErr)
            }
            // delete temp image
            fs.unlink(path, () => {
              res.send('File uploaded to: ' + newPath)
            })
          })
        })
      })
    }
  }
})

module.exports = app
