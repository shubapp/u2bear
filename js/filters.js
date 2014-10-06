'use strict';
var u2bear = angular.module('u2bear.filters',[]);
var filters = {};
filters.secondes = function(){
	return function(input) {
		if (input < 10) { 
			input = '0' + input;
		}
		return input;
	};
};

u2bear.filter(filters);