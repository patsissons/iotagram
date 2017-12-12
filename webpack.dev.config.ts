import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

import { commonConfig } from './webpack.common';

const devConfig: Partial<webpack.Configuration> = {
  entry: {
    app: [
      'react-hot-loader/patch',
      './src/app.tsx',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: 'eval',
  devServer: {
    hot: true,
  },
};

const config: webpack.Configuration = Object.assign({}, commonConfig, devConfig);

(config.module as webpack.NewModule).rules.splice(-1, 1,
  { test: /\.tsx?$/, loaders: [ 'react-hot-loader/webpack', 'awesome-typescript-loader' ] },
);

if (config.plugins == null) {
  config.plugins = [];
}

const definePlugin: any = config.plugins[0];

if (definePlugin != null) {
  definePlugin.definitions.DEBUG = true;
  definePlugin.definitions.WEBPACK_DEV_SERVER = true;
}

config.plugins.push(
  new webpack.NamedModulesPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    title: 'react-hot-ts',
    chunksSortMode: 'dependency',
    template: path.resolve(__dirname, './src/index.ejs'),
  }),
);

export default config;
