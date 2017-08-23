import path from 'path'
import winston from 'winston'

const logger = new winston.Logger()
const env = process.env.NODE_ENV

if (env === 'development') {
  logger.add(winston.transports.Console, {level: 'debug'})
} else if (env === 'test') {
  const logFile = path.join(__dirname, '..', '..', 'test.log')
  logger.add(winston.transports.File, {filename: logFile})
} else if (env === 'production') {
  const logFile = path.join(__dirname, '..', '..', 'app.log')
  logger.add(winston.transports.File, {filename: logFile})
}

module.exports = logger
