(function() {
      'use strict';
      var u2bearPlayerBar = angular.module('u2bear.playerBar.directives',[]);

      u2bearPlayerBar.directive('playerContainer', PlayerContainer);
      function PlayerContainer(){
            return {
                  restrict: 'E',
                  template:'<video id="player" class="video-js vjs-default-skin" controls preload="none" width="" height=""' +
                  'poster="img/u2bearFlat.png" data-setup="{}">' +
                  '<source id="source" src="" type="video/mp4" />' +
                  '</video>',
                  link:function(scope, element, attrs) {
                  	videojs('player').on('ended', function(){
                  		scope.$eval(attrs.onEnd);
                  		scope.$apply();
                  	});
                  	// todo: move this to next video and just in the case of end of videos
                  	$('#search').focus();
                  }
            };
	}
})();