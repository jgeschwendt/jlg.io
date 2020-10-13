const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const DEV_SERVER = process.argv.find(v => v.includes('serve'));
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
    new CircularDependencyPlugin({ exclude: /.html|node_modules/, failOnError: true }),
    new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/index.html' }),
  ],
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
  },
  target: 'web',
};

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
    break;
}

module.exports = config;
