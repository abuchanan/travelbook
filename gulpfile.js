var gulp          = require('gulp');
var browserify    = require('browserify');
var rt = require('gulp-react-templates');
var del           = require('del');
var source        = require('vinyl-source-stream');
var runSequence   = require('run-sequence');
var webserver     = require('gulp-webserver');
 

var BUILD_DIR = './build';


gulp.task('clean:dev', function() {
  return del([BUILD_DIR]);
});


gulp.task('copy', function() {

  var toCopy = [
    'app/**/*.js', 'app/styles/**/*.css', 'app/index.html',
    'app/images/**'
  ];

  return gulp
    .src(toCopy, {base: './app'})
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('browserify', function() {
  var browserifyConfig = {
    entries: ['./build/scripts/app.js'],
    extensions: ['.rt.js'],
  };

  return browserify(browserifyConfig)
    .transform('babelify')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILD_DIR))
});


gulp.task('rt', function() {
  return gulp
    .src('app/components/**/*.rt', {base: './app'})
    .pipe(rt({modules: "commonjs"}))
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('serve', function() {
  return gulp.src(BUILD_DIR)
    .pipe(webserver());
});


gulp.task('build', function() {

  runSequence('clean:dev',
//              'rt',
              'copy',
              'browserify');
});
