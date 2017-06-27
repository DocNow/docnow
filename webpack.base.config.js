var path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin')

var DIST_DIR   = path.join(__dirname, 'dist'),
    CLIENT_DIR = path.join(__dirname, 'src/client')

module.exports = {
  context: CLIENT_DIR,

  entry: ['./index'],

  output: {
    path:   DIST_DIR,
    filename: 'bundle.js'
  },

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
        exclude: /node_modules/,
        use:  ['babel-loader', 'eslint-loader']
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
  },

  resolve: {
    modules: ['node_modules', 'vendor'],
    extensions: ['.js', '.json', '.css']
  }

}
