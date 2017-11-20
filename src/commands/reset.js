require('babel-register')()

const Database = require('../server/db').Database

const db = new Database()

db.getSettings()
  .then((settings) => {
    db.clear()
      .then(() => {
        db.setupIndexes()
          .then(() => {
            db.addSettings(settings) 
              .then(() => {db.close()})
              .catch((e) => {console.log(e)})
          })
      })
      .catch((e) => {console.log(e)})
  })
  .catch((e) => {console.log(e)})
