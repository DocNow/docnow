#!/usr/bin/env node

require('babel-register')()

const path = require('path')
const morgan = require('morgan')
const webpack = require('webpack')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const passport = require('passport')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const api = require('./src/server/api')
const auth = require('./src/server/auth')
const log = require('./src/server/logger')
const config = require('./webpack.dev.config.js')

const distDir = path.join(__dirname, 'dist', 'client')
const staticAssets = path.join(__dirname, 'userData')
const htmlFile = path.join(distDir, 'index.html')
const isDevelopment = process.env.NODE_ENV !== 'production'
const defaultPort = 3000
const compiler = webpack(config)

const app = express()

app.set('port', process.env.PORT || defaultPort)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(cookieSession({secret: 'ABCD', resave: true, saveUninitialized: true}))
app.use(passport.initialize())

app.use(passport.session())

app.use(morgan('combined'))

app.use('/api/v1', api)
app.use('/auth', auth.app)
app.use('/userData', express.static(staticAssets))

if (isDevelopment) {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }))
  app.use(webpackHotMiddleware(compiler))
  app.get('*', (req, res) => {
    res.write(compiler.outputFileSystem.readFileSync(htmlFile))
    res.end()
  })
} else {
  app.use(express.static(distDir))
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

// log additional information about unhandled promises so they can be debugged
process.on('unhandledRejection', (reason, p) => {
  log.warn('Unhandled Rejection at:', p, 'reason:', reason)
})

log.info('starting app')
app.listen(app.get('port'))
