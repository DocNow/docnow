import fs from 'fs'
import path from 'path'
import csv from 'csv-stringify/lib/sync'
import rimraf from 'rimraf'
import archiver from 'archiver'
import webpack from 'webpack'
import wConfig from '../../webpack.archive.config'
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
    const dataDir = path.join(searchDir, 'data')
    const tmpDir = path.join(projectDir, 'userData', 'archives', 'tmp')
 
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

    if (! fs.existsSync(searchDir)) {
      fs.mkdirSync(searchDir)
    }

    if (! fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir)
    }

    // Clean up tmp build dir in case it's still there
    await this.cleanUp(tmpDir)

    // create data folder in Archive client
    const archiveDataDir = path.join(projectDir, 'src', 'client', 'components', 'Archive', 'data')
    if (! fs.existsSync(archiveDataDir)) {
      fs.mkdirSync(archiveDataDir)
    }

    // get tweets
    // Create both a CSV file and get the list back
    const tweetsData = await this.saveTweets(search, dataDir)
    data.tweets = tweetsData

    // get users
    const users = await this.db.getTwitterUsers(search)
    data.users = users
    // get images
    const images = await this.db.getImages(search)
    data.images = images
    // get videos
    const videos = await this.db.getVideos(search)
    data.videos = videos
    // get hashtags
    const hashtags = await this.db.getHashtags(search)
    data.hashtags = hashtags

    log.info(`Archive: obtained search data.`)

    // get webpages
    // Create both a CSV and a JSON file.
    await this.saveUrls(search, dataDir, archiveDataDir)

    log.info(`Archive: saved webpages`)

    // Create search JSON file.
    await this.saveSearchData(data, dataDir, archiveDataDir)

    return new Promise((resolve, reject) => {
      webpack(wConfig, async (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err)
        }

        // Move from tmp and clean up
        await this.moveAndCleanUp(tmpDir, searchDir)

        log.info(`Archive: moved files before zip and cleaned up tmp`)

        // Zip it up.
        const zipPath = path.join(archivesDir, `${search.id}.zip`)
        const zipOut = fs.createWriteStream(zipPath)
        const archive = archiver('zip')
        archive.pipe(zipOut)
        archive.directory(searchDir, search.id)

        archive.on('finish', () => {
          log.info(`Archive: zip created, cleaning up.`)
          rimraf(archiveDataDir, {}, async () => {
            rimraf(searchDir, {}, async () => {
              await this.db.updateSearch({
                ...search,
                archived: true,
                archiveStarted: false
              })
              resolve(zipPath)
            })
          })        
        })

        archive.finalize()
      })

    })
  }

  async moveAndCleanUp(tmpDir, searchDir) {
    await fs.readdir(tmpDir, async (err, files) => {
      if (err) {
        throw err
      }
      // These files are not getting moved (renamed). Perhaps the ZIP file gets created before they're moved
      // Check promises + async/awaits
      // Trying to copy them instead of moving them since everything gets cleaned up (but these could be big files)
      for (const file of files) {        
        fs.copyFile(path.join(tmpDir, file), path.join(searchDir, file), (e) => {
          if (e) {
            throw e
          }
        })        
      }
    })
    await this.cleanUp(tmpDir)
  }

  async cleanUp(d) {
    rimraf(d, {}, (err) => {
      if (err) {
        throw err
      }
    })
  }

  async saveTweets(search, dataDir) {
    return new Promise(async (resolve, reject) => {
      try {
        const tweetsPath = path.join(dataDir, 'tweets.csv')
        const fh = fs.createWriteStream(tweetsPath)
        fh.write("id,screen_name,retweet\r\n")
        const tweetsData = []
        await this.db.getAllTweets(search, (tweet) => {
          // CSV
          const isRetweet = tweet.retweet ? true : false
          const row = [tweet.id, tweet.user.screenName, isRetweet]
          fh.write(row.join(',') + '\r\n')
          // JSON
          tweetsData.push({
            id: tweet.id,
            retweet: tweet.retweet
          })
        })

        fh.end('')
        fh.on('close', () => {resolve(tweetsData)})
      } catch (err) {
        reject(err)
      }
    })
  }

  async saveUrls(search, dataDir, archiveDataDir) {
    return new Promise(async (resolve, reject) => {
      try {
        let offset = 0
        // CSV
        const urlsPath = path.join(dataDir, 'webpages.csv')
        const fh = fs.createWriteStream(urlsPath)
        fh.write('url,title,count\r\n')

        // JSON
        const urlsJSONPath = path.join(dataDir, 'webpages.json')
        const jsonFh = fs.createWriteStream(urlsJSONPath)

        // JS
        const urlsJsPath = path.join(archiveDataDir, 'webpages.js')
        const jsFh = fs.createWriteStream(urlsJsPath)
        jsFh.write('/* eslint-disable */\r\nexport default\r\n')

        let webpages = []
        while (true) {
          webpages = await this.db.getWebpages(search, offset)
          if (webpages.length === 0) {
            break
          }
          // CSV
          const s = csv(webpages, {columns: ['url', 'title', 'count']})
          fh.write(s + '\r\n')
          // JSON
          jsonFh.write(JSON.stringify(webpages))
          // JS
          jsFh.write(JSON.stringify(webpages))
          offset += 100
        }
        fh.end('')
        jsonFh.end('')
        jsFh.end('')
        fh.on('close', () => {
          jsonFh.on('close', () => {
            jsFh.on('close', () => {
              resolve(webpages)
            })
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async saveSearchData(data, searchDir, archiveDataDir) {
    return new Promise(async (resolve, reject) => {
      try {
        // JSON
        const searchPath = path.join(searchDir, 'search.json')
        const jsonFh = fs.createWriteStream(searchPath)
        jsonFh.write(JSON.stringify(data))
      
        // JS
        const searchJsPath = path.join(archiveDataDir, 'data.js')
        const jsFh = fs.createWriteStream(searchJsPath)
        jsFh.write('/* eslint-disable */\r\nexport default\r\n')
        jsFh.write(JSON.stringify(data))
  
        jsonFh.end('')
        jsFh.end('')
        jsonFh.on('close', () => {
          jsFh.on('close', () => {
            resolve(data)
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async close() {
    this.db.close()
  }
}
