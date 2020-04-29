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

    const appDir = path.join(projectDir, 'src', 'archive')
    const appSrcDir = path.join(appDir, 'app')
    const appBuildDir = path.join(appDir, search.id)
    const appDataDir = path.join(appBuildDir, 'data')
 
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
  
      if (! fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir)
      }
  
      if (! fs.existsSync(appBuildDir)) {
        fs.mkdirSync(appBuildDir)
      }
    } catch (e) {
      console.error(e)
      throw e
    }    

    // copy source of Archive app to unique directory
    const files = fs.readdirSync(appSrcDir)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (ext !== '.js' && ext !== '.html' && ext !== '.css') {
        continue
      }
      const src = path.join(appSrcDir, file)
      const dst = path.join(appBuildDir, file)
      try {
        fs.copyFileSync(src, dst)
      } catch (err) {
        console.error(`unable to copy ${src} to ${dst}: ${err}`)
      }
    }

    // Create data dir in build
    if (! fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir)
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
    await this.saveUrls(search, dataDir, appDataDir)

    log.info(`Archive: saved webpages`)

    // Create search JSON file.
    await this.saveSearchData(data, dataDir, appDataDir)

    return new Promise((resolve, reject) => {
      // Set webpack config to correct dirs
      wConfig.context = appBuildDir
      wConfig.output.path = searchDir
      webpack(wConfig, async (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(`caught error during webpack: ${err}`)
          reject(err)
        }

        // Zip it up.
        const zipPath = path.join(archivesDir, `${search.id}.zip`)
        const zipOut = fs.createWriteStream(zipPath)
        const archive = archiver('zip')
        archive.pipe(zipOut)
        archive.directory(searchDir, search.id)

        archive.on('finish', () => {
          log.info(`Archive: zip created, cleaning up.`)
          rimraf(appBuildDir, {}, async () => {
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
