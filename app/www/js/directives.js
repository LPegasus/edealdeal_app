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

        $scope.timeLeft = function () {
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

  .directive('lpBuyBar', [function () {
    return {
      restrict: 'E',
      scope: true,
      require: '^ionNavView',
      template: '' +
      '<div class="bar bar-footer bar-buy stable-bg">' +
      '<button on-tap="check()"><i class="icon ion-ios-cart"></i><br/>购物车</button>' +
      '<button on-tap="add()" id="add-to-cart">加入购物车</button>' +
      '<button on-tap="buy()" class="assertive-bg" id="go-to-pay">立即购买</button>' +
      '</div>',
      link: function (scope, el, attrs){
        var contentEl = el.parent().find("ion-content").addClass('has-bar-buy');
      },
      controller: ['$scope', '$attrs', '$element', 'LPBuySvr', function($scope, $attrs, $el, buySvr){
        $scope.buy = buySvr.buy;
        $scope.add = buySvr.add;
        $scope.check = buySvr.check;
      }]
    }
  }])
  ;