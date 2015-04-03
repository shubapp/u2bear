(function() {
	'use strict';
	angular.module('u2bear.playerBar.controller',['u2bear.home.services']).controller('playerBarCtrl', ['$scope', 'Consts', 'Reqs', 'Player', PlayerBarCtrl]);
	
	function PlayerBarCtrl($scope, Consts, Reqs, Player){
		var self = this;
		var playerOn=false;
		var intervalue;

		self.operateBackground = function(){
			self.backgroundPlayer = !self.backgroundPlayer;
		};

		self.repeat = function(){
			self.repeatOn = !self.repeatOn;
		};
		
		self.stop = function(){
			tooglePlayer(Consts.playerOptions.STOP);
			self.currListIndex++;
		};

		self.pause = function(){
			tooglePlayer(Consts.playerOptions.PAUSE_PLAY);
		};

		self.prevVideo = function(){
			if (self.currListIndex>0){
				tooglePlayer(Consts.playerOptions.STOP);
				self.currListIndex--;
				playVideos();
			}
		};

		self.nextVideo = function(){
			if (self.currListIndex < self.playList.length){
				tooglePlayer(Consts.playerOptions.STOP);
				self.currListIndex++;
				if((self.currListIndex == self.playList.length) && (self.repeatOn)){
					self.currListIndex=0;
				}
			}
			playVideos();
		};


		function init(){
			self.playerPlay = 'fa-play';
			self.playerActive=false;
			self.playList=[];
			self.currListIndex=0;
			self.backgroundPlayer = false;
			self.repeatOn = false;
			self.superFullscreen = false;

			$scope.$watchCollection(function(){
				return Player.playList;
			},function(updatedPlaylist){
				self.playList = updatedPlaylist;
				if (self.playList.length>0)
					playVideos();
			});

			$('body').mousemove(mouseMovement);
		}

		function tooglePlayer(option){
			if(option == Consts.playerOptions.STOP){
				if(playerOn){
					videojs('player').pause();
					self.playerPlay = 'fa-play';
					self.playerActive=false;
					playerOn=false;
				}
			}else if(option == Consts.playerOptions.PAUSE_PLAY){
				// player not on  OR player in pause
				if(!playerOn || (self.playerPlay=='fa-play')){
					if (!playerOn){
						self.playerActive=true;
					}

					videojs('player').play();

					if(self.playerPlay=='fa-play'){
						self.playerPlay='fa-pause';
					}

					playerOn=true;
				} else {
					videojs('player').pause();
					if(self.playerPlay=='fa-pause'){
						self.playerPlay = 'fa-play';
					}
				}
			}else if(option == Consts.playerOptions.PLAY){
				if (!playerOn){
					self.playerActive=true;
				}

				if(self.playerPlay=='fa-play'){
					self.playerPlay='fa-pause';
				}
				
				videojs('player').play();
				playerOn=true;
			}
		}

		function playVideos(){
			if (self.currListIndex < self.playList.length){
				var chosenVid = self.playList[self.currListIndex];
				if(!playerOn){
					if (Reqs.Fs.existsSync(Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY,chosenVid+'.mp4'))) {
						videojs('player').ready(function(){
							var myPlayer = this;
							myPlayer.src({ type: 'video/mp4', src: Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY, chosenVid+'.mp4') });
							myPlayer.load();
							tooglePlayer(Consts.playerOptions.PLAY);
						});
					// } else if (self.currentlyDownloading[chosenVid.title]){
					// 	videojs('player').ready(function(){
					// 		var myPlayer = this;
					// 		myPlayer.src({ type: 'video/mp4', src: 'http://localhost:8433/' + chosenVid.title });
					// 		myPlayer.load();
					// 		self.tooglePlayer(Consts.playerOptions.PLAY);
					// 	});
					}
				}
			}
		}

		$scope.$on('playerEvents', function(event, action){
			if (action=='close'){
				if (playerOn){
					tooglePlayer(Consts.playerOptions.STOP);
				}else{
					$scope.$emit('playerClosed');
				}
			}else if(action == 'pause'){
				tooglePlayer(Consts.playerOptions.PAUSE_PLAY);
			}else if(action == 'stop'){
				tooglePlayer(Consts.playerOptions.STOP);
			}
		});


		function fuller(){
			if (playerOn && self.playerActive && !self.superFullscreen){
		    	$scope.$apply(function(){
					self.superFullscreen = true;
		    	});
			}
		}

		function mouseMovement(){
			clearInterval(intervalue);
			$scope.$apply(function(){
				self.superFullscreen = false;
			});
			intervalue = setInterval(fuller,3500);
		}

		init();
	}

})();