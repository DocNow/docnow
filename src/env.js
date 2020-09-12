import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

let dotenvFile = null
if (process.env.NODE_ENV === 'production') {
  dotenvFile = '.env'
} else if (process.env.NODE_ENV === 'development') {
  dotenvFile = '.env.development'
} else if (process.env.NODE_ENV === 'test') {
  dotenvFile = '.env.test'
}

const dotenvPath = path.join(__dirname, '..', dotenvFile)

if (fs.existsSync(dotenvPath)) {
  console.log(`loading environment from ${dotenvPath}`)
  dotenv.config({path: dotenvPath})
} else {
  console.log(`skipping dotenv load because of missing file: ${dotenvPath}`)
}