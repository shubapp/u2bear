(function() {
	'use strict';
	angular.module('u2bear.home.controller',['u2bear.home.services']).controller('homeCtrl',['$timeout', '$scope', 'Reqs', 'Consts', HomeCtrl]);
	
	function HomeCtrl($timeout, $scope, Reqs, Consts){
		var self = this;
		var win = Reqs.Gui.Window.get();
		var alwaysOnTop;
		
		function init(){
			// Reqs.Updater(win);
			initGui();
			self.areyousure = false;
		}

		self.close = function(){
			win.close();
		};

		self.minimize = function(){
			win.minimize();
		};

		self.enterFullscreen = function(){
			win.toggleFullscreen();
		};

		$scope.$on('cheetsheetClosed', function(){
			// if full screen close it
			if (win.isFullscreen){
				win.toggleFullscreen();
			}else{
				// if player on close it
				$scope.$emit('playerEvents','close');
			}
		});
		$scope.$on('playerClosed', function(){
			// are you sure on
			self.areyousure=true;
			$timeout(function(){
				$('#areyousure button:first').focus();
			},10);
		});

		self.keyPreesed = function(event){
			switch(event.keyCode){
				// Esc
				case 27:
					// if are you sure on close it
					if (self.areyousure){
						self.areyousure=false;
					}else{
						// if cheetshet on close it
						$scope.$emit('cheetsheetEvents','close');
					}
					break;
				// \
				case 220:
					event.preventDefault();
					$scope.$emit('switchSearch');
					break;
				// down
				case Consts.arrows.DOWN:
					event.preventDefault();
					$scope.$emit('moveSelection','down');
					break;
				// up
				case Consts.arrows.UP:
					event.preventDefault();
					$scope.$emit('moveSelection','up');
					break;
				// F12
				case 123:
					win.showDevTools();
					break;
				// s
				case 83:
					if (!$('#search').is(':focus')){
						$scope.$emit('playerEvents','stop');
					}
					break;
				// d
				case 68:
					if (!$('#search').is(':focus')){
						event.preventDefault();
						$('#search').focus();
					}
					break;
				// spacebar
				case 32:
					if (!$('#search').is(':focus')){
						$scope.$emit('playerEvents','pause');
					}
					break;
				// f
				case 70:
					if (!$('#search').is(':focus')){
						win.toggleFullscreen();
					}
					break;
				// a
				case 65:
					if (!$('#search').is(':focus')){
						alwaysOnTop.checked=!alwaysOnTop.checked;
						win.setAlwaysOnTop(alwaysOnTop.checked);
					}
					break;
				// ?
				case 191:
					if (!$('#search').is(':focus')){
						$scope.$emit('cheetsheetEvents','toggle');
					}
					break;
				// right
				case Consts.arrows.RIGHT:
					if (!$('#search').is(':focus')){
						event.preventDefault();
						$scope.$emit('moveSelection','right');
					}
					break;
				// left
				case Consts.arrows.LEFT:
					if (!$('#search').is(':focus')){
						event.preventDefault();
						$scope.$emit('moveSelection','left');
					}
					break;
			}

		};

		function initGui(){
			var tray = new Reqs.Gui.Tray({title: 'U2Bear', icon: './img/u2bearFlat.png' });
		    var menu = new Reqs.Gui.Menu();
			menu.append(new Reqs.Gui.MenuItem({ type: 'normal', label: 'Open',click: function() {
		        win.show();
		        win.focus();
		    }}));

		    alwaysOnTop = new Reqs.Gui.MenuItem({ type: 'checkbox', label: 'Always on top',click:function(){
				win.setAlwaysOnTop(this.checked);
			}});
			menu.append(alwaysOnTop);
			menu.append(new Reqs.Gui.MenuItem({ type: 'separator'}));
			menu.append(new Reqs.Gui.MenuItem({ type: 'normal', label: 'Close',click: function(){
				win.close();
			}}));
		    tray.menu = menu;

		    win.on('minimize', function() {
		      this.hide();
		    });

		    win.on('close', function() {
				$scope.$emit('clearDownloads',this);
		    });

			tray.on('click', function() {
				win.show();
				win.focus();
			});

			// initStreamingServer();
		}

		// function initStreamingServer(){
		// 	Reqs.Http.createServer(function (req, res) {
		// 		var vidName = decodeURIComponent(req.url.replace('/',''));

		// 		if(resultsCtrl.currentlyDownloading[vidName]){
		// 			res.writeHead(200, {
		// 				'Transfer-Encoding': 'chunked',
		// 				'Content-Type': 'video/mp4',
		// 				'Accept-Ranges': 'bytes' //just to please some players, we do not actually allow seeking
		// 			});
		// 			resultsCtrl.currentlyDownloading[vidName].video.pipe(res);

		// 		}else{
		// 			res.writeHead(200, { 'Content-Type': 'text/html' });
		// 			res.end();
		// 		}
		// 	}).listen(8433);
		// }

		init();
	}

})();