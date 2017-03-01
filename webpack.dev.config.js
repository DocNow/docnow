const webpack = require('webpack');
const path = require('path');
var BundleTracker = require('webpack-bundle-tracker');

const options = {
  debug: true,

  devtool: 'inline-source-map',

  entry: [
    './assets/js/index.js'
  ],
  output: {
    //path: path.resolve('./assets/bundles/'),
    filename: "[name]-[hash].js",
    publicPath: 'http://0.0.0.0:3000/assets/bundles/', // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    colors: true,
    quiet: true,
    hot: true,
    inline: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  resolve: {
    modulesDirectories: ['node_modules', 'vendor'],
    extensions: ['', '.js', '.json', '.css']
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: ['src'],
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: ['babel-preset-es2015', 'babel-preset-react']
        }
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: "file-loader?name=images/[name].[ext]"
      }
    ]
  },
  eslint: {
    configFile: path.join(__dirname, 'eslint.js'),
    useEslintrc: false
  },
  plugins: [
    new BundleTracker({filename: './webpack-stats.json'}),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    })
  ]
};

module.exports = options;
