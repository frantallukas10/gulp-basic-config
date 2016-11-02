var gulp = require('gulp'),
		browserSync = require('browser-sync').create(),
		watch = require('gulp-watch'),
		compass = require('gulp-compass'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		minifyCss = require('gulp-minify-css'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		plumber = require('gulp-plumber'),
		notify = require('gulp-notify'),
		autoprefixer = require('gulp-autoprefixer');

//Paths
var P = {
	autoprefix: {
		src: './styles/sass/*.scss',
		dest: './styles/autoprefix'
	},
	scss: {
		src: './styles/autoprefix/*.scss',
		dest: './styles/css'
	},
	cssMin: {
		name: 'styles_min.css',
		src: './styles/css/base.css',
		dest: './styles/css'
	},
	imgMin: {
		src: ['./images/target/*.png', './images/target/*.jpg', './images/target/*.gif'],
		dest: './images/min/'
	},
	jsMin: {
		name: 'main_min.js',
		src: './js/*.js',
		dest: './js'
	}
};

//Error notification settings for plumber
var plumberErrorHandler = { errorHandler: notify.onError("Error: <%= error.message %>") };

//Autoprefixer
gulp.task('autoprefixer', function() {
	return gulp.src(P.autoprefix.src)
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: false
	}))
	.pipe(gulp.dest(P.autoprefix.dest));
});

//Compass task
gulp.task('compass', function() {
	gulp.src(P.scss.src)
	.pipe(plumber(plumberErrorHandler))
	.pipe(compass({
		sass: './styles/autoprefix',
		css: './styles/css',
	}))
	.pipe(gulp.dest(P.scss.dest))
	.on('error', function(error) {
		console.log(error);
		this.emit('end');
	});
});

//Css min
gulp.task('css-min', function() {
	return gulp.src(P.cssMin.src)
	.pipe(plumber(plumberErrorHandler))
	.pipe(concat(P.cssMin.name))
	.pipe(minifyCss({compatibility: 'ie8'}))
	.pipe(gulp.dest(P.cssMin.dest));
});


//Image min
gulp.task('img-min', function(){
	return gulp.src(P.imgMin.src)
	.pipe(plumber(plumberErrorHandler))
	.pipe(imagemin({
		optimizationLevel: 7,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest(P.imgMin.dest));
});

//JS min
gulp.task('js-min', function() {
	return gulp.src(P.jsMin.src)
	.pipe(plumber(plumberErrorHandler))
	.pipe(concat(P.jsMin.name))
	.pipe(uglify())
	.pipe(gulp.dest(P.jsMin.dest));
});

gulp.task('watch', function () {
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});

	gulp.watch(P.autoprefix.src, ['autoprefixer']);
	gulp.watch(P.scss.src, ['compass']);

	gulp.watch(['./styles/sass/*.scss', './styles/css/*.css', './js/*.js', './*.html'], function(e){
		gulp.src(e.path)
		.pipe(plumber(plumberErrorHandler))
		.pipe(browserSync.stream())
		.pipe(notify(
			e.path.replace(__dirname, '').replace(/\\/g, '/') + ' changed/reloaded'
		));
	});
});

//Dafault task with postCss
gulp.task('default', ['autoprefixer', 'compass', 'watch']);

//Min files
gulp.task('min', ['img-min', 'css-min', 'js-min']);
