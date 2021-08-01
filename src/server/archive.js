import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import archiver from 'archiver'
import log from './logger'

import { Database } from './db'

export class Archive {

  constructor() {
    this.db = new Database()
  }

  async createArchive(search) {
    log.info(`Creating archive for ${search.id}`)

    // set up some file paths that we will use
    const projectDir = path.dirname(path.dirname(__dirname))
    const userDataDir = path.join(projectDir, 'userData')
    const archivesDir = path.join(userDataDir, 'archives')
    const searchDir = path.join(archivesDir, search.id.toString())
    const appDir = path.join(projectDir, 'dist', 'archive')

    // create a directory to write the data an archive app to
    if (! fs.existsSync(searchDir)) {
      fs.mkdirSync(searchDir)
    }

    // copy the prebuilt archive app to the directory
    const files = fs.readdirSync(appDir)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (ext !== '.js' && ext !== '.map' && ext !== '.html' && ext !== '.css') {
        continue
      }
      const src = path.join(appDir, file)
      const dst = path.join(searchDir, file)
      fs.copyFileSync(src, dst)
    }

    // gather the data to be serialized
    const user = await this.db.getUser(search.creator.id)
    const data = {
      id: search.id,
      creator: user.name,
      query: search.queries,
      startDate: search.created,
      endDate: search.updated,
      tweetCount: search.tweetCount,
      imageCount: search.imageCount,
      videoCount: search.videoCount,
      userCount: search.userCount,
      urlCount: search.urlCount,
      title: search.title
    }

    data.tweets = await this.getAllTweetIds(search)
    data.users = await this.db.getTwitterUsers(search)
    data.images = await this.db.getImages(search)
    data.videos = await this.db.getVideos(search)
    data.hashtags = await this.db.getHashtags(search)
    data.webpages = await this.db.getWebpages(search)
    data.actions = await this.db.getActions(search)
    log.info(`saving data to ${searchDir}`)

    // save the gathered data to the archive snapshot
    await this.saveData(data, searchDir)

    log.info(`saving ids to ${searchDir}`)
    // write out an addition ids.txt file for the hydrator
    await this.saveIds(data, searchDir)

    // zip up the directory
    const zipPath = path.join(archivesDir, `${search.id}.zip`)
    await this.writeZip(searchDir, zipPath)

    // flag the archive as finished so it can be downloaded!
    await this.db.updateSearch({
      ...search,
      archived: true,
      archiveStarted: false
    })

    return zipPath
  }

  async getAllTweetIds(search) {
    const tweets = []
    for (const tweet of await this.db.getAllTweets(search)) {
      tweets.push({
        id: tweet.id,
        retweet: tweet.retweet ? true : false
      })
    }
    
    return tweets
  }

  saveIds(search, searchDir) {
    const tweetIdPath = path.join(searchDir, 'ids.txt')
    log.info(`writing archive ids to ${tweetIdPath}`)
    return new Promise((resolve) => {
      let count = 0
      const fh = fs.createWriteStream(tweetIdPath)
      for (const tweet of search.tweets) {
        count += 1
        fh.write(tweet.id + '\r\n')
      }
      fh.on('close', () => {
        resolve(count)
      })
      fh.end()
    })
  }

  async saveData(data, searchDir) {
    return new Promise(async (resolve, reject) => {
      try {

        // Write a JSON representation of the data
        const jsonPath = path.join(searchDir, 'data.json')
        const jsonFh = fs.createWriteStream(jsonPath)
        jsonFh.write(JSON.stringify(data, null, 2))
        jsonFh.end('')
      
        // Write a JS representation of the data
        const jsPath = path.join(searchDir, 'data.js')
        const jsFh = fs.createWriteStream(jsPath)
        jsFh.write('var searchData = ')
        jsFh.write(JSON.stringify(data))
        jsFh.end('')

        jsonFh.on('close', () => {
          jsFh.on('close', () => {
            resolve(data)
          })
        })
      } catch (err) {
        console.log(err)
        reject(`unable to write archive: ${err}`)
      }
    })
  }

  writeZip(searchDir, zipPath) {
    return new Promise((resolve) => {
      const zipOut = fs.createWriteStream(zipPath)
      const archive = archiver('zip')
      archive.pipe(zipOut)
      archive.directory(searchDir, path.basename(searchDir))
      archive.on('finish', () => {
        log.info(`Archive: zip created, cleaning up.`)
        rimraf(searchDir, {}, async () => {
          resolve(zipPath)
        })
      })
      archive.finalize()
    })
  }

  async close() {
    this.db.close()
  }
}
