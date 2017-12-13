import * as path from 'path';
import * as webpack from 'webpack';
import * as FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

// tslint:disable-next-line:no-var-requires
const npmPackage = require('./package.json');

export const commonConfig: Partial<webpack.Configuration> = {
  devtool: 'source-map',
  externals: {
    // just ignore attempts to use fs
    fs: 'var null',
    child_process: 'var null',
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
  plugins: [
    // eslint-disable-next-line id-match
    new webpack.DefinePlugin({
      DEBUG: false,
      PRODUCTION: false,
      TEST: false,
      WEBPACK_DEV_SERVER: false,
      VERSION: JSON.stringify(npmPackage.version),
    }),
    new webpack.NamedModulesPlugin(),
    new FaviconsWebpackPlugin('./src/assets/logo.png'),
    new HtmlWebpackPlugin({
      title: 'iotagram',
      chunksSortMode: 'dependency',
      template: path.resolve(__dirname, './src/index.ejs'),
    }),
  ],
  resolve: {
    extensions: [ '.ts', '.tsx', '.webpack.js', '.web.js', '.js' ],
  },
};
