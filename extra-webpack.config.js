const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = {
  entry: "./src/main.ts", // bundle's entry point
  resolve: {
      extensions: ['.js', '.ts']
  },
  output: {
      path: path.resolve(__dirname, 'dist'), // output directory
      clean: true,
      filename: "[name].[contenthash].js", // name of the generated bundle
      asyncChunks: true,
  },
  module: {
    rules: [
        {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node_modules/,
        },
        {
            test: /\.scss$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                    },
                },
                {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true,
                    },
                },
            ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
          loader: 'file-loader?name=assets/[name].[hash].[ext]'
        },
    ]
  },
  plugins : [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(pkg.version),
      'process.env': {
        'ENV': JSON.stringify(ENV)
      }
    }),
    new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject : "body",
        scriptLoading: "blocking"
    }),
    new CompressionPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
  ]
};
