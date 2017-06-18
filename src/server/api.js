import express from 'express'
import { db } from './db'
import { activateKeys } from './auth'

const app = express()

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
  db.hmget('settings', ['appKey', 'appSecret'], (err, resp) => {
    if (! err && resp[0] && resp[1]) {
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
  db.hmget('settings', ['appKey', 'appSecret'], (err, resp) => {
    if (err) {
      res.json({status: 'error', message: err})
    } else {
      res.json({
        appKey: resp[0] || '',
        appSecret: resp[1] || ''
      })
    }
  })
})

app.put('/settings', (req, res) => {
  const appKey = req.body.appKey
  const appSecret = req.body.appSecret
  const cmd = ['settings', 'appKey', appKey, 'appSecret', appSecret]
  db.hmset(cmd, (err, resp) => {
    if (err) {
      res.status(500)
      res.json({status: 'error: ', message: err})
    } else {
      activateKeys()
      res.json({status: 'updated'})
    }
  })
})

app.get('/trends', (req, res) => {
  const place = data.places[Math.floor(Math.random() * data.places.length)]
  const trend = place.trends[Math.floor(Math.random() * place.trends.length)]
  trend.tweets += Math.ceil(Math.random() * 100)
  res.json(data)
})

module.exports = app
