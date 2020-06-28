import fs from 'fs'
import { Database } from '../src/server/db'
import { ok } from 'assert'
import { Archive } from '../src/server/archive'

describe('archive', () => {

  const db = new Database()
  const archive = new Archive()

  let testSearch = null
  let testUser = null

  it('should setup', async () => {
    await db.clear()
    await db.setupIndexes()

    await db.addSettings({
      appKey: process.env.CONSUMER_KEY,
      appSecret: process.env.CONSUMER_SECRET
    })

    testUser = await db.addUser({
      name: "Ed Summers",
      location: "Silver Spring, MD",
      twitterScreenName: "edsu",
      twitterUserId: "1234",
      twitterAccessToken: process.env.ACCESS_TOKEN,
      twitterAccessTokenSecret: process.env.ACCESS_TOKEN_SECRET
    })


    testSearch = await db.createSearch(testUser, [
      {type: 'keyword', value: 'obama'}
    ])

    await db.importFromSearch(testSearch, 200)
  })

  it('should create archive', async () => {
    const zipFile = await archive.createArchive(testSearch)
    ok(fs.existsSync(zipFile), 'zip file exists')
  })

  it('should be flagged as archived', async () => {
    const search = await db.getSearch(testSearch.id)
    ok(search.archived, 'archived')
    ok(! search.archiveStarted, 'archive started not set')
  })

  it('should close things', async () => {
    // or else this test will never finish
    await db.close()
    await archive.close()
  })

})
