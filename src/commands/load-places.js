require('babel-register')()

const Database = require('../server/db').Database

const db = new Database()

db.loadPlaces()
  .then((places) => {
    for (const place of places) {
      if (place.type == 'Town') {
        log.info(`added ${place.name}, ${place.country}`)
      } else {
        log.info(`added ${place.name}`)
      }
    }
    log.info('loaded ' + places.length + ' places.')
    db.close()
  })
  .catch((err) => {
    log.error('unable to load places: ', err)
  })
