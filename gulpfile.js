const gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  cssnano = require('gulp-cssnano'),
  browserSync = require('browser-sync').create(),
  imagemin = require('gulp-imagemin'),
  plumber = require('gulp-plumber'),
  del = require('del');

gulp.task('clean', async () => {
  del.sync('dist');
});

gulp.task('copy', async () => {
  gulp.src('app/**/*.html').pipe(gulp.dest('dist'));
  gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));
});

const sassOptions = {
  outputStyle: 'expanded'
};

const autoprefixerOptions = {
  browsers: ['last 2 versions']
};

const onError = err => {
  notify.onError({
    title: 'Gulp',
    subtitle: 'Failure!',
    message: 'Error: <%= error.message %>',
    sound: 'Basso'
  })(err);
  this.emit('end');
};

gulp.task('styles', async () => {
  gulp
    .src('app/**/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(cssnano())
    .pipe(gulp.dest('dist'));
});

gulp.task('browserSync', async () => {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
});

gulp.task('images', async () => {
  gulp
    .src('app/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
          {
            removeViewBox: true
          }
        ]
      })
    )
    .pipe(gulp.dest('dist'));
});

gulp.task(
  'default',
  gulp.parallel('browserSync', 'copy', 'styles', 'images'),
  async () => {
    gulp.watch('app/**/*.scss', ['styles']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/**/*.js', browserSync.reload);
  }
);

gulp.task('build', gulp.parallel('clean', 'copy', 'styles', 'images'));
