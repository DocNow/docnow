import path from 'path'
import winston from 'winston'

const logger = new winston.Logger()
const logFile = path.join(__dirname, '..', '..', 'app.log')

logger.add(winston.transports.File, {filename: logFile})

if (process.env.NODE_ENV !== 'production') {
  logger.add(winston.transports.Console, {level: 'debug'})
}

module.exports = logger
