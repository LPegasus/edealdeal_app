angular.module('starter.controllers', ['ngSanitize'])

  .controller('DashCtrl', function ($scope) { })

  .controller('ChatsCtrl', function ($scope, Chats, $ionicHistory) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', ['$scope', '$stateParams', 'Chats', '$ionicHistory', function ($scope, $stateParams, Chats, $ionicHistory) {
    $scope.chat = Chats.get($stateParams.chatId);
    console.log($ionicHistory.backView());
  }])

  .controller('AccountCtrl', ['$scope', '$ionicHistory', '$injector', function ($scope, $ionicHistory, $ioc) {
    var me = this;
    var $timeout = $ioc.get("$timeout");
    var $state = $ioc.get('$state');
    var ionicBar = $ioc.get("$ionicNavBarDelegate");
    var LPNavBar = $ioc.get('LPNavBar');

    LPNavBar.init({
      backText: ""
    }, me);

    this.settings = {
      enableFriends: true
    };
    me.settingActive = function (b) {
      me.settingActivated = b;
      $timeout(function () {
        me.settingActivated = false;
      }, 200);
    }

    me.log = function () {
      console.log(arguments[0]);
    }
    me.userId = 1;

    //查看全部订单
    me.goToShoppingList = function () {
      $state.go(".shoppingList", { id: me.userId });
    }
  }])

  .controller('AccountShoppingCtrl', ['$scope', '$injector', function ($scope, $ioc) {
    var $ionicHistory = $ioc.get("$ionicHistory");
    var $state = $ioc.get('$state');
    var $http = $ioc.get('$http');
    var $timeout = $ioc.get('$timeout');
    var LPNavBar = $ioc.get('LPNavBar');
    var me = this;

    me.moreMenus = LPNavBar.getMoreMenus({
      home: {
        callback: function () {
          $state.go('app.main');
          me.showMenus = false;
        }
      }
    });
    LPNavBar.init({
      rightButtonIcon: "ion-android-more-vertical",
      rightButtonCallback: function () {
        me.showMenus = true;
        $timeout(function () {
          if (me.showMenus)
            me.showMenus = false;
        }, 1500);
      }
    }, me);
  }])

  /**
   * 首页
   */
  .controller('AppCtrl', ['LPNavBar', '$window', '$timeout', '$location', '$injector', '$scope', '$rootScope',
    function (LPNavBar, $window, $timeout, $location, $injector, $scope, $rootScope) {
      //依赖注入
      var $state = $injector.get("$state");
      var $stateParams = $injector.get("$stateParams");
      var $ionicHistory = $injector.get("$ionicHistory");
      var $ionicLoading = $injector.get('$ionicLoading');
      var ionicTabs = $injector.get("$ionicTabsDelegate");
      var LPData = $injector.get("LPData");
      var cfg = $injector.get("LPConfig");
      var slideBoxDelegate = $injector.get('$ionicSlideBoxDelegate');
      var $ScrollDelegate = $injector.get("$ionicScrollDelegate");
      var scrollHandler = $ScrollDelegate.$getByHandle('mainScroll');
      var goodsListModel = $injector.get('GoodsListModel');
      var getMenu2Model = $injector.get('GetMenu2Model');
      var banner = $injector.get('GetBannerByCategoryModel');
      var hasMoreGoods = true;
      var isPageHide = false;
      $scope.Products = [];
      $ionicHistory.currentTitle("首页");

      /**
       * 所有跳转到hybrid页面必须从app.default开始应用
       * 以g=state来跳转到相应页面
       */
      var paramsG = $location.search().g;
      if (paramsG) {
        try {
          $state.go(paramsG);
        } catch (e) {
          $location.url("/app");
          return;
        }
      }

      LPNavBar.init({
        leftButtonCallback: function () { console.log('left'); },
        rightButtonCallback: function () { console.log('right'); },
        navBarBottomBorder: false
      }, $scope).hideBottomBorder();
      var $http = $injector.get('$http');
      var $ionicPopup = $injector.get('$ionicPopup');
      $ionicLoading.show({
        template: 'Loading...'
      });

      $scope.clearSearch = function () {
        $scope.searchKeywords = null;
      }

      $scope.$on("$ionicView.beforeEnter", function () {
        ionicTabs.showBar(true);
      });

      $scope.$on('$ionicView.afterEnter', function () {
        isPageHide = false;
        $scope.scrolling();
      });

      $scope.scrolling = function () {
        if (isPageHide) return;
        var pos = scrollHandler.getScrollPosition();
        if (pos && pos.top > 43) {
          LPNavBar.showBottomBorder();
        } else {
          LPNavBar.hideBottomBorder();
        }
      }

      $scope.$on('$ionicView.afterLeave', function () {
        LPNavBar.showBottomBorder();
        isPageHide = true;
      });

      banner.execute({
        data: {
          categoryid: "4",
          Source: 'mobile'
        },
        method: 'POST'
      }, function (res) {
        var data = res.data.data;
        if (data && data.count) {
          var bannerAds = [];
          for (var _i = 0; _i < data.count; _i++) {
            data[_i].b_picture = cfg.env.current.webHost + data[_i].b_picture;
            bannerAds.push(data[_i]);
          }
          $scope.bannerAds = bannerAds;
          requestAnimationFrame(function () {
            var slideBoxHandler = slideBoxDelegate.$getByHandle('sb');
            slideBoxHandler.update();
            slideBoxHandler.loop(true);
          });
        }
      });
      var currentPage = 1, pageSize = 10;
      $scope.getMoreProducts = function () {
        goodsListModel.execute({ data: { page: currentPage++, page_size: pageSize } }, function (res) {
          var data = res.data;
          if (data) {
            $scope.Products = $scope.Products.concat(_.filter(_.map(data.data, function (d) {
              d.sourceImg = cfg.sourceImg[d.source];
              d.img_url = cfg.env.current.webHost + d.img_url;
              d.isSaleOut = !(d.stock > 0 || d.delivery_way != '国内现货');
              return d;
            }), function (d) { return typeof d == 'object'; }));
            hasMoreGoods = (data.data.goods_num == pageSize);
          } else {
            hasMoreGoods = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }

      /* 获取分类项 */
      var c_parent = 179;
      $scope.moreMenus = [];
      getMenu2Model.execute({ data: { c_parent: 179 } }, function (res) {
        var data = res.data;
        if (data.data) {
          $scope.moreMenus = data.data[c_parent].child.map(function (d) {
            d.c_index_pic = cfg.env.current.webHost + d.c_index_pic;
            d.href = cfg.env.current.webHost + "/index/shop_list/" + d.id + "?name=" + d.c_name + "&id=" + d.id;
            return d;
          });
        }
      })

      $scope.$on('$stateChangeSuccess', function () {
        $scope.getMoreProducts();
      });

      $scope.hasMoreGoods = function () {
        return hasMoreGoods;
      }


      $scope.cfg = cfg;
    }])

  /**
   * 产品详情页
   */
  .controller('AppDetailCtrl', ["$injector", "$scope", "$location", function ($injector, $scope, $location) {
    var $ionicHistory = $injector.get("$ionicHistory");
    var $state = $injector.get("$state");
    var $http = $injector.get("$http");
    var $timeout = $injector.get("$timeout");
    var history = $ionicHistory.viewHistory();
    var LPData = $injector.get("LPData");
    var cfg = $injector.get('LPConfig');
    var params = $injector.get("$stateParams");
    var ionicTabs = $injector.get("$ionicTabsDelegate");
    var LPNavBar = $injector.get('LPNavBar');
    var me = this;

    $scope.$on('$ionicView.beforeEnter', function () {
      var leftButton = '';
      if (!$ionicHistory.backView()) {
        leftButton = 'ion-ios-arrow-left';
      }
      LPNavBar.init({
        leftButtonIcon: leftButton,
        leftButtonCallback: function () {
          $ionicHistory.nextViewOptions({
            historyRoot: true
          });
          console.log($location);
          $state.go('app.main');
        },
        rightButtonIcon: "ion-android-more-horizontal",
        navBarBottomBorder: false
      }, me).showBottomBorder();
    });

    //获取商品详情$state.params.id
    $http.post(cfg.env.current.apiHost + "/mall/getGoodsDetail", { "goods_id": params.id }).then(function (res) {
      var data = LPData.checkData(res);
      if (data["0"]) {
        $scope.goodsDetail = data["0"];
        $scope.goodsDetail.img_url = cfg.env.current.webHost + $scope.goodsDetail.img_url;
      }
    });

    $scope.$on("$ionicView.beforeEnter", function () {
      ionicTabs.showBar(false);
    });
  }])

  .controller('RushCtrl', ['$injector', '$scope',
    function ($ioc, $scope) {
      //依赖注入
      var $state = $ioc.get("$state");
      var $ionicHistory = $ioc.get("$ionicHistory");
      var $ionicLoading = $ioc.get('$ionicLoading');
      var ionicTabs = $ioc.get("$ionicTabsDelegate");
      var LPData = $ioc.get("LPData");
      var cfg = $ioc.get("LPConfig");
      var slideBoxDelegate = $ioc.get('$ionicSlideBoxDelegate');
      var LPNavBar = $ioc.get('LPNavBar');
      var $http = $ioc.get('$http');
      var $ionicPopup = $ioc.get('$ionicPopup');
      var bannerModel = $ioc.get('GetBannerByCategoryModel');
      var goodsModel = $ioc.get('GetSPGoodsListModel');
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: false
      });

      LPNavBar.init({
        leftButtonCallback: function () { console.log('left'); },
        rightButtonCallback: function () { console.log('right'); },
        navBarBottomBorder: false
      }, $scope);
      /*$ionicLoading.show({
        template: 'Loading...'
      });*/
      $scope.banners = [];
      $scope.goods = [];
      $scope.testTimerNow = Date.now();

      bannerModel.execute({ method: 'POST', data: { categoryid: 3, Source: 'mobile' } }, function (res) {
        if (res.data && res.data.data) {
          var data = res.data.data;
          for (var n in data) {
            if (isNaN(data[n])) {
              $scope.banners.push({
                name: data[n].b_name,
                url: data[n].b_url,
                id: data[n].id,
                imgSrc: cfg.env.current.webHost + data[n].b_picture
              });
            }
          }
          requestAnimationFrame(function () {
            var slideBoxHandler = slideBoxDelegate.$getByHandle('sb');
            slideBoxHandler.update();
            slideBoxHandler.loop(true);
          });
        }
      }, function (err) { });

      function getGoodsList() {
        var pageIdx = 1;
        goodsModel.execute({ data: { page: pageIdx++, page_size: 10 } }, function (res) {
          if (res.data.data) {
            for (var i = 0, d; d = res.data.data[i++];) {
              $scope.goods.push({
                id: d.id,
                imgUrl: cfg.env.current.webHost + d.img_url,
                title: d.title,

              });
            }
          } else {
            pageIdx--;
          }
        });
      }
    }])

  .controller('ActivityCtrl', ['$scope', '$injector',
    function ($scope, $ioc) {
      var $state = $ioc.get("$state");
      var $ionicHistory = $ioc.get("$ionicHistory");
      var $ionicLoading = $ioc.get('$ionicLoading');
      var ionicTabs = $ioc.get("$ionicTabsDelegate");
      var cfg = $ioc.get("LPConfig");
      var slideBoxDelegate = $ioc.get('$ionicSlideBoxDelegate');
      var LPNavBar = $ioc.get('LPNavBar');
      var $http = $ioc.get('$http');
      var $ionicPopup = $ioc.get('$ionicPopup');
      var bannerModel = $ioc.get('GetBannerByCategoryModel');
      var goodsModel = $ioc.get('GetTOPCompareListModel');
      $scope.banners = [];
      $scope.goods = [];
      var hasMoreGoods = true;
      var page = 1;
      LPNavBar.init({
        leftButtonCallback: function () { console.log('left'); },
        rightButtonCallback: function () { console.log('right'); },
        navBarBottomBorder: false
      }, $scope);

      bannerModel.execute({ method: 'POST', data: { categoryid: 2, Source: 'mobile' } }, function (res) {
        window.tmp = res;
        if (res.data && res.data.data) {
          var data = res.data.data;
          for (var n in data) {
            if (isNaN(data[n])) {
              $scope.banners.push({
                name: data[n].b_name,
                url: data[n].b_url,
                id: data[n].id,
                imgSrc: cfg.env.current.webHost + data[n].b_picture
              });
            }
          }
          requestAnimationFrame(function () {
            var slideBoxHandler = slideBoxDelegate.$getByHandle('sb');
            slideBoxHandler.update();
            slideBoxHandler.loop(true);
          });
        }
      }, function (err) { });

      $scope.getMoreProducts = function () {
        goodsModel.execute({ data: { page: page++, page_size: 10 } }, function (res) {
          var data = res.data.data;
          if (data) {
            for (var d in data) {
              if (!isNaN(data[d])) continue;
              $scope.goods.push({
                id: data[d].id,
                imgSrc: cfg.env.current.webHost + data[d].img_url
              });
            }
            if (data.compare_num < 10) {
              hasMoreGoods = false;
            }
          } else {
            hasMoreGoods = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }

      $scope.$on('$stateChangeSuccess', function () {
        $scope.getMoreProducts();
      });
      $scope.moreData = function () {
        return hasMoreGoods;
      }
    }])

  .controller('ActivityDetailCtrl', ['$scope', '$ioc',
    function ($scope, $ioc) {

    }])

  .controller('OnsaleCtrl', ['$scope', '$injector',
    function ($scope, $ioc) {
      var $state = $ioc.get("$state");
      var $ionicHistory = $ioc.get("$ionicHistory");
      var $ionicLoading = $ioc.get('$ionicLoading');
      var ionicTabs = $ioc.get("$ionicTabsDelegate");
      var cfg = $ioc.get("LPConfig");
      var slideBoxDelegate = $ioc.get('$ionicSlideBoxDelegate');
      var LPNavBar = $ioc.get('LPNavBar');
      var $http = $ioc.get('$http');
      var $ionicPopup = $ioc.get('$ionicPopup');
      var bannerModel = $ioc.get('GetBannerByCategoryModel');
      var goodsModel = $ioc.get('GetTOPDiscountListModel');
      $scope.banners = [];
      $scope.goods = [];
      var hasMoreGoods = true;
      var page = 1;
      var pageSize = 10;

      LPNavBar.init({
        leftButtonCallback: function () { console.log('left'); },
        rightButtonCallback: function () { console.log('right'); },
        navBarBottomBorder: false
      }, $scope);

      bannerModel.execute({ method: 'POST', data: { categoryid: 1, Source: 'mobile' } }, function (res) {
        if (res.data && res.data.data) {
          var data = res.data.data;
          for (var n in data) {
            if (isNaN(data[n])) {
              $scope.banners.push({
                name: data[n].b_name,
                url: data[n].b_url,
                id: data[n].id,
                imgSrc: cfg.env.current.webHost + data[n].b_picture
              });
            }
          }
          requestAnimationFrame(function () {
            var slideBoxHandler = slideBoxDelegate.$getByHandle('sb');
            slideBoxHandler.update();
            slideBoxHandler.loop(true);
          });
        }
      });

      var skipRefImg = function (url) {
        var regProtocal = /\/\//i;
        if (regProtocal.test(url)) {
          return url;
        } else {
          return cfg.env.current.webHost + url;
        }
      }

      $scope.getMoreProducts = function () {
        goodsModel.execute({ data: { page: page++, page_size: pageSize } }, function (res) {
          var data = res.data.data;
          if (data) {
            for (var n in data) {
              if (isNaN(data[n])) {
                $scope.goods.push({
                  imgSrc: skipRefImg(data[n].img_url),
                  title: data[n].title,
                  desc: data[n].description,
                  price: data[n].discount,
                  id: data[n].id,
                  favCnt: data[n].fav_num
                });
              }
            }
            hasMoreGoods = data.discount_num == pageSize;
          } else {
            hasMoreGoods = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      }

      $scope.moreData = function () {
        return hasMoreGoods;
      }
    }])
  ;
