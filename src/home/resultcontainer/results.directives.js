(function() {
      'use strict';
      var u2bearResults = angular.module('u2bear.results.directives',[]);
      
      u2bearResults.directive('scroll', Scroll);
      function Scroll(){
            return {
                  restrict: 'A',
                  scope: '=resultsCtrl.stoppedLoading',
                  link:function(scope, element, attrs) {
                        element.bind('scroll', function() {
                              var jElement = $(element);
                              if (jElement[0].scrollHeight - jElement.scrollTop() <= jElement.outerHeight() + 350){
                                    scope.$apply(function (){
                                          scope.$eval(attrs.scroll);
                                    });
                              }
                        });
                  }
          };
      }

      u2bearResults.directive('enter', Enter);
      function Enter(){
            return {
                  restrict: 'A',
                  link:function(scope, element, attrs) {
                    element.bind('keypress', function(event) {
                        if(event.which === 13) {
                              scope.$apply(function (){
                                    scope.$eval(attrs.enter);
                              });
                              event.preventDefault();
                        }
                    });
                  }
            };
      }
})();