import express from 'express'

const app = express()

const data = {
  'places': [
    {
      name: 'DC',
      trends: [
        {
          text: 'poop',
          tweets: 11
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
          tweets: 11
        },
        {
          text: 'twee',
          tweets: 10
        }
      ]
    }
  ]
}

app.get('/user', (req, res) => {
  res.json({})
})

app.get('/trends', (req, res) => {
  const place = data.places[Math.floor(Math.random() * data.places.length)]
  const trend = place.trends[Math.floor(Math.random() * place.trends.length)]
  trend.tweets += Math.ceil(Math.random() * 100)
  res.json(data)
})

module.exports = app
