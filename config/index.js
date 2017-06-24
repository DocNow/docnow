const jsonFile = './' + (process.env.NODE_ENV || 'development') + '.json'

module.exports = require(jsonFile)
