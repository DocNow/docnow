import express from 'express'
import { Database } from './db'
import { activateKeys } from './auth'

const app = express()
const db = new Database()

const data = {
  'places': [
    {
      name: 'DC',
      trends: [
        {
          text: 'poop',
          tweets: 11
        },
        {
          text: 'Ville',
          tweets: 10
        }
      ]
    },
    {
      name: 'Shit Town',
      trends: [
        {
          text: 'mangas',
          tweets: 11
        },
        {
          text: 'twee',
          tweets: 10
        }
      ]
    }
  ]
}

app.get('/setup', (req, res) => {
  db.getSettings((result) => {
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
  db.getSettings((result) => {
    if (! result) {
      res.json({})
    } else {
      res.json(result)
    }
  })
})

app.put('/settings', (req, res) => {
  const settings = {appKey: req.body.appKey, appSecret: req.body.appSecret}
  db.addSettings(settings, (result) => {
    activateKeys()
    res.json({status: 'updated'})
  })
})

app.get('/trends', (req, res) => {
  const place = data.places[Math.floor(Math.random() * data.places.length)]
  const trend = place.trends[Math.floor(Math.random() * place.trends.length)]
  trend.tweets += Math.ceil(Math.random() * 100)
  res.json(data)
})

module.exports = app
