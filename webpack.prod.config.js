var webpack = require('webpack')
var baseConfig = require('./webpack.base.config.js')

baseConfig.devtool = 'cheap-module-source-map'
baseConfig.mode = 'production'

baseConfig.plugins = baseConfig.plugins.concat([  
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  //new webpack.optimize.UglifyJsPlugin({sourcemap: true})
])

module.exports = baseConfig
