import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

const dotenvFile = `.env.${process.env.NODE_ENV}`
const dotenvPath = path.join(__dirname, '..', dotenvFile)

if (fs.existsSync(dotenvPath)) {
  console.log(`loading environment from ${dotenvPath}`)
  dotenv.config({path: dotenvPath})
} else {
  console.log(`skipping dotenv load because of missing file: ${dotenvPath}`)
}