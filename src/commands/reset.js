require('babel-register')()

const Database = require('../server/db').Database

const db = new Database()

db.clear()
  .then(() => {
    db.close()
  })
  .catch((err) => {
    console.log(err)
  })
