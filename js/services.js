'use strict';
var u2bear = angular.module('u2bear.services', []);

// var API_PATH = "/api";

u2bear.factory("Reqs", function() {
	return {
		Fs : require('fs'),
		Ytdl : require('ytdl-core'),
		Search : require('youtube-search'),
		Mp3 : require('youtube-mp3'),
		Gui : require('nw.gui'),
		Http : require('http'),
		Request : require("request"),
		Updater : require("./updater/updater"),
		Pkg : require("./package.json")
	};
});

u2bear.factory("Consts", function() {
	var APP_DIRECTORY = (process.execPath.indexOf("u2bear.exe")!=-1) ? process.execPath.replace("u2bear.exe","") : "";
	return {
		APP_DIRECTORY : APP_DIRECTORY,
		VIDEOS_DIRECTORY : APP_DIRECTORY + "videos/",
		SONGS_DIRECTORY : APP_DIRECTORY +"songs/",
		IMAGES_DIRECTORY : APP_DIRECTORY +"images/",
		searchOptions : {
			youtube:1,
			local:2
		},
		playerOptions : {
			PAUSE_PLAY:1,
			STOP:2,
			PLAY:3
		},
		arrows : {
			DOWN:40,
			UP:38,
			LEFT:37,
			RIGHT:39
		}
	};
});

u2bear.factory("General", function(Reqs) {
	return {
		extractName: function (vidName){
			return vidName.substring(0,vidName.lastIndexOf('.mp4'));
		},
		downloadFile: function(url, dest, cb) {
			var file = Reqs.Fs.createWriteStream(dest);
			Reqs.Http.get(url, function(response) {
				response.pipe(file);
				file.on('finish', function() {
					file.close(cb);  // close() is async, call cb after close completes.
				});
			}).on('error', function(err) { // Handle errors
				Reqs.Fs.unlink(dest); // Delete the file async. (But we don't check the result)
				//if (cb) cb(err.message);
			});
		},
		validateVideoName: function(name){
			name = name.replace(/\\/g,"_");
			name = name.replace(/\//g,"_");
			name = name.replace(/\?/g,"_");
			name = name.replace(/\:/,"_");
			name = name.replace(/\*/g,"_");
			name = name.replace(/\"/g,"_");
			name = name.replace(/\>/g,"_");
			name = name.replace(/\</g,"_");
			name = name.replace(/\|/g,"_");
			return name;
		},
		getParam: function(url,param){
			var match = url.match(new RegExp('[?&]'+param+'=([^&]+)'));
			if(match && match.length == 2){
				return match[1];
			}
			return null;
		}
	};
});