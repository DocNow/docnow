import express from 'express'
import multiparty from 'multiparty'
import * as fs from 'fs'
import log from './logger'
import wayback from './wayback'

import { Database } from './db'
import { Archive } from './archive'
import { activateKeys } from './auth'
import { StreamLoaderController } from './stream-loader'

const app = express()

const db = new Database()

const streamLoader = new StreamLoaderController()

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

app.put('/user', async (req, res) => {
  if (req.user) {
    // fold selected new values into the existing user
    const user = await db.getUser(req.user.id)
    const newUser = {
      ...user,
      email: req.body.email,
    }
    await db.updateUser(newUser)
    res.json(newUser)
  }
})

app.put('/user/:userId', async (req, res) => {
  if (req.user && req.user.isSuperUser) {
    const user = await db.getUser(req.params.userId)
    const newUser = {
      ...user,
      ...req.body
    } 
    await db.updateUser(newUser)
    res.json(newUser)
  } else {
    res.status(401).json({error: 'Not Authorized'})
  }
})

app.get('/settings', async (req, res) => {
  const settings = await db.getSettings()
  // if they aren't logged in or the they're not an admin
  // be sure to delete the app key settings!
  if (! req.user || (req.user && ! req.user.isSuperUser)) {
    delete settings.appKey
    delete settings.appSecret
  }
  res.json(settings)
})

app.put('/settings', async (req, res) => {
  // only allow super user to update the settings
  // or when there is no super user yet during initial setup
  const superUser = await db.getSuperUser()
  if (! superUser || (req.user && req.user.isSuperUser)) {
    const settings = {
      logoUrl: req.body.logoUrl,
      instanceTitle: req.body.instanceTitle,
      appKey: req.body.appKey,
      appSecret: req.body.appSecret,
      instanceInfoLink: req.body.instanceInfoLink,
      instanceDescription: req.body.instanceDescription,
      instanceTweetText: req.body.instanceTweetText,
      defaultQuota: parseInt(req.body.defaultQuota, 10) || 50000,
    }
    try {
      await db.addSettings(settings)
      activateKeys()
      res.json({status: 'updated'})
    } catch (err) {
      console.error(err)
      res.json({status: 'error'})
    }
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

app.get('/trends', async (req, res) => {
  let results = null
  if (req.user) {
    results = await db.getUserTrends(req.user)
  } else {
    const user = await db.getSuperUser()
    results = await db.getUserTrends(user)
  }
  res.json(results)
})

app.put('/trends', async (req, res) => {
  if (req.user) {
    let user = await db.getUser(req.user.id)

    // create sparse object of places with the place ids
    const newPlaceIds = req.body
    user.places = newPlaceIds.map(placeId => ({id: placeId}))

    // update the users place ids
    user = await db.updateUser(user)

    // load latest data for these places
    for (const place of user.places) {
      await db.importLatestTrendsForPlace(place, user)
    }

    res.json({status: 'updated'})
  } else {
    res.json({status: 'not logged in'})
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
  // if the user is logged in and they aren't asking for public searches
  if (req.user && ! req.query.public) {
    let userId = req.user.id
    if (req.query.userId && req.user.isSuperUser) {
      userId = req.query.userId
    }
    db.getUserSearches({id: userId}).then(searches => {
      res.json(searches)
    })
  } else {
    // otherwise they just get the public
    db.getPublicSearches().then(searches => {
      res.json(searches)
    })
  }
})

app.post('/searches', (req, res) => {
  if (req.user) {

    const searchInfo = {
      userId: req.user.id,
      title: req.body.query.map(o => o.value).join(' '),
      queries: [{value: {or: req.body.query}}]
    }

    db.createSearch(searchInfo)
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


app.get('/search/:searchId', async (req, res) => {
  if (req.user) {
    const search = await db.getSearch(req.params.searchId)
    const summ = await db.getSearchSummary(search)
    const lastQuery = summ.queries[summ.queries.length - 1]
    summ.query = lastQuery.value.or
    res.json(summ)
  } else {
    const search = await db.getPublicSearch(req.params.searchId)
    if (search) {
      const summ = await db.getSearchSummary(search)
      const lastQuery = summ.queries[summ.queries.length - 1]
      summ.query = lastQuery.value.or
      res.json(summ)
    } else {
      res.status(401).json({error: 'Not Authorized'})
    }
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
          streamLoader.stopStream(search.id)
        } else if (! search.active && newSearch.active) {
          streamLoader.startStream(search.id)
        } else if (! search.archiveStarted && newSearch.archiveStarted) {
          const archive = new Archive()
          archive.createArchive(search)
        }
      })

      res.json(newSearch)
    })
  }
})

app.delete('/search/:searchId', async (req, res) => {
  if (req.user) {
    const search = await db.getSearch(req.body.id)
    const result = await db.deleteSearch(search)
    res.json(result)
  }
})

app.get('/search/:searchId/tweets', (req, res) => {
  let searchReq = null
  if (req.user) {
    searchReq = db.getSearch(req.params.searchId)
  } else {
    searchReq = db.getPublicSearch(req.params.searchId)
    if (!searchReq) {
      return res.status(401).json({error: 'Not Authorized'})
    }
  }
  searchReq.then((search) => {
    if (req.query.url) {
      db.getTweetsForUrl(search, req.query.url)
        .then((tweets) => {
          res.json(tweets)
        })
    } else if (req.query.user) {
      db.getTweetsForUser(search, req.query.user)
        .then((tweets) => {
          res.json(tweets)
        })          
    } else if (req.query.image) {
      db.getTweetsForImage(search, req.query.image)
        .then((tweets) => {
          res.json(tweets)
        })          
    } else if (req.query.video) {
      db.getTweetsForVideo(search, req.query.video)
        .then((tweets) => {
          res.json(tweets)
        })          
    } else if (req.query.ids) {
      db.getTweetsByIds(search, req.query.ids.split(','))
        .then((tweets) => {
          res.json(tweets)
        })          
    } else {
      const includeRetweets = req.query.includeRetweets ? true : false
      const offset = req.query.offset ? req.query.offset : 0
      const limit = req.query.limit ? req.query.limit : 100
      db.getTweets(search, includeRetweets, offset, limit)
        .then((tweets) => {
          res.json(tweets)
        })
    }
  })
})

app.get('/search/:searchId/users', (req, res) => {
  let searchReq = null
  if (req.user) {
    searchReq = db.getSearch(req.params.searchId)
  } else {
    searchReq = db.getPublicSearch(req.params.searchId)
    if (!searchReq) {
      return res.status(401).json({error: 'Not Authorized'})
    }
  }
  searchReq.then((search) => {
    db.getTwitterUsers(search)
      .then((users) => {
        res.json(users)
      })
  })
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

app.get('/stats', async (req, res) => {
  if (req.user) {
    res.json(await db.getSystemStats())
  }
})

app.get('/users', async (req, res) => {
  if (req.user.isSuperUser) {
    res.json(await db.getUsers())
  } else {
    res.status(401).json({error: 'Not Authorized'})
  }
})

app.get('/findme', async (req, res) => {
  if (req.user) {
    const results = await db.getSearchesWithUser(req.user.twitterScreenName)
    res.json(results)
  } else {
    res.status(401).json({error: 'Not Authorized'})
  }
})

module.exports = app
