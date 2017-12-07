#!/usr/bin/env node

require('babel-register')()

import path from 'path'
import morgan from 'morgan'
import webpack from 'webpack'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import passport from 'passport'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import api from '../server/api'
import auth from '../server/auth'
import log from '../server/logger'
import config from '../../webpack.dev.config.js'
import { UrlFetcher } from '../server/url-fetcher'

const projectDir = path.join(__dirname, '..', '..')
const clientDir = path.join(projectDir, 'dist', 'client')
const staticAssets = path.join(projectDir, 'userData')
const htmlFile = path.join(clientDir, 'index.html')
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
  app.use(express.static(clientDir))
  app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')))
}

// log additional information about unhandled promises so they can be debugged
process.on('unhandledRejection', (reason, p) => {
  log.warn('Unhandled Rejection at:', p, 'reason:', reason)
})

// maybe it's a bad idea to have the server fetching urls
// by default, but it doesn't seem problematic to have one
// worker running by default, more can be started up if needed

const urlFetcher = new UrlFetcher()
urlFetcher.start()

log.info('starting app')
app.listen(app.get('port'))
