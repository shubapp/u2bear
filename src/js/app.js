(function() {
	'use strict';

	angular.module('u2bear',['u2bear.home', 'ngRoute', 'ngAnimate']).run(['Reqs', 'Consts', FolderSetup]);

	function FolderSetup(Reqs, Consts){
		process.on('uncaughtException', function(err){
			console.log('ERROR:\n',err);
		});
		
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
})();