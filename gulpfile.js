var gulp = require('gulp')
var gutil = require('gulp-util')

var stylus = require('gulp-stylus')
var postcss = require('gulp-postcss')

var sourcemaps = require('gulp-sourcemaps')
var webpack = require('webpack')

var browsers = {browsers: ['> 1%', 'IE 8']}
var opacity = function (css, result) {
  css.walkDecls(function (decl) {
    if (decl.prop === 'opacity') {
      decl.parent.insertAfter(decl, {
        prop: '-ms-filter',
        value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
      })
    }
  })
}

gulp.task('webpack', function (callback) {
  webpack(require('./webpack.config.js'), function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString())
  })
})

gulp.task('stylus', function (callback) {
  var cssnext = require('postcss-cssnext')
  var modules = require('postcss-modules')
  var cleanCSS = require('gulp-clean-css')

  var post = [
    modules({ scopeBehaviour: 'global' }),
    cssnext(browsers),
    opacity
  ]
  return gulp.src(['./css/*.stylus', './css/*.styl'])
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(postcss(post))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['stylus', 'webpack'], function (callback) {
  console.log(callback)
})
