import path from 'path'
import winston from 'winston'

const env = process.env.NODE_ENV

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
})

if (env === 'development') {
  logger.add(new winston.transports.Console({level: 'debug'}))
} else if (env === 'test') {
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '..', '..', 'test.log'),
  }))
} else {
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '..', '..', 'app.log')
  }))
}

module.exports = logger
