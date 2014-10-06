'use strict';
var u2bear = angular.module('u2bear.directives',[]);
var directives = {};

directives.titleBar = function(){
	return {
      restrict: 'E',
      templateUrl: 'views/titleBar.html',
      replace: true
    };
};

directives.playerBar = function(){
	return {
      restrict: 'E',
      templateUrl: 'views/playerBar.html',
      replace: true
    };
};

directives.cheetsheet = function(){
	return {
      restrict: 'E',
      templateUrl: 'views/cheetsheet.html',
      replace: true
    };
};

directives.playerContainer = function(){
	return {
      restrict: 'E',
      template:"<video id='player' class='video-js vjs-default-skin' controls preload='none' width='' height=''" +
      "poster='u2bearFlat.png' data-setup='{}'>" +
      "<source id='source' src='' type='video/mp4' />" +
      "</video>",
      link:function(scope, element, attrs) {
      	videojs("player").on("ended", scope.nextVideo);
      	$("#search").focus();
      }
	};
};

directives.scroll = function(){
	return {
		restrict: 'A',
		link:function(scope, element, attrs) {
	        element.bind("scroll", function() {
	        	if ((scope.stoppedLoading) && 
	        		(element[0].scrollHeight - element.scrollTop() <= element.outerHeight() + 350)&&
		    		(scope.searchPhrase.indexOf("https://www.youtube.com/watch?v=")==-1) &&
		    		(scope.searchPhrase.indexOf("http://www.youtube.com/watch?v=")==-1) ){
			            scope.$apply(function (){
		                    scope.$eval(attrs.scroll);
		                });
	        	}
	        });
    	}
    };
};

directives.autoFocus = function($timeout){
	return {
		restrict: 'A',
		link:function(scope, element, attrs) {
			scope.$watch(attrs.autoFocus,function(newVal, oldVal){
				if(scope.displayedVids[newVal]){
					if(oldVal>-1 && scope.displayedVids[oldVal].overlay)
						scope.displayedVids[oldVal].overlay = scope.displayedVids[oldVal].overlay.replace(" selected","");
					if(newVal>-1 && newVal<scope.displayedVids.length){
						if(scope.displayedVids[newVal].overlay)
							scope.displayedVids[newVal].overlay+=" selected";
						else
							scope.displayedVids[newVal].overlay=" selected";
					}

					var resultsInLine = Math.floor($("#resultContainer").width() /	$(".result").outerWidth(true));
					var currLineNumber = Math.floor(newVal/resultsInLine);
					
					$('#resultContainer').animate({
				        scrollTop: currLineNumber * $(".result").outerHeight(true)
				    }, 500);
				    
				    $timeout(function(){
				    	$(".overlay.selected .fa-film,.fa-play").focus();
				    },15);
				}
			});
    	}
    };
};

directives.enter = function(){
	return {
		restrict: 'A',
		link:function(scope, element, attrs) {
	        element.bind("keypress", function(event) {
	        	if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.enter);
					});
					event.preventDefault();
	        	}
	        });
    	}
    };
};

u2bear.directive(directives);