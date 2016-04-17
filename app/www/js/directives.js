angular.module('starter.directives', ['starter.services'])
  .directive('moreMenus', [function () {
    return {
      restrict: "EA",
      templateUrl: "templates/ui/more-menus.html",
      scope: {
        menuList: "="
      },
      link: function ($scope, $element, $attrs) {
      }
    }
  }])

  .directive('lpTimer', ['$http', '$interval', function ($http, $interval) {
    var SECOND = 1000,
      MINUTE = 60 * SECOND,
      HOUR = 60 * MINUTE,
      DAY = 24 * HOUR;
    return {
      restrict: 'E',
      scope: {
        interval: '@?',
        baseTime: '@',
        endTime: '@'
      },
      template: function () {
        return '<div class="lp-timer">{{timeLeft() | lpTimeSpan}}</div>'
      },
      controller: ['$scope', '$element', '$attrs', function ($scope, $el, $attrs) {
        var promise = $interval(function () {
          $scope.now = new Date(parseInt($scope.now.valueOf()) + parseInt($scope.interval));
          if ($scope.now.valueOf() >= $scope.endTime) {
            $interval.cancel(promise);
          }
        }, $scope.interval);
        
        $scope.timeLeft = function(){
          return $scope.endTime - $scope.now;
        }
      }],
      link: function (scope, el, attrs) {
        scope.now = scope.baseTime || new Date();
        if (!scope.interval) scope.interval = 1000;
        scope.endTime = parseInt(scope.endTime);
      }
    }
  }])

  ;