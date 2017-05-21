var webpack    = require("webpack"),
    baseConfig = require("./webpack.base.config.js")

baseConfig.entry = ["webpack-hot-middleware/client", "./main"]

baseConfig.output.publicPath = "/"

baseConfig.plugins = baseConfig.plugins.concat([  
  new webpack.HotModuleReplacementPlugin()
])

module.exports = baseConfig
