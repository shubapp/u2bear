'use strict';
var u2bear = angular.module('u2bear.controllers',['u2bear.services']);

var controllers={};
var API_PATH="/api";

controllers.introCtrl = ['$scope', '$location', '$timeout', 'Reqs', 'Consts', 'General', function ($scope, $location, $timeout, Reqs, Consts, General) {
	$scope.VIDEOS_DIRECTORY = Consts.VIDEOS_DIRECTORY;
	$scope.SONGS_DIRECTORY = Consts.SONGS_DIRECTORY;
	$scope.IMAGES_DIRECTORY = Consts.IMAGES_DIRECTORY;

	$scope.opts = {
	  maxResults: 18,
	  startIndex: 1
	};

	$scope.displayedVids=[];
	$scope.searchPhrase ="";
	$scope.maxIndex=0;
	$scope.stoppedLoading = true;
	$scope.playerOn=false;
	$scope.playerActive=false;
	$scope.repeatOn=false;
	$scope.superFullscreen = false;
	$scope.hideCheetsheet = true;
	$scope.backgroundPlayer = false;
	$scope.cheetSheet=[
		{key:"Esc", desc:"Stop the current playing video and exit the player (also exit full screen)"},
		{key:"Spacebar", desc:"Pause and resume video"},
		{key:"f", desc:"Toogle in and out of full screen"},
		{key:"d", desc:"Search focus"},
		{key:"s", desc:"Stop the current video"},
		{key:"a", desc:"Toogle always on top"},
		{key:"?", desc:"Open this cheet sheet"},
		{key:"\\", desc:"Switch between the search categories"},
		{key:"F12", desc:"Open debugger"},
	];
	$scope.version = Reqs.Pkg.version;

	$scope.playerPlay = "fa-play";

	$scope.searchSwitch = Consts.searchOptions.youtube;
	$scope.localVids=[];
	$scope.localSongs=[];

	$scope.playList=[];
	$scope.currentlyDownloading={MAX_DOWNLOADS:3,currentSize:0};
	$scope.currListIndex=0;
	$scope.intervalue;

	$scope.searchModified=false;

	$scope.win = Reqs.Gui.Window.get();
	Reqs.Updater($scope.win);

	$scope.loadLocalData = function(){
		Reqs.Fs.readdir(Consts.VIDEOS_DIRECTORY, function(err,files){
			if(err){
				console.log(err);
				$scope.localVids=[];
			}else{
				$scope.localVids=files;
				$scope.search({charCode:13});
			}
			$scope.$apply();
		});

		Reqs.Fs.readdir(Consts.SONGS_DIRECTORY, function(err,files){
			if(err){
				console.log(err);
				$scope.localSongs=[];
			}else{
				$scope.localSongs=files;
			}
			$scope.$apply();
		});
	};

	$scope.initGui = function(){
		var tray = new Reqs.Gui.Tray({title: 'U2Bear', icon: 'u2bearFlat.png' });
	    var menu = new Reqs.Gui.Menu();
		menu.append(new Reqs.Gui.MenuItem({ type: 'normal', label: 'Open',click: function() {
	        $scope.win.show();
	        $scope.win.focus();
	    }}));

	    $scope.aot = new Reqs.Gui.MenuItem({ type: 'checkbox', label: 'Always on top',click:function(){
			$scope.win.setAlwaysOnTop(this.checked);
		}});
		menu.append($scope.aot);
		menu.append(new Reqs.Gui.MenuItem({ type: 'separator'}));
		menu.append(new Reqs.Gui.MenuItem({ type: 'normal', label: 'Close',click: function(){
			$scope.win.close();
		}}));
	    tray.menu = menu;

	    $scope.win.on('minimize', function() {
	      this.hide();
	    });

		tray.on('click', function() {
			$scope.win.show();
			$scope.win.focus();
		});

		$scope.initStreamingServer();
	};

	$scope.initStreamingServer = function(){
		Reqs.Http.createServer(function (req, res) {
			var vidName = decodeURIComponent(req.url.replace('/',''));

			if($scope.currentlyDownloading[vidName]){
			 //    function startStreaming(vidName){
			 //    	console.log(vidName)
				// 	// Chunks based streaming
				//     // if ($scope.currentlyDownloading[vidName].video.size) {
				//     	console.log($scope.currentlyDownloading[vidName].video);
				//     	var total = $scope.currentlyDownloading[vidName].video.size;
				//     	// var total = 48328116;
				//     	console.log(total);
				//         var range = req.headers.range;
				//         var parts = range.replace(/bytes=/, "").split("-");
				//         var partialstart = parts[0];
				//         var partialend = parts[1];
				//         console.log("range", range,partialstart ,partialend)

				//         var start = parseInt(partialstart, 10);
				//         // var start = parseInt($scope.currentlyDownloading[vidName].video._readableState.pipes.bytesWritten, 10);
				//         var end = partialend ? parseInt(partialend, 10) : total - 1;
				//         var chunksize = (end - start) + 1;
				//         console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

				        
				//         res.writeHead(206, {
				// 		 	'Transfer-Encoding': 'chunked',
				//             // 'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
				//             'Content-Range': 'bytes 0-99999999998/99999999999',
				//             'Accept-Ranges': 'bytes',
				//             // 'Content-Length': chunksize,
				//             'Content-Length': 99999999999,
				//             'Content-Type': "video/mp4"
				//         });
				// 		$scope.currentlyDownloading[vidName].video.pipe(res);
				//     // } else {
				//     // 	$timeout(function(){startStreaming(vidName);},500);
				//     // }
				// }

				// startStreaming(vidName);

				res.writeHead(200, {
					'Transfer-Encoding': 'chunked'
					, 'Content-Type': 'video/mp4'
					, 'Accept-Ranges': 'bytes' //just to please some players, we do not actually allow seeking
				});
				$scope.currentlyDownloading[vidName].video.pipe(res);

			}else{
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end();
			}
		}).listen(8433);
	};

	$scope.close = function(){
		$scope.win.close();
	};

	$scope.minimize = function(){
		$scope.win.minimize();
	};

	$scope.enterFullscreen = function(){
		$scope.win.toggleFullscreen();
	}

	$scope.fuller = function(){
		if ($scope.playerOn){
			$scope.superFullscreen = true;
	    	$scope.$apply();
	    	$("#player").mousemove($scope.mouseMovement);
		}
	};

	$scope.mouseMovement = function(){
		clearInterval($scope.intervalue);
		$scope.superFullscreen = false;
		$scope.$apply();
		$scope.intervalue = setInterval($scope.fuller,3500);
	}

	$scope.$watch('playerOn',function(newValue){
		if (newValue){
			$scope.mouseMovement();
		} else{
			clearInterval($scope.intervalue);
			$scope.superFullscreen = false;
			$("#player").unbind('mousemove');
		}
	});

	$scope.toogleCheetSheet = function(){
		$scope.hideCheetsheet = !$scope.hideCheetsheet;
		$timeout(function(){
			$("#cheetsheet .close").focus();
		},15)
	};

	$scope.switch = function(option){
		$scope.displayedVids=[];
	    $scope.searchSwitch = option;
	    $scope.search({charCode:13});
	    $("#search").focus();
	};

	$scope.playerRepeat = function(){
		$scope.repeatOn = !$scope.repeatOn;
	};

	$scope.operateBackground = function(){
		$scope.backgroundPlayer = !$scope.backgroundPlayer;
	};

	$scope.tooglePlayerStop = function(){
		$scope.tooglePlayer(Consts.playerOptions.STOP);
		$scope.currListIndex++;
	};

	$scope.tooglePlayerPlay = function(){
		$scope.tooglePlayer(Consts.playerOptions.PLAY);
	};

	$scope.tooglePlayerPause = function(){
		$scope.tooglePlayer(Consts.playerOptions.PAUSE_PLAY);
	};

	$scope.playerBackward = function(){
		if ($scope.currListIndex>0){
			$scope.tooglePlayer(Consts.playerOptions.STOP);
			$scope.currListIndex--;
			$scope.playVideos();
		}
	};

	$scope.nextVideo = function(){
		if ($scope.currListIndex < $scope.playList.length){
			$scope.tooglePlayer(Consts.playerOptions.STOP);
			$scope.currListIndex++;
			if(($scope.currListIndex == $scope.playList.length) && ($scope.repeatOn)){
				$scope.currListIndex=0;
			}
		}
		$scope.playVideos();
	};

	$scope.tooglePlayer = function(option){
		if(option == Consts.playerOptions.STOP){
			if($scope.playerOn){
				videojs("player").pause();
				$scope.playerPlay = "fa-play";
				$scope.playerActive=false;
				$scope.playerOn=false;
			}
		}else if(option == Consts.playerOptions.PAUSE_PLAY){
			// player not on  OR player in pause
			if(!$scope.playerOn || ($scope.playerPlay=="fa-play")){
				if (!$scope.playerOn){
					$scope.playerActive=true;
				}

				videojs("player").play();

				if($scope.playerPlay=="fa-play"){
					$scope.playerPlay="fa-pause";
				}

				$scope.playerOn=true;
			} else {
				videojs("player").pause();
				if($scope.playerPlay=="fa-pause"){
					$scope.playerPlay = "fa-play";
				}
			}
		}else if(option == Consts.playerOptions.PLAY){
			if (!$scope.playerOn){
				$scope.playerActive=true;
			}

			if($scope.playerPlay=="fa-play"){
				$scope.playerPlay="fa-pause";
			}
			
			videojs("player").play();
			$scope.playerOn=true;
		}
	};

	$scope.keyPreesed = function(event){
		//esc
    	if(event.keyCode==27){
    		if($scope.playerOn){
    			$scope.tooglePlayer(Consts.playerOptions.STOP);
    		}else if(!$scope.hideCheetsheet){
    			$scope.hideCheetsheet=true;
    		}else if($scope.win.isFullscreen){
    			$scope.enterFullscreen();
    		}else{
    			$scope.win.close();
    		}
    	// \
    	}else if(event.keyCode==220){
    		event.preventDefault();
			if ($scope.searchSwitch == Consts.searchOptions.youtube){
				$scope.switch(Consts.searchOptions.local);
			}else if ($scope.searchSwitch == Consts.searchOptions.local){
				$scope.switch(Consts.searchOptions.youtube);
			}
		//down
    	}else if(!$scope.playerOn && event.keyCode==Consts.arrows.DOWN){
    		event.preventDefault();
    		$scope.moveSelection(Consts.arrows.DOWN);
    	//up
    	}else if(!$scope.playerOn && event.keyCode==Consts.arrows.UP){
    		event.preventDefault();
    		$scope.moveSelection(Consts.arrows.UP);
		// F12
		} else if(event.keyCode==123){
			$scope.win.showDevTools();
    	}else if (!$("#search").is(":focus")){
		    if(event.keyCode==83){
				$scope.tooglePlayer(Consts.playerOptions.STOP);
			// d for search bar
		    }else if(event.keyCode==68){
	    		event.preventDefault();
				$("#search").focus();
			//spacebar
	    	}else if(event.keyCode==32){
	    		event.preventDefault();
				$scope.tooglePlayer(Consts.playerOptions.PAUSE_PLAY);
	    	// f for fullscreen
			} else if(event.keyCode==70){
				$scope.enterFullscreen();
	    	// a for always on top
			} else if(event.keyCode==65){
				$scope.aot.checked=!$scope.aot.checked;
				$scope.win.setAlwaysOnTop($scope.aot.checked);
			// ?
			} else if(event.keyCode==191){
				$scope.toogleCheetSheet();
	    	//right
	    	}else if(!$scope.playerOn && event.keyCode==Consts.arrows.RIGHT){
	    		event.preventDefault();
	    		$scope.moveSelection(Consts.arrows.RIGHT);
	    	//left
	    	}else if(!$scope.playerOn && event.keyCode==Consts.arrows.LEFT){
	    		event.preventDefault();
	    		$scope.moveSelection(Consts.arrows.LEFT);
			}
		}
	};

	$scope.search = function(event){
		if(event.charCode==13){
			$scope.searchModified = false;

			$scope.stoppedLoading= false;
			if($scope.searchSwitch==Consts.searchOptions.youtube){
				if($scope.searchPhrase.indexOf("https://www.youtube.com/watch?v=")==0 || $scope.searchPhrase.indexOf("http://www.youtube.com/watch?v=")==0){
					var playlistId = General.getParam($scope.searchPhrase,"list");
					if (playlistId){
						Reqs.Request({url: "http://gdata.youtube.com/feeds/api/playlists/"+playlistId +"?v=2&alt=json", json: true}, function(error, response, body) {
							if (!error && response.statusCode === 200 && body.feed && body.feed.entry){
								var playlist=[];
								for(var playlistIndex=0; playlistIndex< body.feed.entry.length; playlistIndex++){
									var currVid = body.feed.entry[playlistIndex];
									var currVidUrl = currVid.content.src.substring(0,currVid.content.src.indexOf('?')).replace('v/','watch?v=');
									playlist.push({
										url:currVidUrl,
										title:General.validateVideoName(currVid.title["$t"]),
										thumbnails:[{url:currVid["media$group"]["media$thumbnail"][3].url}]
									});
								}
								$scope.showResaults(playlist);
								$scope.$apply();
							}
						});
					}else{
						Reqs.Ytdl.getInfo($scope.searchPhrase, function(err, info){
							if (err){
								console.log(err);
							}else{
								$scope.showResaults([{
									url:$scope.searchPhrase,
									title:General.validateVideoName(info.title),
									thumbnails:[{url:info.thumbnail_url}]
								}]);
								$scope.$apply();
							}
						});
					}
				} else{
					$scope.opts.startIndex=1;
					Reqs.Search($scope.searchPhrase, $scope.opts, function(err, results) {
					  if(!err) {
					  	$scope.showResaults($.map(results, function(elem, index){
					  		elem.title = General.validateVideoName(elem.title);
					  		if ($scope.currentlyDownloading[elem.title]){
					  			elem.vidClass = "downloading";
					  			elem.overlay="active";
					  		} else if ($.inArray(elem.title+".mp4", $scope.localVids)!=-1){
					  			elem.vidClass = "success";
					  			elem.overlay="active";
					  		} else if ($.inArray(elem.title+".mp3", $scope.localSongs)!=-1){
					  			elem.audClass = "success";
					  			elem.overlay="active";
					  		}
					  		return elem;
					  	}));
						$scope.$apply();
					  }
					});
				}
			}else if($scope.searchSwitch==Consts.searchOptions.local){
				var regex=new RegExp($scope.searchPhrase.replace(" ","|"),'i');
				var filteredVids=[];
				for (var localIndex=0; localIndex<$scope.localVids.length;localIndex++){
					if (($scope.localVids[localIndex]) && (regex.test($scope.localVids[localIndex]))) {
						filteredVids.push({title:$scope.localVids[localIndex]});
					}
				}
				$scope.showResaults(filteredVids);
			}
		}
	};

	$scope.showResaults = function(results){
		$scope.maxIndex=0;
		$scope.displayedVids = results;
		$scope.currHover=0;
		$scope.stoppedLoading = true;
	};

	$scope.moveSelection = function(arrow){
		var resultsInLine = Math.floor($("#resultContainer").width() /	$(".result").outerWidth(true));
		if((arrow==Consts.arrows.RIGHT) && ($scope.currHover < $scope.displayedVids.length - 1)){
			$scope.currHover++;
		}else if((arrow==Consts.arrows.LEFT) && ($scope.currHover > 0)){
			$scope.currHover--;
		}else if((arrow==Consts.arrows.DOWN) && ($scope.currHover < $scope.displayedVids.length - resultsInLine)){
			$scope.currHover+=resultsInLine;
		}else if((arrow==Consts.arrows.UP) && ($scope.currHover >= resultsInLine)){
			$scope.currHover-=resultsInLine;
		}
	};

	$scope.playLocalVideo = function(video){
		$scope.playList=[];
		$scope.currListIndex=0;
		$scope.tooglePlayer(Consts.playerOptions.STOP);
		$scope.playList.push({title:General.extractName(video.title)});
		$scope.playVideos();
	};

	$scope.enqueLocalVideo = function(video){
		$scope.playList.push({title:General.extractName(video.title)});
		$scope.playVideos();
	};

	$scope.playVideos= function(){
		if ($scope.currListIndex < $scope.playList.length){
			var chosenVid = $scope.playList[$scope.currListIndex];

			for(var nextSongs= $scope.currListIndex; nextSongs < $scope.playList.length; nextSongs++){
				var checkedVid = $scope.playList[nextSongs];
				if (!Reqs.Fs.existsSync(Consts.VIDEOS_DIRECTORY+checkedVid.title+'.mp4')){
						$scope.downloadVideoParams(checkedVid, $scope.playVideos);
				}
			}

			if(!$scope.playerOn){
				if (Reqs.Fs.existsSync(Consts.VIDEOS_DIRECTORY+chosenVid.title+'.mp4') && (!$scope.currentlyDownloading[chosenVid.title])) {
					videojs("player").ready(function(){
						var myPlayer = this;
						myPlayer.src({ type: "video/mp4", src: Consts.VIDEOS_DIRECTORY+chosenVid.title+'.mp4' });
						myPlayer.load();
						$scope.tooglePlayer(Consts.playerOptions.PLAY);
					});
				} else if ($scope.currentlyDownloading[chosenVid.title]){
					videojs("player").ready(function(){
						var myPlayer = this;
						myPlayer.src({ type: "video/mp4", src: "http://localhost:8433/" + chosenVid.title });
						myPlayer.load();
						$scope.tooglePlayer(Consts.playerOptions.PLAY);
					});
				}
			}
		}
	};

	$scope.deleteLocalVideo = function(video){
		Reqs.Fs.unlink(Consts.VIDEOS_DIRECTORY+video.title);
		Reqs.Fs.unlink(Consts.IMAGES_DIRECTORY+video.title+".jpg");
		$scope.displayedVids.splice($.inArray(video,$scope.displayedVids),1);
		$scope.localVids.splice($.inArray(video.title,$scope.localVids),1);
	};

	$scope.deleteLocalVideoFromYoutube = function(video){
		Reqs.Fs.unlink(Consts.VIDEOS_DIRECTORY+video.title + ".mp4");
		Reqs.Fs.unlink(Consts.IMAGES_DIRECTORY+video.title + ".mp4" +".jpg");
		video.overlay="";
		video.vidClass="";
		$scope.localVids.splice($.inArray(video.title + ".mp4",$scope.localVids),1);
	};

	$scope.enqueYoutubeVideo = function(video){
		$scope.playList.push(video);
		$scope.playVideos();
	};

	$scope.downloadMp3 = function(video){
		General.downloadFile(video.thumbnails[0].url, Consts.IMAGES_DIRECTORY +video.title+'.mp3.jpg');

		Reqs.Mp3.download(video.url, Consts.SONGS_DIRECTORY +video.title+'.mp3', function(err) {
		    if(err) return console.log(err);
		    video.audClass="success";
		    video.overlay="active";
		    $scope.localSongs.push(video.title+'.mp3');
		    $scope.$apply();
		});
	};

	$scope.youtubeInfo = function(video){
		console.log(video);
		Reqs.Ytdl.getInfo(video.url, function(err, info){
			if (err){
				console.log(err);
			}else{
				console.log(info);
			}
		});
	};

	$scope.downloadVideoParams = function(chosenVid, cb){
		chosenVid.vidClass = "downloading";
		chosenVid.overlay="active";

		if (($scope.currentlyDownloading.currentSize< $scope.currentlyDownloading.MAX_DOWNLOADS) && (!$scope.currentlyDownloading[chosenVid.title])) {
			General.downloadFile(chosenVid.thumbnails[0].url, Consts.IMAGES_DIRECTORY +chosenVid.title+'.mp4.jpg');
			$scope.currentlyDownloading.currentSize++;
			var downloadVid = Reqs.Ytdl(chosenVid.url,
				{filter: function(format) { return format.container === 'mp4';} , 
				quality:'highest'}
			);

			$scope.currentlyDownloading[chosenVid.title] = {percentage:"0%", video:downloadVid};

			downloadVid.pipe(Reqs.Fs.createWriteStream(Consts.VIDEOS_DIRECTORY+chosenVid.title+'.mp4'));
			downloadVid.on('info',function(info,format){
				this.size = 1 * format.size;
				this.totalBytes = 1 * format.size;
			});
			downloadVid.on('data', function(chunk) {
				if (this._readableState.pipes.length > 1){
		  			$scope.currentlyDownloading[chosenVid.title].percentage = Math.round(this._readableState.pipes[0].bytesWritten / this.size * 100) + "%";
				} else {
		  			$scope.currentlyDownloading[chosenVid.title].percentage = Math.round(this._readableState.pipes.bytesWritten / this.size * 100) + "%";
		  		}
		  		$scope.$apply();
			});
			downloadVid.on('end',function(){
				delete($scope.currentlyDownloading[chosenVid.title]);
				$scope.currentlyDownloading.currentSize--;
				chosenVid.vidClass="success";
				chosenVid.overlay="active";
				$scope.localVids.push(chosenVid.title+'.mp4');
				if(cb){
					cb();
				}
		  		$scope.$apply();
			});
			downloadVid.on('error',function(er){
				console.log(er);
				delete($scope.currentlyDownloading[chosenVid.title]);
				$scope.currentlyDownloading.currentSize--;
				Reqs.Fs.unlink(Consts.VIDEOS_DIRECTORY+chosenVid.title+'.mp4');
				Reqs.Fs.unlink(Consts.IMAGES_DIRECTORY+chosenVid.title+'.mp4.jpg');
				chosenVid.vidClass="failure";
				chosenVid.overlay="active";
		  		$scope.$apply();
			});
		}
	};

	$scope.loadMore = function(){
		$scope.stoppedLoading=false;
		$scope.opts.startIndex+=$scope.opts.maxResults;
		Reqs.Search($scope.searchPhrase, $scope.opts, function(err, results) {
			if(!err){
				$scope.displayedVids = $scope.displayedVids.concat(
					$.map(results, function(elem, index){
				  		elem.title = General.validateVideoName(elem.title);
				  		if ($scope.currentlyDownloading[elem.title]){
				  			elem.vidClass = "downloading";
				  			elem.overlay="active";
				  		} else if ($.inArray(elem.title+".mp4", $scope.localVids)!=-1){
				  			elem.vidClass = "success";
				  			elem.overlay="active";
				  		} else if ($.inArray(elem.title+".mp3", $scope.localSongs)!=-1){
				  			elem.audClass = "success";
				  			elem.overlay="active";
				  		}
				  		return elem;
				  	})
				);
			}
			$scope.stoppedLoading=true;
			$scope.$apply();
		});
	};

	$scope.loadLocalData();
	$scope.initGui();
	$scope.search({charCode:13});
}];


u2bear.controller(controllers);