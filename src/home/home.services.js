(function() {
	'use strict';

	var u2bearHome = angular.module('u2bear.home.services',[]);

	// var API_PATH = '/api';

	u2bearHome.factory('Reqs', Reqs);
	function Reqs() {
		return {
			Fs : require('fs'),
			Ytdl : require('ytdl-core'),
			Search : require('youtube-search'),
			Mp3 : require('youtube-mp3'),
			Gui : require('nw.gui'),
			Http : require('http'),
			Request : require('request'),
			// Updater : require('./updater/updater'),
			Utils :require('./js/utils'),
			Pkg : require('./package.json'),
			Path : require('path')
		};
	}

	u2bearHome.factory('Consts', ['Reqs', Consts]);
	function Consts(Reqs) {
		// var APP_DIRECTORY = 'build/' + (process.execPath.indexOf('u2bear.exe')!=-1) ? process.execPath.replace('u2bear.exe','') : '';
		return {
			APP_DIRECTORY : Reqs.Utils.appDir,
			VIDEOS_DIRECTORY : Reqs.Utils.videosDir,
			SONGS_DIRECTORY : Reqs.Utils.songsDir,
			IMAGES_DIRECTORY : Reqs.Utils.imagesDir,
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
	}

	u2bearHome.factory('General', ['Reqs', General]);
	function General(Reqs) {
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
				name = name.replace(/\\/g,'_');
				name = name.replace(/\//g,'_');
				name = name.replace(/\?/g,'_');
				name = name.replace(/\:/,'_');
				name = name.replace(/\*/g,'_');
				name = name.replace(/\"/g,'_');
				name = name.replace(/\>/g,'_');
				name = name.replace(/</g,'_');
				name = name.replace(/\|/g,'_');
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
	}

	u2bearHome.factory('Player', [Player]);
	function Player() {
		var player = {
			// currListIndex: 0,
			playList: [],
			resetPlaylist: function(name){
				if (name){
					player.playList=[name];
				}else{
					player.playList=[];
				}
			},
			addToPlaylist: function(name){
				player.playList.push(name);
			},
			removeFromPlaylist: function(name){
				var index = player.playList.indexOf(name);
				while (index!=-1){
					player.playList.splice(index, 1);
					index = player.playList.indexOf(name);
				}
			},
			printPlaylist: function(){
				console.log(player.playList);
			}
		};

		return player;
	}
})();