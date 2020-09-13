import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// look for a .env.test file or else default to .env

if (process.env.NODE_ENV === 'test') {
  const dotenvPath = path.resolve(process.cwd(), '.env.test')
  if (fs.existsSync(dotenvPath)) {
    dotenv.config({path: dotenvPath})
  }
} else {
  dotenv.config()
}
