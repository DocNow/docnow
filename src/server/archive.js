import fs from 'fs'
import path from 'path'
import csv from 'csv-stringify/lib/sync'
import rimraf from 'rimraf'
import archiver from 'archiver'
// import Builder from 'tweet-archive'

import { Database } from './db'

export class Archive {

  constructor() {
    this.db = new Database()
  }

  async createArchive(search) {
    const user = await this.db.getUser(search.creator)
    const projectDir = path.dirname(path.dirname(__dirname))
    const userDataDir = path.join(projectDir, 'userData')
    const archivesDir = path.join(userDataDir, 'archives')
    const searchDir = path.join(archivesDir, search.id)
 
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

    // get tweets
    // Create both a CSV file and get the list back
    const tweetsData = await this.saveTweets(search, searchDir)
    data.tweets = tweetsData
    // console.log(data.tweets)
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
    // get webpages
    // Create both a CSV and a JSON file.
    await this.saveUrls(search, searchDir)

    // Create search JSON file.
    await this.saveSearchData(data, searchDir)

    return new Promise((resolve) => {
      const zipPath = path.join(archivesDir, `${search.id}.zip`)
      const zipOut = fs.createWriteStream(zipPath)
      const archive = archiver('zip')
      archive.pipe(zipOut)
      archive.directory(searchDir, search.id)

      archive.on('finish', () => {
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

  async saveTweets(search, searchDir) {
    return new Promise(async (resolve, reject) => {
      try {
        const tweetsPath = path.join(searchDir, 'tweets.csv')
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

  async saveUrls(search, searchDir) {
    return new Promise(async (resolve, reject) => {
      try {
        let offset = 0
        // CSV
        const urlsPath = path.join(searchDir, 'urls.csv')
        const fh = fs.createWriteStream(urlsPath)
        fh.write('url,title,count\r\n')

        // JSON
        const urlsJSONPath = path.join(searchDir, 'webpages.json')
        const jsonFh = fs.createWriteStream(urlsJSONPath)

        // JS
        const urlsJsPath = path.join(searchDir, 'webpages.js')
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

  async saveSearchData(data, searchDir) {
    return new Promise(async (resolve, reject) => {
      try {
        // JSON
        const searchPath = path.join(searchDir, 'search.json')
        const jsonFh = fs.createWriteStream(searchPath)
        jsonFh.write(JSON.stringify(data))
      
        // JS
        const searchJsPath = path.join(searchDir, 'data.js')
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
