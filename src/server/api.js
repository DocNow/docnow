import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import log from './logger'

import { Database } from './db'
import { activateKeys } from './auth'

const app = express()

const db = new Database()

db.setupIndexes()
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

app.get('/searches', (req, res) => {
  if (req.user) {
    db.getUserSearches(req.user).then((searches) => {
      res.json(searches)
    })
  }
})

app.post('/searches', (req, res) => {
  if (req.user) {
    db.createSearch(req.user, req.body.query)
      .then((search) => {
        db.importFromSearch(search)
        res.redirect(303, `/api/v1/search/${search.id}`)
      })
      .catch((e) => {
        const msg = 'unable to createSearch: ' + e
        log.error(msg)
        res.error(msg)
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
    let newSearch = req.body
    db.getSearch(newSearch.id).then((search) => {
      newSearch = {...search, ...newSearch}
      db.updateSearch(newSearch)
      if (req.query.refreshTweets) {
        db.importFromSearch(search)
      }
      res.json(newSearch)
    })
  }
})

app.get('/search/:searchId/tweets', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        if (req.query.url) {
          db.getTweetsForUrl(search, req.query.url)
            .then((tweets) => {
              res.json(tweets)
            })
        } else {
          db.getTweets(search)
            .then((tweets) => {
              res.json(tweets)
            })
        }
      })
  }
})

app.put('/search/:searchId', (req, res) => {
  if (req.user) {
    db.getSearch(req.body.id).then( async (search) => {
      await db.updateSearch(search)
      if (req.query.refreshTweets) {
        db.importFromSearch(search)
          .then(() => {
            res.json(search)
          })
          .catch((e) => {
            log.error('search failed', e)
            res.json(search)
          })
      } else {
        res.json(search)
      }
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

app.get('/search/:searchId/urls', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getUrls(search)
          .then((urls) => {
            res.json(urls)
          })
      })
  }
})

app.get('/search/:searchId/images', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getImages(search)
          .then((images) => {
            res.json(images)
          })
      })
  }
})

app.get('/search/:searchId/videos', (req, res) => {
  if (req.user) {
    db.getSearch(req.params.searchId)
      .then((search) => {
        db.getVideos(search)
          .then((videos) => {
            res.json(videos)
          })
      })
  }
})

app.get('/search/:searchId/webpages', async (req, res) => {
  if (req.user) {
    const search = await db.getSearch(req.params.searchId)
    const webpages = await db.getWebpages(search)
    res.json(webpages)
  }
})

app.put('/search/:searchId/webpages', async (req, res) => {
  if (req.user) {
    const search = await db.getSearch(req.params.searchId)
    const url = req.body.url

    if (req.body.selected === true) {
      await db.selectWebpage(search, url)
    } else if (req.body.deselected === true) {
      await db.deselectWebpage(search, url)
    }
    res.json({status: 'updated'})
  }
})

app.get('/search/:searchId/queue', async (req, res) => {
  if (req.user) {
    const search = await db.getSearch(req.params.searchId)
    const result = await db.queueStats(search)
    res.json(result)
  }
})

module.exports = app
