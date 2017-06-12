var webpack    = require("webpack"),
    baseConfig = require("./webpack.base.config.js")

baseConfig.devtool = 'inline-source-map'

baseConfig.output.publicPath = "/"

baseConfig.plugins = baseConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin()
])

module.exports = baseConfig
