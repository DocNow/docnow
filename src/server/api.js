import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import { Database } from './db'
import { activateKeys } from './auth'
import log from './logger'

const app = express()
const db = new Database()
const version = '1'

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

app.get('/world', (req, res) => {
  db.getPlaces().then((result) => {
    res.json(result)
  })
})

app.get('/trends', (req, res) => {
  // when a user isn't logged in they get the super users's trends
  let lookup = null
  if (req.user) {
    lookup = db.getUserTrends(req.user.id)
  } else {
    lookup = db.getSuperUser().then((user) => {
      return db.getUserTrends(user.id)
    })
  }
  lookup.then((result) => { res.json(result) })
})

app.put('/trends', (req, res) => {
  db.setUserPlaces(req.user.id, req.body)
    .then(() => {
      db.importLatestTrendsForUser(req.user.id)
        .then(res.json({status: 'updated'}))
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
    const fakeId = req.body.q + '-fakeId'
    res.json({
      id: fakeId,
      tweets: `/api/v${version}/search/${fakeId}/tweets`,
      users: `/api/v${version}/search/${fakeId}/users`,
      hashtags: `/api/v${version}/search/${fakeId}/hashtags`,
      media: `/api/v${version}/search/${fakeId}/media`
    })
  }
})

app.get('/search/:searchId/tweets', (req, res) => {
  if (req.user) {
    res.json([
      {
        id: '895394443465019393',
        link: 'https://twitter.com/documentnow/status/895394443465019393',
        date: '5:20 PM - 9 Aug 2017',
        handle: 'documentnow',
        screenName: 'DocumentingTheNow',
        text: 'Info about how the dataset was generated can be found at https://github.com/edsu/ferguson-201408 … 14% of the tweets have since been deleted or protected.',
        media: 'https://pbs.twimg.com/media/DG0UfosXUAEckNM.png',
        likes: 0,
        retweets: 1,
        replies: 1
      },
      {
        id: '881265828309590017',
        link: 'https://twitter.com/documentnow/status/881265828309590017',
        date: '5:38 PM - 1 July 2017',
        handle: 'documentnow',
        screenName: 'DocumentingTheNow',
        text: 'This is so awesome & thoughtful by @fakerapper. We\'ve been thinking abt how to add these to tweet datasets in DocNow https://twitter.com/anildash/status/881242678620499970',
        media: 'https://pbs.twimg.com/media/DG0UfosXUAEckNM.png',
        likes: 9,
        retweets: 4,
        replies: 1
      }
    ])
  }
})

app.get('/search/:searchId/users', (req, res) => {
  if (req.user) {
    res.json([
      {
        handle: 'documentnow',
        screenName: 'DocumentingTheNow',
        tweets: 3789,
        followers: 123,
        following: 123,
        matchingTweets: 5
      },
      {
        handle: 'raffazizzi',
        screenName: 'Raff',
        tweets: 1293,
        followers: 56,
        following: 46,
        matchingTweets: 1
      },
    ])
  }
})

module.exports = app
