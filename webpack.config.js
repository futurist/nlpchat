var path = require('path')
var webpack = require('webpack')

var loaders = [
  {test: /script\/.*\.js$/, loader: 'babel', query: {presets: ['es2015'], cacheDirectory: true}},
  {test: /\.styl$/, loader: 'css!stylus'},
  {test: /\.css$/, loader: 'css'},
  {test: /\.html$/, loader: 'file?name=[name].[ext]'},
]

loaders.forEach(v => {
  v.exclude = /node_modules/
})

var plugins = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    },
  }),
]

module.exports = {
  entry: {
    tree: './script/tree.js',
  },
  output: {
    path: __dirname,
    filename: './dist/[name].js'
  },
  module: {
    loaders: loaders
  },
  // plugins: plugins
}

