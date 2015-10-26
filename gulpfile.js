var gulp          = require('gulp');
var browserify    = require('browserify-incremental');
var del           = require('del');
var source        = require('vinyl-source-stream');
var runSequence   = require('run-sequence');
var webserver     = require('gulp-webserver');
var yaml2json     = require('yaml-to-json');
var fs            = require('fs');
 

var BUILD_DIR = __dirname + '/build';


gulp.task('clean:dev', function() {
  return del([BUILD_DIR]);
});


gulp.task('copy', function() {

  var toCopy = [
    'app/**/*.js', 'app/styles/**/*.css', 'app/index.html',
    'app/images/**', 'app/html/**', 'app/data.json',
  ];

  return gulp
    .src(toCopy, {base: './app'})
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('yaml2json', function() {
  var data = yaml2json(fs.readFileSync(__dirname + '/sorted.yml'))
  fs.writeFileSync(BUILD_DIR + '/data.json', JSON.stringify(data));
});

gulp.task('browserify', function() {
  var browserifyConfig = {
    entries: ['./build/scripts/app.js'],
    cacheFile: './browserify-incremental-cache.json',
  };

  return browserify(browserifyConfig)
    .transform('babelify')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILD_DIR))
});


gulp.task('serve', function() {
  return gulp.src(BUILD_DIR)
    .pipe(webserver());
});


gulp.task('build', function() {

  runSequence('clean:dev',
              'copy',
              'yaml2json',
              'browserify');
});
