const dotenv = require('dotenv')
dotenv.load()

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  migrations: {
    directory: './src/server/migrations'
  }
}