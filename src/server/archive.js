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

    const user = await this.db.getUser(search.creator)
    const projectDir = path.dirname(path.dirname(__dirname))
    const userDataDir = path.join(projectDir, 'userData')
    const archivesDir = path.join(userDataDir, 'archives')
    const searchDir = path.join(archivesDir, search.id)
    const appDir = path.join(projectDir, 'dist', 'archive')
 
    const data = {
      id: search.id,
      creator: user.name,
      query: search.query,
      startDate: search.created,
      endDate: search.updated,
      tweetCount: search.tweetCount,
      imageCount: search.imageCount,
      videoCount: search.videoCount,
      userCount: search.userCount,
      urlCount: search.urlCount,
      title: search.title
    }

    try {
      if (! fs.existsSync(searchDir)) {
        fs.mkdirSync(searchDir)
      }
    } catch (e) {
      console.error(e)
      throw e
    }

    // copy pre-compiled Archive app to unique directory
    const files = fs.readdirSync(appDir)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (ext !== '.js' && ext !== '.map' && ext !== '.html' && ext !== '.css') {
        continue
      }
      const src = path.join(appDir, file)
      const dst = path.join(searchDir, file)
      try {
        fs.copyFileSync(src, dst)
      } catch (err) {
        console.error(`unable to copy ${src} to ${dst}: ${err}`)
      }
    }

    data.tweets = await this.getAllTweetIds(search)
    data.users = await this.db.getTwitterUsers(search)
    data.images = await this.db.getImages(search)
    data.videos = await this.db.getVideos(search)
    data.hashtags = await this.db.getHashtags(search)
    data.webpages = await this.db.getWebpages(search)
    await this.saveData(data, searchDir)

    return new Promise((resolve) => {
      // Zip it up.
      const zipPath = path.join(archivesDir, `${search.id}.zip`)
      const zipOut = fs.createWriteStream(zipPath)
      const archive = archiver('zip')
      archive.pipe(zipOut)
      archive.directory(searchDir, search.id)

      archive.on('finish', () => {
        log.info(`Archive: zip created, cleaning up.`)
        rimraf(searchDir, {}, async () => {
          await this.db.updateSearch({
            ...search,
            archived: true,
            archiveStarted: false
          })
          resolve(zipPath)
        })
      })
      archive.finalize()
    })
  }

  async getAllTweetIds(search) {
    const tweets = []
    await this.db.getAllTweets(search, (tweet) => {
      tweets.push({
        id: tweet.id,
        retweet: tweet.retweet
      })
    })
    return tweets
  }

  async saveData(data, searchDir) {
    return new Promise(async (resolve, reject) => {
      try {

        // Write a JSON representation of the data
        const jsonPath = path.join(searchDir, 'data.json')
        const jsonFh = fs.createWriteStream(jsonPath)
        jsonFh.write(JSON.stringify(data))
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
        reject(`unable to write archive: ${err}`)
      }
    })
  }

  async close() {
    this.db.close()
  }
}
