const { knexSnakeCaseMappers } = require('objection');

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  pool: {
    min: 0,
    max: 10
  },
  migrations: {
    directory: './src/server/migrations'
  },
  ...knexSnakeCaseMappers()
}
