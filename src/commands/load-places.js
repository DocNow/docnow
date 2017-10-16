require('babel-register')()

const Database = require('../server/db').Database

const db = new Database()

db.loadPlaces()
  .then((places) => {
    for (const place of places) {
      if (place.type == 'Town') {
        console.log(`added ${place.name}, ${place.country}`)
      } else {
        console.log(`added ${place.name}`)
      }
    }
    console.log('loaded ' + places.length + ' places.')
    db.close()
  })
  .catch((err) => {
    console.log('unable to load places: ', err)
  })
