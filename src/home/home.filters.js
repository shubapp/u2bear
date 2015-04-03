(function() {
	'use strict';
	angular.module('u2bear.home.filters',[]).filter('time', Time);

	function Time(){
		return function(input) {
			if (isNaN(input)){
				return '';
			}
			var minutes = Math.floor(input/60);
			var secondes = input % 60;
			if (secondes < 10)
				secondes = '0' + secondes;
			
			return minutes + ':' + secondes;
		};
	}
})();