import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

import { commonConfig } from './webpack.common';

// tslint:disable-next-line:no-var-requires
const npmPackage = require('./package.json');

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    app: [
      './src/app.tsx',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.css$/, loaders: [ 'style-loader', 'css-loader' ] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' },
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader' },
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
    ],
  },
  devServer: {
    hot: true,
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

if (config.plugins == null) {
  config.plugins = [];
}

const definePlugin: any = config.plugins[0];

if (definePlugin != null) {
  definePlugin.definitions.DEBUG = true;
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

export default config;
