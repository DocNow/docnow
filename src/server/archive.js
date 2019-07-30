import fs from 'fs'
import path from 'path'
import csv from 'csv-stringify/lib/sync'
import rimraf from 'rimraf'
import archiver from 'archiver'
import Builder from 'tweet-archive'

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

    if (! fs.existsSync(searchDir)) {
      fs.mkdirSync(searchDir)
    }

    const tweetsPath = await this.saveTweets(search, searchDir)
    await this.saveUrls(search, searchDir)
    const builder = new Builder()
    const metadata = {
      title: search.title,
      creator: user.name,
      startDate: search.created,
      endDate: search.updated,
      searchQuery: search.query.map(q => q.value).join(' ')
    }
    await builder.build(tweetsPath, metadata, searchDir)

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

  async close() {
    this.db.close()
  }

  async saveTweets(search, searchDir) {
    return new Promise(async (resolve) => {
      const tweetsPath = path.join(searchDir, 'tweets.csv')
      const fh = fs.createWriteStream(tweetsPath)
      fh.write("id,screen_name,retweet\r\n")

      await this.db.getAllTweets(search, (tweet) => {
        const isRetweet = tweet.retweet ? true : false
        const row = [tweet.id, tweet.user.screenName, isRetweet]
        fh.write(row.join(',') + '\r\n')
      })

      fh.end('')
      fh.on('close', () => {resolve(tweetsPath)})
    })
  }

  async saveUrls(search, searchDir) {
    return new Promise(async (resolve) => {
      const urlsPath = path.join(searchDir, 'urls.csv')
      const fh = fs.createWriteStream(urlsPath)
      let offset = 0
      fh.write('url,title,count\r\n')

      while (true) {
        const webpages = await this.db.getWebpages(search, offset)
        if (webpages.length === 0) {
          break
        }
        const s = csv(webpages, {columns: ['url', 'title', 'count']})
        fh.write(s + '\r\n')
        offset += 100
      }
      fh.end('')
      fh.on('close', () => {resolve(urlsPath)})
    })
  }

}
