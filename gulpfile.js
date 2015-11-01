var gulp          = require('gulp');
var browserify    = require('browserify-incremental');
var del           = require('del');
var source        = require('vinyl-source-stream');
var runSequence   = require('run-sequence');
var webserver     = require('gulp-webserver');
var yaml2json     = require('yaml-to-json');
var fs            = require('fs');
var symlink       = require('gulp-sym');
var filelist      = require('gulp-filelist');
var server        = require('./server');
 

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
    debug: true,
  };

  return browserify(browserifyConfig)
    .transform('babelify')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILD_DIR))
});
  

gulp.task('list-image-collection', function() {
  return gulp.src('image-collection/**/*', {nodir: true})
    .pipe(filelist('image-collection.json'))
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('symlink-image-collection', function() {
  return gulp.src('image-collection').pipe(symlink(BUILD_DIR + '/image-collection'));
});


gulp.task('serve', function() {
  //return gulp.src(BUILD_DIR)
    //.pipe(webserver());

  server();
});


gulp.task('build', function() {

  runSequence('clean:dev',
              'copy',
              'symlink-image-collection',
              'list-image-collection',
              'browserify');
});
