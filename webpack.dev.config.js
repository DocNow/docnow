const webpack = require('webpack');
const path = require('path');
var BundleTracker = require('webpack-bundle-tracker');

const options = {
  devtool: 'inline-source-map',

  entry: {
    home: './docnow/assets/home.js',
    header: './docnow/assets/header.js'
  },

  output: {
    //path: path.resolve('./assets/bundles/'),
    filename: "[name]-[hash].js",
    publicPath: 'http://0.0.0.0:3000/assets/bundles/', // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },

  devtool: 'cheap-module-eval-source-map',

  devServer: {
    host: "0.0.0.0",
    port: 3000,
    quiet: true,
    hot: true,
    inline: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },

  resolve: {
    modules: ['node_modules', 'vendor'],
    extensions: ['.js', '.json', '.css']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader'
          }
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['babel-preset-es2015', {modules: false}],
                ['babel-preset-react']
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      { 
        test: /\.(png|jpg|svg)$/,
        use: [
          {
            loader: "file-loader?name=images/[name].[ext]"
          }
        ]
      }
    ]
  },

  plugins: [
    new BundleTracker({filename: './docnow/webpack-stats.json'}),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    })
  ]
};

module.exports = options;
