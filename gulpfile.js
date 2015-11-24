var gulp          = require('gulp');
var browserify    = require('browserify-incremental');
var babelify      = require('babelify');
var del           = require('del');
var source        = require('vinyl-source-stream');
var runSequence   = require('run-sequence');
var webserver     = require('gulp-webserver');
var yaml2json     = require('yaml-to-json');
var fs            = require('fs');
var symlink       = require('gulp-sym');
var filelist      = require('gulp-filelist');
var server        = require('./server');
var imageResize   = require('gulp-image-resize');
var mapStream     = require('map-stream');
var gm            = require('gulp-gm');
var notifier      = require('node-notifier');
var gutil         = require('gulp-util');
 

var BUILD_DIR = __dirname + '/build';


gulp.task('clean:dev', function() {
  return del([BUILD_DIR]);
});

var toCopy = [
  'app/styles/**/*.css', 'app/index.html',
  'app/images/**', 'app/html/**', 'app/data.json',
  'app/travels.geojson'
];


gulp.task('copy', function() {
  return gulp
    .src(toCopy, {base: './app'})
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('yaml2json', function() {
  var data = yaml2json(fs.readFileSync(__dirname + '/sorted.yml'))
  fs.writeFileSync(BUILD_DIR + '/data.json', JSON.stringify(data));
});


var buildNotification;

gulp.task('browserify', function() {
  var browserifyConfig = {
    entries: ['./app/scripts/app.js'],
    cacheFile: './browserify-incremental-cache.json',
    debug: true,
    transform: [babelify],
  };

  return browserify(browserifyConfig)
    .bundle()
    .on('error', function(err) {
      gutil.log(err.message);
      console.log(err.codeFrame);
      BuildResult.errors.push(err);
      this.end();
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(BUILD_DIR))
});


gulp.task('generate-thumbnails', function() {
  return gulp.src('image-collection/**/*.{jpg,JPG,jpeg,JPEG,gif,png,PNG}')
    .pipe(imageResize({
      width: 200,
      height: 200,
    }))
    .pipe(gulp.dest('thumbnails'));
});

gulp.task('strip-profile', function() {
  return gulp.src('image-collection/**/*.{jpg,JPG,jpeg,JPEG,gif,png,PNG}')
    .pipe(gm(function(gmfile) {
      return gmfile.noProfile();
    }))
    .pipe(gulp.dest('image-collection'));
});


gulp.task('list-image-collection', function() {

  function strip(file, callback) {
    file.path = file.path.replace('image-collection/', '');
    callback(null, file);
  }

  return gulp.src('image-collection/**/*', {read: false, nodir: true})
    .pipe(mapStream(strip))
    .pipe(filelist('image-collection.json'))
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('symlink-image-collection', function() {
  return gulp.src('image-collection').pipe(symlink(BUILD_DIR + '/image-collection'));
});

gulp.task('symlink-thumbnails', function() {
  return gulp.src('thumbnails').pipe(symlink(BUILD_DIR + '/thumbnails'));
});


gulp.task('serve', function() {
  server();
});


var BuildResult = {
  errors: [],
  reset() {
    this.errors = [];
  },
  notify() {

    if (this.errors.length > 0) {
      var notification = {
        title: "Build Failed",
        message: this.errors[0].message,
      };
    } else {
      var notification = {
        title: "Build Complete",
        message: "Build Complete",
      };
    }

    notifier.notify(notification);
  }
};

gulp.task('watch', function() {
  gulp.watch('app/**/*.js', TaskSet('browserify'));
  gulp.watch(toCopy, TaskSet('copy'));
});

function TaskSet() {
  var tasks = Array.prototype.slice.call(arguments);

  function before() {
    console.log('reset');
    BuildResult.reset();
  }
  function after() {
    BuildResult.notify();
  }
  return function() {
    before();
    return runSequence.apply(null, tasks.concat(after));
  }
}

gulp.task('build', TaskSet(
  'clean:dev',
  'copy',
  'symlink-image-collection',
  'symlink-thumbnails',
  'list-image-collection',
  'browserify'
));
