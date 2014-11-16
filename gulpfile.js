var gulp = require('gulp');
// var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var cssshrink = require('gulp-cssshrink');
var htmlmin = require("gulp-htmlmin");
// var cp = require('child_process');

gulp.task('scripts', function () {
	gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest('js'));
});

gulp.task('styles', function () {
	gulp.src('src/css/**/*.css')
		.pipe(plumber())
		// .pipe(prefix('last 2 versions'))
		.pipe(cssshrink())
		.pipe(gulp.dest('css'));
});

gulp.task("html", function() {
  gulp.src(["src/**/*.html", "!node_modules/**/*"])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("."))
});

gulp.task('watch', function () {
	gulp.watch('src/js/**/*.js',['scripts']);
	gulp.watch('src/css/**/*.css',['styles']);
	//
});

gulp.task('default',['styles', 'scripts', 'html']);