angular.module('starter.controllers', ['ngSanitize'])

  .controller('DashCtrl', function ($scope) { })

  .controller('ChatsCtrl', ['$scope', 'Chats', '$ionicHistory', function ($scope, Chats, $ionicHistory) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    var me = this;
    /*var $timeout = $ioc.get("$timeout");
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
    }*/
    me.userId = 1;

    //查看全部订单
    me.goToShoppingList = function () {
      $state.go(".shoppingList", { id: me.userId });
    }
    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  }])

  .controller('ChatDetailCtrl', ['$scope', '$stateParams', 'Chats', '$ionicHistory', function ($scope, $stateParams, Chats, $ionicHistory) {
    $scope.chat = Chats.get($stateParams.chatId);
    console.log($ionicHistory.backView());
  }])

  .controller('AccountCtrl', ['$scope', '$ionicHistory', function ($scope, $ionicHistory) {
    var me = this;
    /*var $timeout = $ioc.get("$timeout");
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
    }*/
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
      var slideBoxHandler = slideBoxDelegate.$getByHandle('sb');
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
        leftButtonCallback: function () { },
        rightButtonCallback: function () { },
        navBarBottomBorder: false
      }, $scope).hideBottomBorder();
      var $http = $injector.get('$http');
      var $ionicPopup = $injector.get('$ionicPopup');

      $scope.clearSearch = function () {
        $scope.searchKeywords = null;
      }

      $scope.$on("$ionicView.beforeEnter", function () {
        ionicTabs.showBar(true);
      });

      $scope.$on('$ionicView.afterEnter', function () {
        isPageHide = false;
        $scope.scrolling();
        slideBoxHandler.start();
      });

      $scope.$on('$ionicView.afterLeave', function () {
        LPNavBar.showBottomBorder();
        isPageHide = true;
        slideBoxHandler.stop();
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
          $timeout(function () {
            slideBoxHandler.update();
            slideBoxHandler.loop(true);
            if (bannerAds.length < 3) {
              document.querySelector('[delegate-handle="sb"]').querySelector('.slider-pager').remove();
            }
          }, 500);
        }
        window.s = slideBoxHandler;
      });
      var currentPage = 1, pageSize = 10;
      $scope.getMoreProducts = function () {
        var execPromise = goodsListModel.execute({ data: { page: currentPage++, page_size: pageSize } }, function (res) {
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
      ionic.requestAnimationFrame(function () {
        $scope.getMoreProducts();
      });
    }])

  /**
   * 产品详情页
   */
  .controller('AppDetailCtrl', ['LPImgLoader', "$injector", "$scope", "$location", '$q', function (LPImgLoader, $injector, $scope, $location, $q) {
    var $ionicHistory = $injector.get("$ionicHistory");
    var $state = $injector.get("$state");
    var $timeout = $injector.get("$timeout");
    var history = $ionicHistory.viewHistory();
    var LPData = $injector.get("LPData");
    var cfg = $injector.get('LPConfig');
    var params = $injector.get("$stateParams");
    var ionicTabs = $injector.get("$ionicTabsDelegate");
    var LPNavBar = $injector.get('LPNavBar');
    var commentModel = $injector.get('GetGoodsCommentModel');
    var goodDetailModel = $injector.get('GetGoodsDetailModel');
    var pop = $injector.get('$ionicPopup');
    var sameGoodsModel = $injector.get('GetSameCategoryGoodsListModel');
    var scrollHandler = $injector.get('$ionicScrollDelegate').$getByHandle('detailScroll');
    var me = this;
    var pageDOM1;
    var pageDOM2;
    var firstPageHeight;
    var secondPageHeight;
    var isFirstPage = true;
    var viewPort;
    var viewContainer;
    window.contentHeight;
    window.isEdge = false;
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
          $state.go('app.main');
        },
        rightButtonIcon: "ion-android-more-horizontal",
        navBarBottomBorder: false
      }, me).showBottomBorder();
      ionicTabs.showBar(false);
      var p1 = commentModel.execute({ params: { goods_id: params.id } },
        function (res) {
          var data = LPData.fetchData(res);
          me.comments = data.map(function (d) {
            if (d.header) {
              d.header = cfg.env.current.webHost + d.header;
            } else {
              d.header = 'http://m.edealdeal.com/static/images/initial_head.png';
            }
            return d;
          });
        }
      );
      var p2 = goodDetailModel.execute({ params: { goods_id: params.id } },
        function (res) {
          var data = LPData.fetchData(res);
          if (!data) {
            var p = pop.alert({
              template: "获取商品数据失败。<br />返回前一页。",
              okText: '返回',
              cssClass: 'lp-pop-container no-header'
            });
            p.then(function () {
              $state.go('app.main');
            });
            $timeout(function () {
              if (p.close) p.close();
            }, 1500);
            return;
          } else {
            data[0].img_url = cfg.env.current.webHost + data[0].img_url;
            $scope.goodsDetail = data[0];
            me.moreImgs = $scope.goodsDetail.description.match(/src=(['"]).+?\1/ig).map(function (d) {
              var src = d.substring(5, d.length - 1);
              return cfg.env.current.webHost + src;
            });
          }
        }
      );

      var p3 = sameGoodsModel.execute({ params: { page: 1, goods_id: params.id } }, function (res) {
        var data = LPData.fetchData(res);
        me.sameGoods = data.map(function (d) {
          d.img_url = cfg.env.current.webHost + d.img_url;
          return _.pick(d, 'img_url', 'current_price', 'id', 'title');
        });
      });

      return $q.all([p1, p2, p3]).then(function () {
        //第一屏的图片高度必须确定，否则无法获取正确首屏高度
        return $timeout(reloadHeight, 100).then(function () {
          LPImgLoader.init()
            .onAllLoaded(function(imgs){
              reloadHeight();
            });
          //下拉事件绑定
          var originY1 = 0, originY2 = stats[1].translateY, shouldSwitch = false, startY;
          ionic.onGesture('dragstart', function (e) {
            startY = null;
            if (!isEdge) return;
          }, pageDOM1);
          
          ionic.onGesture('dragend', function(e) {
            if (!shouldSwitch && isEdge) {
              viewContainer.classList.add('ease-in-out');
              if (isFirstPage && e.gesture.delta)
                viewContainer.style.transform = "translateY(" + originY1 + 'px)';
              else
                viewContainer.style.transform = 'translateY(' + originY2 + 'px)';
            } else if (shouldSwitch && isEdge) {
              switchPage();
              shouldSwitch = false;
            }
          }, pageDOM1);

          //上拉事件绑定
          ionic.onGesture('dragdown', function (e) {
            if (e.gesture.distance > 300 && !isFirstPage) {
              switchPage(0);
            }
          }, pageDOM2);
          
          ionic.onGesture('dragstart', checkIfEdge, viewContainer)
        });
      });
    });
    
    function checkIfEdge(e) {
      window.isEdge = isFirstPage && scrollHandler.getScrollPosition().top - 2 + contentHeight - firstPageHeight >= -2
        || !isFirstPage && scrollHandler.getScrollPosition().top == 0;
    }
    
    function setContainerTranslateY(v){
      viewContainer.style.transform = 'translateY(' + v + 'px)';
    }

    function reloadHeight() {
      pageDOM1 = document.getElementById('goods-detail-view1');
      pageDOM2 = document.getElementById('goods-detail-view2');
      var rect1 = pageDOM1.getBoundingClientRect();
      var rect2 = pageDOM2.getBoundingClientRect();
      firstPageHeight = rect1.bottom - rect1.top;
      secondPageHeight = rect2.bottom - rect2.top;
      var pos = document.getElementById('detail-view-content').getBoundingClientRect();
      contentHeight = pos.bottom - pos.top;
      viewPort = document.getElementById('detail-viewport');
      viewContainer = document.getElementById('detail-container');
      window.firstPageHeight = firstPageHeight;
      window.secondPageHeight = secondPageHeight;
      stats = [
        //两种切换后的初始状态
        //viewHeight：容器的可滚动高度
        //translateY：内容页面的偏移高度
        //scrollY：滚动后的滚动条位置
        {
          viewHeight: firstPageHeight,
          translateY: 0,
          scrollY: firstPageHeight - contentHeight,
          scroll: 'Bottom'
        },
        {
          viewHeight: secondPageHeight,
          translateY: -firstPageHeight - 1,
          scrollY: 0,
          scroll: 'Top'
        }
      ];
      if (isFirstPage) {
        targetStat = stats[0];
      } else {
        targetStat = stats[1];
      }

      viewPort.style.height = targetStat.viewHeight + 'px';
    }

    var stats, targetStat;
    function switchPage(idx) {
      if (!isNaN(idx)) {
        targetStat = stats[idx];
      } else if (isFirstPage) {
        targetStat = stats[1];
      } else {
        targetStat = stats[0];
      }

      viewPort.style.height = targetStat.viewHeight + 'px';
      /*document.getElementById('detail-view-content')
        .querySelector('.scroll').style.transform = 'translate3d(0,-' + targetStat.scrollY + 'px,0)';*/
      scrollHandler.freezeAllScrolls(true);//锁定滚动条
      viewContainer.classList.add('ease-in-out');
      viewContainer.style.transform = 'translateY(' + (targetStat.scroll == 'Bottom' ? contentHeight : - contentHeight) + 'px)';
      //scrollHandler['scroll' + targetStat.scroll](false);//设置切换后的滚动条位置

      isFirstPage = !isFirstPage;

    }

    ionic.on('transitionend', onTransitionEnd, viewContainer);

    function onTransitionEnd(e) {
      if (!isEdge) return;
      scrollHandler.freezeAllScrolls(false);//解锁滚动条
      viewContainer.classList.remove('ease-in-out');
      viewContainer.style.transform = 'translateY(' + targetStat.translateY + 'px)';
      scrollHandler['scroll' + targetStat.scroll](false);//设置切换后的滚动条位置
    }

    var $ionicPosition = $injector.get('$ionicPosition');
    window.getPosition = function (dom) {
      return $ionicPosition.position(dom);
    }
    window.switchPage = switchPage;
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
