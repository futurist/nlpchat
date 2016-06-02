var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var loaders = [
  {test: /script\/.*\.js$/, loader: 'babel', query: {presets: ['es2015'], plugins:[
    // Allow function args with commas at end: func( a,b, )
    'syntax-trailing-function-commas',
    // es3 member expression: exports['default']=a
    'transform-es3-member-expression-literals',
    // es3 property: {'catch': true}
    'transform-es3-property-literals'], cacheDirectory: false}},
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

