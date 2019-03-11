const gulp = require("gulp");
const sass = require("gulp-sass");
const sassUnicode = require("gulp-sass-unicode");
const prefix = require("gulp-autoprefixer");
const concat = require("gulp-concat");
// const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const del = require("del");
const useref = require("gulp-useref");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");
const cssnano = require("gulp-cssnano");

gulp.task("clean", async () => {
  del.sync("dist");
});

gulp.task("copy", async () => {
  gulp.src("app/**/*.html").pipe(gulp.dest("dist"));
  gulp.src("app/styles/fonts/**/*").pipe(gulp.dest("dist/styles/fonts"));
});

gulp.task("useref", async () => {
  gulp
    .src("app/*.html")
    .pipe(useref())
    .pipe(gulpIf("*.js", uglify()))
    .pipe(gulpIf("*.css", cssnano()))
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
});

gulp.task("browserSync", async () => {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
  gulp
    .watch("app/**/*.html", gulp.parallel("copy"))
    .on("change", browserSync.reload);
  gulp
    .watch("app/styles/**/*.scss", gulp.parallel("styles"))
    .on("change", browserSync.reload);
  gulp
    .watch("app/**/*.js", gulp.parallel("useref"))
    .on("change", browserSync.reload);
});

gulp.task("styles", async () => {
  gulp
    .src("./app/styles/style.scss")
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(
      sass({ outputStyle: "expanded", errLogToConsole: true }).on(
        "error",
        sass.logError
      )
    )
    .pipe(concat("local.css"))
    .pipe(sassUnicode())
    .pipe(prefix({ browsers: ["last 2 versions"] }))
    // .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write("map"))
    .pipe(gulp.dest("dist/styles"));
});

gulp.task("images", async () => {
  gulp
    .src("app/**/*.+(png|jpg|jpeg|gif|svg)")
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
    .pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.parallel("clean", "styles", "images", "useref", "copy", "browserSync")
);

gulp.task(
  "build",
  gulp.parallel("clean", "styles", "images", "useref", "copy")
);
