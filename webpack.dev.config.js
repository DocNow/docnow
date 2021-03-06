var webpack    = require("webpack"),
    baseConfig = require("./webpack.base.config.js")

baseConfig.devtool = "inline-source-map"
baseConfig.mode = "development"

baseConfig.entry.push("webpack-hot-middleware/client")

baseConfig.plugins = baseConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin()
])

module.exports = baseConfig
