import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import log from './logger'
import wayback from './wayback'

import { Database } from './db'
import { activateKeys } from './auth'
import { StreamLoaderController } from './stream-loader'

const app = express()

const db = new Database()

const streamLoader = new StreamLoaderController()

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
      .then((user) => {
        delete user.twitterAccessToken
        delete user.twitterAccessTokenSecret
        res.json(user)
      })
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

app.get('/settings', async (req, res) => {
  const settings = await db.getSettings()
  if (! settings) {
    res.json({})
  } else {
    if (! req.user.isSuperUser) {
      delete settings.appKey
      delete settings.appSecret
    }
    res.json(settings)
  }
})

app.put('/settings', async (req, res) => {
  // only allow super user to update the settings
  // or when there is no super user yet during initial setup
  const superUser = await db.getSuperUser()
  if (! superUser || (req.user && req.user.isSuperUser)) {
    const settings = {
      logoUrl: req.body.logoUrl,
      reinstanceTitle: req.body.instanceTitle,
      appKey: req.body.appKey,
      appSecret: req.body.appSecret}
    await db.addSettings(settings)
    activateKeys()
    res.json({status: 'updated'})
  }
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
    db.getSearch(req.body.id).then((search) => {
      const newSearch = {...search, ...req.body}

      db.updateSearch(newSearch).then(() => {
        if (req.query.refreshTweets) {
          db.importFromSearch(search)
        } else if (search.active && ! newSearch.active) {
          console.log('turning off search')
          streamLoader.stopStream(search.id)
        } else if (! search.active && newSearch.active) {
          console.log('turning on search')
          streamLoader.startStream(search.id)
        }
      })

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
          const includeRetweets = req.query.includeRetweets ? true : false
          db.getTweets(search, includeRetweets)
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

app.get('/wayback/:url', async (req, res) => {
  if (req.user) {
    const result = await wayback.closest(req.params.url)
    res.json(result)
  }
})

app.put('/wayback/:url', async (req, res) => {
  if (req.user) {
    const result = await wayback.saveArchive(req.params.url)
    res.json(result)
  }
})

module.exports = app
