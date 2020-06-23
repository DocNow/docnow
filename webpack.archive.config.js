var path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin')

var DIST_DIR   = path.join(__dirname, 'dist/archive'),
    SRC_DIR = path.join(__dirname, 'src/archive/app')

module.exports = {

  optimization: {
    minimize: true
  },

  context: SRC_DIR,

  entry: ['./index'],

  output: {
    path:   DIST_DIR,
    publicPath: "",
    filename: '[name]-[hash].js'
  },

  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /Insights\/Wayback.js/,
      `${SRC_DIR}/override.js`
    ),
    new webpack.EnvironmentPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
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
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: 'file-loader'
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
        test: /\.scss$/,
        use: [
            "style-loader",
            "css-loader",
            { loader: 'sass-loader', options: { includePaths: ['./node_modules'] } }
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
  },

  devtool: 'cheap-module-source-map',

  mode: 'production',

}
