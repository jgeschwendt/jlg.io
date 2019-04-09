/* eslint-disable @typescript-eslint/no-var-requires */
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'eval-source-map',
  target: 'web',
  entry: {
    main: [
      path.resolve(process.cwd(), 'src/index.ts')
    ],
  },
  externals: [],
  optimization: {
    // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-2
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'all',
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/
        }
      }
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   test: /\.(ts|tsx)$/,
      //   use: [
      //     { loader: require.resolve('eslint-loader') }
      //   ]
      // },
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: [
          { loader: require.resolve('babel-loader') },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin([
      'NODE_ENV',
      'STAGE'
    ].reduce((obj, key) => ({ ...obj, [`process.env.${key}`]: JSON.stringify(process.env[key]) }), {}), {
      'process.env.PACKAGE_VERSION': require('./package.json').version
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CircularDependencyPlugin({ exclude: /node_modules/, failOnError: true }),
    new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/index.html' })
  ],
  resolve: {
    extensions: [ '.wasm', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx' ],
    modules: [ path.resolve(process.cwd(), 'node_modules'), 'node_modules', 'src' ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    host: process.env.HOST || '0.0.0.0',
    port: 3000,
    publicPath: '/'
  },
};
