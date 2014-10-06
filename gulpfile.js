var gulp = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  localhost = require('browser-sync'),
  jade = require('gulp-jade');

gulp.task('js', function () {

  var stream = browserify('./src/js/base.js').bundle();

  stream
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dest/www/js'));

});

gulp.task('markup', function () {
  return gulp.src('src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('dest/www'));
});

gulp.task('watch', ['compile'], function () {

  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/**/*.jade', ['markup']);

});

gulp.task('localhost', ['watch'], function () {
  return localhost(['dest/www/*'], {
    server: 'dest/www/'
  });
});

gulp.task('compile', ['js', 'markup']);
gulp.task('default', ['localhost']);
