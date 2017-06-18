#!/usr/bin/env node

require('babel-register')()

const path = require('path')
const webpack = require('webpack')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const api = require('./src/server/api')
const auth = require('./src/server/auth')
const config = require('./webpack.dev.config.js')

const distDir = path.join(__dirname, 'dist')
const htmlFile = path.join(distDir, 'index.html')
const isDevelopment = process.env.NODE_ENV !== 'production'
const defaultPort = 3000
const compiler = webpack(config)

app = express()

app.set('port', process.env.PORT || defaultPort)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(session({secret: 'ABCD', resave: true, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/v1', api)
app.use('/auth', auth.app)

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
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')))
  app.use(express.static(distDir))
}

app.listen(app.get('port'))
