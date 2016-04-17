// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'LPfilters'])

  .run(function ($ionicPlatform, $rootScope, $state) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    /*$rootScope.$on("$stateChangeSuccess", function(e, toState, toParams, fromState, fromParams) {
      console.log(toState);
      console.log(fromState);
    });*/
  })

  .config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", "LPDataProvider",
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, LPDataProvider) {
      $ionicConfigProvider.views.maxCache(20);
      $ionicConfigProvider.views.forwardCache(true);
      $ionicConfigProvider.backButton.icon("ion-ios-arrow-left");
      $ionicConfigProvider.platform.ios.tabs.style('standard');
      $ionicConfigProvider.platform.ios.tabs.position('bottom');
      $ionicConfigProvider.platform.android.tabs.style('standard');
      $ionicConfigProvider.platform.android.tabs.position('bottom');
      $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
      $ionicConfigProvider.platform.android.navBar.alignTitle('center');
      //$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-left');
      //$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-left');
      $ionicConfigProvider.platform.ios.views.transition('ios');
      $ionicConfigProvider.platform.android.views.transition('android');


      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider
        // setup an abstract state for the tabs directive
        .state('app', {
          url: '/app',
          abstract: true,
          views: {
            "": {
              templateUrl: 'templates/_layout.html'
            }
          }
        })

        // Each tab has its own nav history stack:

        .state('app.main', {
          url: '',
          views: {
            'app': {
              templateUrl: 'templates/app/index.html',
              controller: 'AppCtrl'
            }
          }
        })

        .state('app.rush', {
          url: '/rush',
          views: {
            'app-rush': {
              templateUrl: 'templates/rush/index.html',
              controller: 'RushCtrl',
              controllerAs: "rushCtrl"
            }
          }
        })
        .state('app.activity', {
          url: '/activity',
          views: {
            'app-activity': {
              templateUrl: 'templates/activity/index.html',
              controller: 'ActivityCtrl',
            }
          }
        })

        .state('app.activity.detail', {
          url: '/activity/{id}',
          views: {
            'app-activity@app': {
              templateUrl: 'templates/activity/detail.html',
              controller: 'ActivityDetailCtrl'
            }
          }
        })

        .state('app.onsale', {
          url: '/onsale',
          views: {
            'app-onsale': {
              templateUrl: 'templates/onsale/index.html',
              controller: 'OnsaleCtrl',
              controllerAs: "onsaleCtrl"
            }
          }
        })

        .state('app.account', {
          url: '/account',
          views: {
            'app-account': {
              templateUrl: 'templates/account/index.html',
              controller: 'AccountCtrl'
            }
          }
        })

        .state("app.detail", {
          url: '/detail/{id}',
          views: {
            "app": {
              templateUrl: 'templates/app/detail.html',
              controller: "AppDetailCtrl"
            }
          }
        })

        .state('app.account.shoppingList', {
          url: '/shoppinglist',
          views: {
            'app-account@app': {
              templateUrl: 'templates/account/shoppinglist.html',
              controller: 'AccountShoppingCtrl',
              controllerAs: 'list'
            }
          }
        })
        ;
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app');

    }])

  .config(["LPDataProvider", function (LPData) {
    LPData.config({
      checkData: function (response) {
        return response.status === 200 && response.data
          && response.data.status === 1 && response.data.data;
      }
    });
  }])

  //转x-www-form-urlencoded 不支持复杂类型数据，因为不同后台对于复杂类型数据的解析格式不一样
  .config(['$httpProvider', function ($hp) {
    $hp.useApplyAsync(true);
    $hp.defaults.transformRequest.push(function (d) {
      var req;
      if (d) {
        d = JSON.parse(d);
        for (var key in d) {
          if (req) {
            req += '&' + key + '=' + d[key];
          } else {
            req = key + '=' + d[key];
          }
        }
      }
      return req;
    });

    $hp.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  }])
  ;
