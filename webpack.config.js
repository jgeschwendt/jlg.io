/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const DashboardPlugin = require('webpack-dashboard/plugin');
/* eslint-enable @typescript-eslint/no-var-requires */

const DASHBOARD = process.env.WEBPACK_DASHBOARD;
const DEV_SERVER = process.argv.find(v => v.includes('webpack-dev-server'));
const MODE = process.env.NODE_ENV || 'production';

const config = {
  entry: {
    main: [
      path.resolve(process.cwd(), 'src/index.ts'),
    ],
  },
  externals: [],
  mode: MODE,
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   test: /\.(ts|tsx)$/,
      //   use: [{
      //     loader: require.resolve('eslint-loader'),
      //     options: {
      //       // todo(): remove override when work is done
      //       emitWarning: false, // MODE !== 'production',
      //     },
      //   }],
      // },
      {
        exclude: /node_modules/,
        test: /\.elm$/,
        use: [{
          loader: require.resolve('elm-webpack-loader'),
          options: {
            optimize: MODE === 'production',
          },
        }],
      },
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: [{
          loader: require.resolve('babel-loader'),
        }],
      },
    ],
  },
  optimization: {
    minimizer: [],
    noEmitOnErrors: false,
    // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-2
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'all',
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/',
  },
  plugins: [
    new webpack.DefinePlugin([
      'NODE_ENV',
    ].reduce((obj, key) => ({ ...obj, [`process.env.${key}`]: JSON.stringify(process.env[key]) }), {
      'process.env.PACKAGE_VERSION': JSON.stringify(require('./package.json').version),
    })),
    new CircularDependencyPlugin({ exclude: /node_modules/, failOnError: true }),
    new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/index.html' }),
  ],
  resolve: {
    extensions: ['.wasm', '.mjs', '.elm', '.js', '.json', '.jsx', '.ts', '.tsx'],
    modules: [path.resolve(process.cwd(), 'node_modules'), 'node_modules', 'src'],
  },
  target: 'web',
};

if (DASHBOARD) {
  config.plugins.push(new DashboardPlugin());
}

if (DEV_SERVER) {
  config.devServer = {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    host: process.env.HOST || '0.0.0.0',
    hot: true,
    port: 3000,
    publicPath: '/',
  };
}

switch (MODE) {
  case 'development':
    config.devtool = 'eval-source-map';
    break;

  case 'production':
  default:
    config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    config.optimization.minimizer.push(
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        // https://github.com/mishoo/UglifyJS2#minify-options
        terserOptions: {
          compress: {},
          ie8: false,
          // eslint-disable-next-line
          keep_fnames: false,
          mangle: true,
          nameCache: null,
          output: null,
          parse: {},
          toplevel: false,
          warnings: false,
        },
      }),
    );

    break;
}

module.exports = config;
