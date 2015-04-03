(function() {
	'use strict';
	angular.module('u2bear.cheetsheet.controller',['u2bear.home.services']).controller('cheetsheetCtrl',['$timeout', '$scope', 'Reqs', CheetsheetCtrl]);
	
	function CheetsheetCtrl($timeout, $scope, Reqs){
		var self = this;

		self.toogleCheetSheet = function(){
			self.hideCheetsheet = !self.hideCheetsheet;
			if (!self.hideCheetsheet){
				$timeout(function(){
					$('#cheetsheet .close').focus();
				},15);
			}
		};

		function init(){
			self.hideCheetsheet = true;
			self.cheetSheetKeys=[
				{key:'Esc', desc:'Stop the current playing video and exit the player (also exit full screen)'},
				{key:'Spacebar', desc:'Pause and resume video'},
				{key:'f', desc:'Toogle in and out of full screen'},
				{key:'d', desc:'Search focus'},
				{key:'s', desc:'Stop the current video'},
				{key:'a', desc:'Toogle always on top'},
				{key:'?', desc:'Open this cheet sheet'},
				{key:'\\', desc:'Switch between the search categories'},
				{key:'F12', desc:'Open debugger'},
			];
			self.version = Reqs.Pkg.version;
		}

		$scope.$on('cheetsheetEvents',function(event, action){
			if (action=='close'){
				if (!self.hideCheetsheet){
					self.toogleCheetSheet();
				}else{
					$scope.$emit('cheetsheetClosed');
				}
			}else if (action == 'toggle'){
				self.toogleCheetSheet();
			}
		});

		init();
	}

})();