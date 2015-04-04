(function() {
	'use strict';
	angular.module('u2bear.results.controller',['u2bear.home.services']).controller('resultsCtrl',['$scope', '$timeout', 'Consts', 'Reqs', 'General', 'Player', ResultsCtrl]);
	
	function ResultsCtrl($scope, $timeout, Consts, Reqs, General, Player){
		var self = this;
		var ytdlOptions = {
			maxResults: 18,
			startIndex: 1
		};
		var localVids=[];
		var localSongs=[];
		var currHover=0;
		
		self.search = function(event){
			if(event.charCode==13){
				self.searchModified = false;
				self.stoppedLoading= false;

				if(self.searchSwitch==Consts.searchOptions.youtube){
					if(self.searchPhrase.indexOf('https://www.youtube.com/watch?v=')===0 || self.searchPhrase.indexOf('http://www.youtube.com/watch?v=')===0){
						var playlistId = General.getParam(self.searchPhrase,'list');
						if (playlistId){
							Reqs.Request({url: 'http://gdata.youtube.com/feeds/api/playlists/'+playlistId +'?v=2&alt=json', json: true}, function(error, response, body) {
								if (!error && response.statusCode === 200 && body.feed && body.feed.entry){
									var playlist=[];
									for(var playlistIndex=0; playlistIndex< body.feed.entry.length; playlistIndex++){
										var currVid = body.feed.entry[playlistIndex];
										var currVidUrl = currVid.content.src.substring(0,currVid.content.src.indexOf('?')).replace('v/','watch?v=');
										playlist.push({
											url:currVidUrl,
											title:General.validateVideoName(currVid.title.$t),
											thumbnails:[{url:currVid.media$group.media$thumbnail[3].url}]
										});
									}
									showResaults(playlist);
									$scope.$apply();
								}
							});
						}else{
							Reqs.Ytdl.getInfo(self.searchPhrase, function(err, info){
								if (err){
									console.log(err);
								}else{
									showResaults([{
										url:self.searchPhrase,
										title:General.validateVideoName(info.title),
										thumbnails:[{url:info.thumbnail_url}]
									}]);
									$scope.$apply();
								}
							});
						}
					} else{
						// ??
						ytdlOptions.startIndex=1;
						Reqs.Search(self.searchPhrase, self.ytdlOptions, function(err, results) {
						  if(!err) {
						  	showResaults(results);
							$scope.$apply();
						  }
						});
					}
				}else if(self.searchSwitch==Consts.searchOptions.local){
					var regex=new RegExp(self.searchPhrase.replace(' ','|'),'i');
					var filteredVids=[];
					for (var localIndex=0; localIndex<localVids.length;localIndex++){
						if ((localVids[localIndex]) && (regex.test(localVids[localIndex]))) {
							filteredVids.push({title:localVids[localIndex]});
						}
					}
					showResaults(filteredVids);
				}
			}
		};

		$scope.$on('switchSearch', function(){
			if (self.searchSwitch == Consts.searchOptions.local){
				self.searchSwitch = Consts.searchOptions.youtube;
			}else{
				self.searchSwitch = Consts.searchOptions.local;
			}
		});

		self.switch = function(option){
			self.displayedVids=[];
		    self.searchSwitch = option;
		    self.search({charCode:13});
		    $('#search').focus();
		};

		self.loadMore = function(){
			if ((self.stoppedLoading) && 
			      (self.searchPhrase.indexOf('https://www.youtube.com/watch?v=')==-1) &&
			      (self.searchPhrase.indexOf('http://www.youtube.com/watch?v=')==-1) ){

				self.stoppedLoading=false;
				ytdlOptions.startIndex+=ytdlOptions.maxResults;
				Reqs.Search(self.searchPhrase, ytdlOptions, function(err, results) {
					if(!err){
						self.displayedVids = self.displayedVids.concat(
							$.map(results, function(elem){
						  		elem.title = General.validateVideoName(elem.title);
						  		if (self.currentlyDownloading[elem.title]){
						  			elem.vidClass = 'downloading';
						  			elem.overlay='active';
						  		} else if ($.inArray(elem.title+'.mp4', localVids)!=-1){
						  			elem.vidClass = 'success';
						  			elem.overlay='active';
						  		} else if ($.inArray(elem.title+'.mp3', localSongs)!=-1){
						  			elem.audClass = 'success';
						  			elem.overlay='active';
						  		}
						  		return elem;
						  	})
						);
					}
					self.stoppedLoading=true;
					$scope.$apply();
				});
			}
		};

		self.enqueLocalVideo = function(video){
			Player.addToPlaylist(General.extractName(video.title));

			// self.playList.push(General.extractName(video.title));
			// self.playVideos();
		};

		self.deleteLocalVideo = function(video){
			Reqs.Fs.unlink(Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY, video.title));
			Reqs.Fs.unlink(Reqs.Path.resolve(Consts.IMAGES_DIRECTORY, video.title+'.jpg'));
			Player.removeFromPlaylist(General.extractName(video.title));
			self.displayedVids.splice($.inArray(video,self.displayedVids),1);
			localVids.splice($.inArray(video.title,localVids),1);
		};

		self.deleteLocalVideoFromYoutube = function(video){
			Reqs.Fs.unlink(Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY, video.title + '.mp4'));
			Reqs.Fs.unlink(Reqs.Path.resolve(Consts.IMAGES_DIRECTORY, video.title + '.mp4' +'.jpg'));
			Player.removeFromPlaylist(General.extractName(video.title));
			video.overlay='';
			video.vidClass='';
			localVids.splice($.inArray(video.title + '.mp4',localVids),1);
		};

		self.enqueYoutubeVideo = function(video){
			// check if already downloading
			if (!self.currentlyDownloading[video.title]){
				// check if already existing or
				if (localVids.indexOf(video.title+'.mp4')!=-1){
					// 	add to the play list
					Player.addToPlaylist(video.title);
				}else{
					// if not add to download qeue
					downloadVideoParams(video);
				}
			}
		};

		self.youtubeInfo = function(video){
			Reqs.Ytdl.getInfo(video.url, function(err, info){
				if (err){
					console.log(err);
				}else{
					console.log(info);
				}
			});
		};

		self.downloadMp3 = function(video){
			General.downloadFile(video.thumbnails[0].url, Reqs.Path.resolve(Consts.IMAGES_DIRECTORY ,video.title+'.mp3.jpg'));

			Reqs.Mp3.download(video.url, Reqs.Path.resolve(Consts.SONGS_DIRECTORY ,video.title+'.mp3'), function(err) {
			    if(err) return console.log(err);
			    video.audClass='success';
			    video.overlay='active';
			    localSongs.push(video.title+'.mp3');
			    $scope.$apply();
			});
		};

		self.playLocalVideo = function(video){
			Player.resetPlaylist(General.extractName(video.title));
		};

		function init(){
			self.IMAGES_DIRECTORY = Consts.IMAGES_DIRECTORY;
			self.displayedVids=[];
			self.stoppedLoading = true;
			self.currentlyDownloading={MAX_DOWNLOADS:3,currentSize:0};
			self.searchPhrase ='';
			self.searchSwitch = Consts.searchOptions.youtube;
			self.searchModified=false;
			loadLocalData();
			self.search({charCode:13});
		}

		function downloadVideoParams(chosenVid){
			console.log(chosenVid.title);
			chosenVid.vidClass = 'downloading';
			chosenVid.overlay='active';
			self.currentlyDownloading[chosenVid.title] = {percentage:'0%', vidElement:chosenVid, downloading:false};
			continueDownloadQeue();
		}

		function continueDownloadQeue(){
			if (self.currentlyDownloading.currentSize< self.currentlyDownloading.MAX_DOWNLOADS){
				var downloadQ = Object.keys(self.currentlyDownloading);
				if (downloadQ.length-2>self.currentlyDownloading.currentSize){
					var index = 0;
					while((index<downloadQ.length) && (self.currentlyDownloading.currentSize< self.currentlyDownloading.MAX_DOWNLOADS)){
						var videoName = downloadQ[index];
						
						if (!self.currentlyDownloading[videoName].downloading && videoName!='MAX_DOWNLOADS' && videoName!='currentSize'){
							var chosenVid = self.currentlyDownloading[videoName].vidElement;
							General.downloadFile(chosenVid.thumbnails[0].url, Reqs.Path.resolve(Consts.IMAGES_DIRECTORY, chosenVid.title+'.mp4.jpg'));
							self.currentlyDownloading[videoName].downloading = true;
							self.currentlyDownloading.currentSize++;
							var downloadVid = Reqs.Ytdl(chosenVid.url,
								{filter: function(format) { return format.container === 'mp4';} , 
								quality:'highest'}
							);
							self.currentlyDownloading[videoName].video = downloadVid;

							(function(chosenVid){
								downloadVid.pipe(Reqs.Fs.createWriteStream(Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY, chosenVid.title+'.mp4')));
								downloadVid.on('info',function(info,format){
									this.size = 1 * format.size;
									this.totalBytes = 1 * format.size;
								});
								downloadVid.on('data', function() {
									if (this._readableState.pipes.length > 1){
							  			self.currentlyDownloading[chosenVid.title].percentage = Math.round(this._readableState.pipes[0].bytesWritten / this.size * 100) + '%';
									} else {
							  			self.currentlyDownloading[chosenVid.title].percentage = Math.round(this._readableState.pipes.bytesWritten / this.size * 100) + '%';
							  		}
							  		$scope.$apply();
								});
								downloadVid.on('end',function(){
									self.currentlyDownloading.currentSize--;
									chosenVid.vidClass='success';
									chosenVid.overlay='active';
									localVids.push(chosenVid.title+'.mp4');
									Player.addToPlaylist(chosenVid.title);
									delete(self.currentlyDownloading[chosenVid.title]);
									continueDownloadQeue();
							  		$scope.$apply();
								});
								downloadVid.on('error',function(er){
									console.log(er);
									self.currentlyDownloading.currentSize--;
									Reqs.Fs.unlink(Reqs.Path.resolve(Consts.VIDEOS_DIRECTORY, chosenVid.title+'.mp4'));
									Reqs.Fs.unlink(Reqs.Path.resolve(Consts.IMAGES_DIRECTORY, chosenVid.title+'.mp4.jpg'));
									chosenVid.vidClass='failure';
									chosenVid.overlay='active';
									delete(self.currentlyDownloading[chosenVid.title]);
									continueDownloadQeue();
							  		$scope.$apply();
								});
							})(chosenVid);
						}
						index++;
					}
				}
			}
		}

		$scope.$on('clearDownloads',function(event, win){
			// clear downloadQ
			for (var videoName in self.currentlyDownloading){
				if ((videoName!=='currentSize') && (videoName!=='MAX_DOWNLOADS') && (!self.currentlyDownloading[videoName].downloading)){
					delete (self.currentlyDownloading[videoName]);
				}
			}
			for (videoName in self.currentlyDownloading){
				if (videoName!=='currentSize' && videoName!=='MAX_DOWNLOADS'){
					self.currentlyDownloading[videoName].video.emit('error', new Error('u2bear closed'));
				}
			}
			win.close(true);
		});

		function loadLocalData(){
			Reqs.Fs.readdir(Consts.VIDEOS_DIRECTORY, function(err,files){
				if(err){
					console.log(err);
					localVids=[];
				}else{
					localVids=files;
					// titleBarCtrl.search({charCode:13});
				}
				$scope.$apply();
			});

			Reqs.Fs.readdir(Consts.SONGS_DIRECTORY, function(err,files){
				if(err){
					console.log(err);
					localSongs=[];
				}else{
					localSongs=files;
				}
				$scope.$apply();
			});
		}

		function showResaults(results){
			if(self.searchSwitch==Consts.searchOptions.youtube){
				results.map(function(elem){
					elem.title = General.validateVideoName(elem.title);
			  		if (self.currentlyDownloading[elem.title]){
			  			elem.vidClass = 'downloading';
			  			elem.overlay='active';
			  		} else if ($.inArray(elem.title+'.mp4', localVids)!=-1){
			  			elem.vidClass = 'success';
			  			elem.overlay='active';
			  		} else if ($.inArray(elem.title+'.mp3', localSongs)!=-1){
			  			elem.audClass = 'success';
			  			elem.overlay='active';
			  		}
			  		return elem;
				});
			}
			self.displayedVids = results;
			self.stoppedLoading = true;
		}

		$scope.$on('moveSelection', function(event, action){
			self.displayedVids[currHover].overlay = self.displayedVids[currHover].overlay.replace(' selected','');
			var resultsInLine = Math.floor($('#resultContainer').width() / $('.result').outerWidth(true));

			if (action=='right' && currHover<self.displayedVids.length-1){
				currHover++;
			} else if (action=='left' && currHover>0){
				currHover--;
			}  else if (action=='up' && currHover>=resultsInLine){
				currHover-=resultsInLine;
			}  else if (action=='down' && currHover<self.displayedVids.length){
				currHover+=resultsInLine;
			}

			
			var currLineNumber = Math.floor(currHover/resultsInLine);
			self.displayedVids[currHover].overlay+=' selected';
			 $('#resultContainer').animate({
				scrollTop: currLineNumber * $('.result').outerHeight(true)
			}, 300);

			$timeout(function(){
				$('.overlay.selected .fa-film,.fa-play').focus();
			},15);
		});

		init();
	}

})();