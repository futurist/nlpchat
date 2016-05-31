var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var loaders = [
  {test: /script\/.*\.js$/, loader: 'babel', query: {presets: ['es2015'], cacheDirectory: true}},
  {test: /\.styl$|\.stylus$/, loader: 'style!css?modules&sourceMap!stylus?sourceMap'},
  // {test: /\.styl$|\.stylus$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!stylus')},
  {test: /\.css$/, loader: 'style!css'},
  {test: /\.html$/, loader: 'file?name=[name].[ext]'},
]

loaders.forEach(v => {
  v.exclude = /node_modules/
})

var plugins = [
  // new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false, }, output: { comments: false, }, }),
  // new ExtractTextPlugin('app.css')
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
  plugins: plugins,
  // watch: true
}

