import express from 'express'

const app = express()

app.get('/user', (req, res) => {
  res.json({})
})

app.get('/trends', (req, res) => {
  res.json({
    'places': [
      {
        name: 'DC',
        trends: [
          {
            text: 'poop',
            tweets: 25
          },
          {
            text: 'Ville',
            tweets: 10
          }
        ]
      },
      {
        name: 'Shit Town',
        trends: [
          {
            text: 'mangas',
            tweets: 25
          },
          {
            text: 'twee',
            tweets: 10
          }
        ]
      }
    ]
  })
})

module.exports = app
