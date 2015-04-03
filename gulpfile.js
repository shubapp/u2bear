'use strict';

var gulp = require('gulp');
// var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var cssshrink = require('gulp-cssshrink');
var htmlmin = require('gulp-htmlmin');
var cp = require('child_process');
var inject = require('gulp-inject');
var bower = require('gulp-bower');
var bowerFiles = require('main-bower-files');
var zip = require('gulp-zip');
var install = require('gulp-install');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var path = require('path');
var fs = require('fs');

var nwDir = 'F:/apps/nwjs-v0.12.0-win-x64';

gulp.task('clean', function () {
	return gulp.src('build', {read:false})
		.pipe(clean());
});

gulp.task('scripts', function () {
	return gulp.src('src/**/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest('build'));
});

gulp.task('scriptsClean', function () {
	return gulp.src('src/**/*.js')
		.pipe(plumber())
		.pipe(gulp.dest('build'));
});

gulp.task('styles', function () {
	return gulp.src('src/**/*.css')
		.pipe(plumber())
		// .pipe(prefix('last 2 versions'))
		.pipe(cssshrink())
		.pipe(gulp.dest('build'));
});

gulp.task('html', function() {
  return gulp.src(['src/**/*.html', '!node_modules/**/*'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function () {
	gulp.watch('src/**/*.js',['scriptsClean']);
	gulp.watch('src/**/*.css',['styles']);
	gulp.watch(['src/**/*.html', '!node_modules/**/*'],['html']);
	gulp.watch(['src/**/*.html','src/**/*.css','src/**/*.js'],['run']);
});

gulp.task('run', ['fonts','images','styles', 'indexInjection', 'dev.package.json'], function () {
	setTimeout(function(){
		cp.spawn(nwDir + '/nw.exe',['f:/git/u2bear/.']);
	},1000);
});

gulp.task('fonts', function () {
	return gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('build/fonts'));
});

gulp.task('images', function () {
	return gulp.src('src/img/**/*')
		.pipe(gulp.dest('build/img'));
});

gulp.task('installBowerDeps', function() {
	return bower({cwd: '.' });
});

gulp.task('indexInjection', ['installBowerDeps', 'scriptsClean', 'html'], function () {
  var target = gulp.src('src/index.html');
  var bowerSources = gulp.src(bowerFiles({paths:{bowerrc:'.bowerrc',bowerJson:'bower.json',bowerDirectory:'bower_components'}}), {read: false});
  var regularSources = gulp.src(['!bower_components/**/*','build/**/*.js','build/**/*.css','!build/js/utils.js'], {read: false});

  return target
  	.pipe(inject(bowerSources,{name:'bower',relative:true,ignorePath:'*'}))
  	.pipe(inject(regularSources,{relative:true,ignorePath:'../build/'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('indexInjectionBuild', ['html', 'package.json'], function () {
  var target = gulp.src('src/index.html');
  var bowerSources = gulp.src(bowerFiles({paths:{bowerJson:'build/bower.json',bowerDirectory:'build/bower_components'}}), {read: false});
  var regularSources = gulp.src(['!build/bower_components/**/*', '!build/node_modules/**/*', 'build/**/*.js', 'build/**/*.css'], {read: false});

  return target
  	.pipe(htmlmin({collapseWhitespace: true}))
  	.pipe(gulp.dest('build'))
  	.pipe(inject(bowerSources,{name:'bower',relative:true,ignorePath:'*'}))
  	.pipe(inject(regularSources,{relative:true,ignorePath:'../build/'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('dev.package.json', function () {
	return gulp.src('package.json')
		.pipe(gulp.dest('build'));
});

// modify and create package.json file in build directory
gulp.task('package.json', ['node_modules'], function () {
	var packageJson = require('./package.json');
	packageJson.main='index.html';
	packageJson.window.frame = false;
	packageJson.window.toolbar = false;
	fs.writeFileSync('./build/package.json', JSON.stringify(packageJson));
});

// zip the directory as nw file
gulp.task('packageNw', ['fonts','images','styles', 'scripts', 'indexInjectionBuild'], function () {
	return gulp.src(['build/**/*','!build/images/*','!build/songs/*','!build/videos/*'])
		.pipe(zip('package.nw'))
		.pipe(gulp.dest('dist'));
});

// copy nw.exe and dlls
gulp.task('nwFilesRest', function () {
	return gulp.src([path.resolve(nwDir,'ffmpegsumo.dll'),
					path.resolve(nwDir,'icudtl.dat'),
					path.resolve(nwDir,'nw.pak')])
		.pipe(gulp.dest('dist'));
});

gulp.task('nwFiles', ['nwFilesRest'], function () {
	return gulp.src(path.resolve(nwDir,'nw.exe'))
		.pipe(rename('u2bear.exe'))
		.pipe(gulp.dest('dist'));
});
// // try running
gulp.task('node_modules', function () {
	return gulp.src(['package.json','bower.json'])
		.pipe(gulp.dest('build'))
		.pipe(install({production: true}));
		// .pipe(install());
});

gulp.task('windows64build',['packageNw', 'nwFiles'],function(){
	return gulp.src(['dist/**/*','!dist/videos/*','!dist/images/*','!dist/songs/*'])
		.pipe(zip('u2bear.zip'))
		.pipe(gulp.dest('dist'));
});
gulp.task('debugBuild',['fonts','images','styles', 'indexInjection', 'dev.package.json']);
gulp.task('default',['run', 'watch']);