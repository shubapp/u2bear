(function() {
	'use strict';
	var u2bearHome = angular.module('u2bear.home.directives',[]);
	
	u2bearHome.directive('titleBar', TitleBar);
	function TitleBar(){
		return {
			restrict: 'E',
			templateUrl: 'home/titlebar/titleBar.html',
			replace: true
		};
	}

	u2bearHome.directive('playerBar', PlayerBar);
	function PlayerBar(){
		return {
			restrict: 'E',
			templateUrl: 'home/playerbar/playerBar.html',
			controller: 'playerBarCtrl as playerBarCtrl',
			replace: true
		};
	}

	u2bearHome.directive('cheetsheet', Cheetsheet);
	function Cheetsheet(){
		return {
			restrict: 'E',
			templateUrl: 'home/cheetsheet/cheetsheet.html',
			controller: 'cheetsheetCtrl as cheetsheetCtrl',
			replace: true
		};
	}

	u2bearHome.directive('results', Results);
	function Results(){
		return {
			restrict: 'E',
			templateUrl: 'home/resultcontainer/results.html',
			controller: 'resultsCtrl as resultsCtrl',
			replace: true
		};
	}

	u2bearHome.directive('areyousure', AreYouSure);
	function AreYouSure(){
		return {
			restrict: 'E',
			templateUrl: 'home/areyousure.html',
			replace: true
		};
	}
})();
