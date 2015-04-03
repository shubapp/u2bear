'use strict';
var path = require('path');
// var appDir = path.join(__dirname,'..');
var appDir = (process.execPath.indexOf('u2bear.exe')!=-1) ? process.execPath.replace('u2bear.exe','') : path.join(__dirname,'..');

module.exports={
	appDir: appDir,
	videosDir: path.join(appDir, 'videos'),
	songsDir: path.join(appDir, 'songs'),
	imagesDir: path.join(appDir, 'images'),
};