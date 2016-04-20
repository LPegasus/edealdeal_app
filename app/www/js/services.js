angular.module('starter.services', [])

  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'img/max.png'
      }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'img/adam.jpg'
      }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'img/perry.png'
      }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'img/mike.png'
      }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  })

  .factory("LPConfig", function () {
    var cfg = {};
    cfg.env = {
      dev: {
        apiHost: "http://testapi.edealdeal.com",
        webHost: "http://testapp.edealdeal.com"
      }
    }

    cfg.env.current = cfg.env.dev;

    cfg.sourceImg = {
      "1": cfg.env.current.webHost + "/static/images/Am.png",
      "2": cfg.env.current.webHost + "/static/images/Au.png"
    }

    return cfg;
  })

  /**
   * header相关设置以及方法
   */
  .provider("LPNavBar", function () {
    var _defaultNavBar, _defaultOpts;
    var navBarNode = document.getElementById('navbar');
    var navBBBIsShown = !navBarNode.classList.contains('nav-noborder');
    _defaultOpts = {
      leftButtonIcon: 'ion-navicon',
      rightButtonIcon: 'ion-ios-cart',
      titleHtml: ''
    }
    function _config(opts) {
      angular.merge(_defaultOpts, opts);
    }

    function Header(opts, ctrl) {
      var options = angular.merge({}, _defaultOpts, opts || {});
      this.leftButtonIcon = options.leftButtonIcon || "";
      this.leftButtonCallback = options.leftButtonCallback || angular.noop;
      this.rightButtonIcon = options.rightButtonIcon || "";
      this.rightButtonCallback = options.rightButtonCallback || angular.noop;
      this.titleHtml = options.titleHtml || "";
      this.titleCallback = options.titleCallback || angular.noop;
      this.backText = options.backText || ""; //回退按钮的显示描述
    }


    var defmoreMenus = {
      "home": {
        "text": '一丢丢首页',
        "icon": 'ion-home',
        "callback": angular.noop
      },
      "share": {
        "text": '分享',
        "icon": 'ion-share',
        "callback": angular.noop
      },
      "favour": {
        "text": '收藏',
        "icon": 'ion-ios-heart',
        "callback": angular.noop
      }
    }
    return {
      $get: ['$rootScope', function ($root) {
        return {
          init: function (opts, ctrl) {
            if (arguments.length === 1) {
              ctrl = opts;
              opts = {};
            }
            var h = new Header(opts, ctrl);
            ctrl.header = h;
            return this;
          },

          /**
           * 设置默认行为：
           * 1，backbutton的显示描述为上一个view的title
           * 2，rightbutton设为默认MoreMenu
           */
          getMoreMenus: function (opts) {
            return angular.merge({}, defmoreMenus, opts);
          },
          hideBottomBorder: function () {
            if (navBBBIsShown) {
              navBarNode.classList.add('nav-noborder');
              navBBBIsShown = false;
            }
          },
          showBottomBorder: function () {
            if (!navBBBIsShown) {
              navBarNode.classList.remove('nav-noborder')
              navBBBIsShown = true;
            }
          }
        }
      }],
      config: _config
    }
  })


  /**
   * 接口相关方法
   */
  .provider('LPData', function () {
    var interfaces = ["checkData", "fetchData"]; //声明对外暴露的方法、属性
    var DEFAULT = {
      checkData: function (response) {
        if (response.status === 200 && response.data && response.data.data) {
          return response.data.data;
        } else {
          return false;
        }
      },
      fetchData: function (res) {
        var data;
        if (!(data = this.checkData(res))) return null;
        else {
          var tmp = _.pick(data, function (v, k, o) { return isNaN(v); }), arrRes = [];
          for (var i in tmp){
            arrRes.push(tmp[i]);
          }
          return arrRes;
        }
      }
    };

    var gl = {};
    return {
      $get: [function () {
        var output = {};
        interfaces.forEach(function (d, i) {
          output[d] = gl[d];
        });
        return output;
      }],
      config: function (opts) {
        for (var _interface in interfaces) {
          gl[interfaces[_interface]] = opts[interfaces[_interface]] || DEFAULT[interfaces[_interface]];
        }
      }
    }
  })

  .factory("LPRESTfulFactory", ['$http', 'LPStorage', '$q', function ($http, LPStorage, $q) {
    /**
     * @param  {String} url  接口地址
     * @param  {String} paramName  缓存参数的key名
     * @param  {String} resultName 缓存结果的key名
     * @param  {Boolean} disableCache 停用缓存
     * @param  {Object} httpConfig 配置请求
     */
    function RestfulModel(url, paramName, resultName, disableCache, httpConfig) {
      this.disableCache = !!disableCache;
      this.url = url;
      this.paramName = paramName;
      this.resultName = resultName;
      this.params = undefined;
      this.httpConfig = httpConfig || {};
    }

    var defaultConfig = {
      timeout: 30000,
      cache: false
    }

    RestfulModel.prototype.execute = function (httpConfig, success, fail, ctx, noCache) {
      var me = this;
      if (angular.isFunction(httpConfig)) {
        noCache = ctx;
        ctx = fail;
        fail = success;
        success = httpConfig;
      }
      var oldparam = LPStorage.getItem(this.paramName);
      var oldresult = LPStorage.getItem(this.resultName);
      if (oldparam && oldresult && JSON.stringify(oldparam.data) == JSON.stringify(this.params) && !oldresult.isTimeout() && !oldparam.isTimeout()) {
        var deferred = $q.defer();
        deferred.resolve(success.call(ctx, oldresult));
        return deferred.promise;
      }
      var _httpParams_ = angular.merge({ 'url': this.url }, defaultConfig, this.httpConfig, httpConfig);

      //GET方式配置的params和POST是不同的
      if (_httpParams_.method == 'GET') {
        LPStorage.setItem(this.paramName, _httpParams_.params);
      } else {
        LPStorage.setItem(this.paramName, _httpParams_.data);
      }

      this.params = _httpParams_;
      return $http(_httpParams_).then(function (res) {
        LPStorage.setItem(me.resultName, res.data);
        if (success) {
          return success.apply(ctx, arguments);
        }
      }, function () {
        if (fail) {
          return fail.apply(ctx, arguments);
        }
      });
    }

    return {
      makeAPI: function () {
        return new RestfulModel(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
      }
    };
  }])

  .factory("GoodsListModel", ["LPRESTfulFactory", 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + "/mall/getMallGoodsList", 'LIST_PARAM', 'LIST_RESULT', true, { method: "POST", data: { page_size: 10 } });
  }])

  .factory("GetBannerByCategoryModel", ["LPRESTfulFactory", 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + "/website/getBannerByCategory", "HOME_BANNER_PARAM", 'HOME_BANNER_RESULT', false);
  }])

  .factory("GetMenu2Model", ["LPRESTfulFactory", 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + "/website/getMenu2", "HOME_GETMENU2_PARAM", "HOME_GETMENU2_RESULT", true, { method: 'POST' });
  }])

  .factory('GetSPGoodsListModel', ['LPRESTfulFactory', 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + "/Spgoods/getSPGoodsList", "RUSH_GETSPGOODS_PARAM", "RUSH_GETSPGOODS_RESULT", true, { method: 'POST' });
  }])

  .factory('GetTOPCompareListModel', ['LPRESTfulFactory', 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + "/compare/getTOPCompareList", "ACTIVITY_GETTOPSCOMPARELIST_PARAM", "ACTIVITY_GETTOPSCOMPARELIST_RESULT", true, { method: 'POST' });
  }])

  .factory('GetTOPDiscountListModel', ['LPRESTfulFactory', 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + '/discount/getTOPDiscountList', 'ONSALE_GETTOPDISCOUNTLIST_PARAM', 'ONSALE_GETTOPDISCOUNTLIST_RESULT', true, { method: 'POST' });
  }])

  .factory('GetGoodsCommentModel', ['LPRESTfulFactory', 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + '/mall/getGoodsComment', 'DETAIL_GETGOODSCOMMENT_PARAMS', 'DETAIL_GETGOODSCOMMENT_RESULT', true, { method: 'GET' });
  }])

  .factory('GetGoodsDetailModel', ['LPRESTfulFactory', 'LPConfig', function (modelFactory, config) {
    return modelFactory.makeAPI(config.env.current.apiHost + '/mall/getGoodsDetail', 'DETAIL_GETGOODSDETAIL_PARAMS', 'DETAIL_GETGOODSDETAIL_RESULT', true, { method: 'POST' });
  }])
  /**
   * @desc 封装localStorage
   * localStorage所寸内容为StorageEntity类的实例
   * StorageEntity类有以下方法：
   *  1)jsonToString 将实例转换成json字符串并以用来存储和比较
   *  2)save 将实例存储在localStorage中
   *  3)isTimeout 是否已过期
   * LPStorage提供以下方法：
   *  1)setItem 将数据存入localStorage
   *  2)getItem 获取localStorage的数据
   *  3)clearTimeoutItem 清理过期数据
   *  4)removeItem 删除localStorage
   */
  .factory("LPStorage", [function () {
    var storage = localStorage;

    /**
     * @param  {string} name 名称
     * @param  {any} data 数据
     * @param  {number | date} timeoutafter 时效    数字表示多少毫秒后过期， date表示时间点开始过期，默认1分钟过期
     */
    function StorageEntity(name, data, timeoutafter) {
      var now = new Date();
      this.name = name;
      this.data = data;
      if (Object.prototype.toString.call(timeoutafter).toLowerCase().indexOf('date') > -1) {
        this.timeout = new Date(timeoutafter.valueOf());
      }
      else if (timeoutafter) {
        this.timeout = new Date(timeoutafter + now.valueOf());
      } else if (typeof timeoutafter === 'undefined') {
        this.timeout = new Date(now.valueOf() + 60 * 1000);//默认1分钟过期
      }
      this.createdAt = now;
    }

    var dateTimeConverter = {
      Date2String: function (obj) {
        var field, value;
        for (field in obj) {
          value = obj[field];
          if (Object.prototype.toString.call(value).toLowerCase().indexOf('date') > -1) {
            obj[field] = "/Date({0})/".replace("{0}", value.valueOf());
          } else if ((typeof value).toLowerCase().indexOf('object') > -1) {
            obj[field] = dateTimeConverter.Date2String(value);
          }
        }
        return obj;
      },
      String2Date: function (obj) {
        var LPDateRegExp = /^\/Date\((\d+)\)\/$/i, field, value;
        for (field in obj) {
          value = obj[field];
          if ((typeof value).toLowerCase() === 'string' && LPDateRegExp.test(value)) {
            value = value.replace(LPDateRegExp, "$1");
            obj[field] = new Date(parseInt(value));
          } else if ((typeof value).toLowerCase().indexOf('object') > -1) {
            obj[field] = dateTimeConverter.String2Date(value);
          }
        }
        return obj;
      }
    }


    StorageEntity.prototype.jsonToString = function () {
      return JSON.stringify(dateTimeConverter.Date2String({
        data: this.data,
        timeout: this.timeout,
        createdAt: this.createdAt
      }));
    }

    StorageEntity.prototype.save = function () {
      storage.setItem(this.name, this.jsonToString());
      return this;
    }

    /**
     * 是否过期
     */
    StorageEntity.prototype.isTimeout = function () {
      var now = new Date();
      return this.timeout && now >= this.timeout;
    }

    function getItem(name) {
      function timeReviver(v) {
        return dateTimeConverter.String2Date(v);
      }

      var str = storage.getItem(name);
      if (!str) return undefined;
      var item = JSON.parse(str, function (k, v) {
        var res = v;
        var filters = [timeReviver];
        filters.forEach(function (filter) {
          res = filter.call(null, res);
        });
        return res;
      });


      /**判断时间有效性 */
      if (item.timeout <= (new Date().valueOf())) {
        storage.removeItem(name);
        return null;
      }

      /**返回Data部分数据 */
      var entity = new StorageEntity(item.name, item.data, item.timeoutafter);

      return entity;
    }

    function setItem(name, data, timeoutafter) {
      var entity = new StorageEntity(name, data, timeoutafter);
      entity.save();
    }

    /**
     * 清理过期
     */
    function clearTimeoutItem() {
      var key;
      for (var i = 0; i < storage.length; i++) {
        key = storage.key(i);
        var entity = getItem(key);
        if (entity && entity.isTimeout()) {
          storage.removeItem(key);
        }
      }
    }

    return {
      setItem: setItem,
      getItem: getItem,
      clearTimeoutItem: clearTimeoutItem,
      removeItem: function (name) {
        storage.removeItem(name);
      }
    }
  }])

  .factory('LPRequestInterceptor', ['$q', '$ionicPopup', '$timeout',
    function ($q, $ionicPopup, $timeout) {
      return {
        request: function () {
          if (window.navigator.onLine === false) {
            var popup = $ionicPopup.alert({
              title: '连接失败',
              template: '您现在正处于离线状态，请先连接网络。'
            });
            $timeout(function () {
              popup.close();
            }, 3000);
          }
        }
      }
    }])
  ;
