'use strict';
var u2bear = angular.module('u2bear',['u2bear.controllers','u2bear.directives','ngRoute','u2bear.services','ngAnimate','u2bear.filters']);

// Routes section
u2bear.config(function ($routeProvider) {
	$routeProvider
	.when('/',{
		// controller:'introCtrl',
		templateUrl: './views/videos.html',
		resolve:{
			setup:folderSetup
		}
	})
	.otherwise({redirectTo:'/'});
});

var folderSetup = function(Reqs, Consts){
	if(!Reqs.Fs.existsSync(Consts.VIDEOS_DIRECTORY)) {
		Reqs.Fs.mkdirSync(Consts.VIDEOS_DIRECTORY);
	}
	if(!Reqs.Fs.existsSync(Consts.SONGS_DIRECTORY)) {
		Reqs.Fs.mkdirSync(Consts.SONGS_DIRECTORY);
	}
	if(!Reqs.Fs.existsSync(Consts.IMAGES_DIRECTORY)) {
		Reqs.Fs.mkdirSync(Consts.IMAGES_DIRECTORY);
	}
}