var path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin')

var DIST_DIR   = path.join(__dirname, 'dist'),  
    CLIENT_DIR = path.join(__dirname, 'src/client')

module.exports = {  
  context: CLIENT_DIR,

  entry: './main',

  output: {
    path:   DIST_DIR,
    filename: 'bundle.js'
  },

  devtool: 'inline-source-map',

  plugins: [
    new webpack.EnvironmentPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      filename: 'index.html'
    })
  ],

  module: {

    rules: [
      {
        test:  /\.jsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: ['eslint-loader']
      },
      {
        test:  /\.jsx?$/,
        exclude: /node_modules/,
        use:  ['babel-loader']
			},
      {
        test:  /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          { 
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]---[local]---[hash:base64:5]'
            }
          }
        ]
      },
      {
        test:  /\.(png|jpg|ttf|eot)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {limit: 10000}
          }
        ]
      }
    ]
  }

}
