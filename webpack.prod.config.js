var baseConfig = require('./webpack.base.config.js');

baseConfig.devtool = 'cheap-module-source-map';

module.exports = baseConfig;
