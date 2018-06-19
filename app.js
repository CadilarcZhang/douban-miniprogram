// var pages = getCurrentPages() //获取加载的页面
App({

  globalData: {
    g_isPlayingMusic: false,
    g_currentMusicPostId: null,
    appid: "wxa7e52cd68e968cc6",
    secret: "ed324abbd116943a4264e7922ab9b631",
    userInfo: "",
    // doubanBaseUrl: "http://t.yushu.im"
    // doubanBaseUrl: "http://zxt.weixin.tunnel.qydev.com/wechat-access",
    // doubanBaseUrl: "http://zxtwechat.nat100.top/wechat-access",
    // doubanBaseUrl: "https://thunisoftxcx.mynatapp.cc/wechat-access"
    // doubanBaseUrl: "https://7dcytofo.qcloud.la/wechat-access"
    doubanBaseUrl: "https://zxt.mynatapp.cc/wechat-access",
    accessTokenUrl: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET",
    templateSendUrl: "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=ACCESS_TOKEN"
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function (options) {
    // console.log("onLaunch");
    // console.log(options);//包括获取场景值（确定进入小程序的入口方式）！
    var that = this;
    wx.checkSession({
      success: () => {
        // console.log("用户处于登录态");
      },
      fail: () => {
        console.log("用户登录态失效");
        // 登录
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            var code = res.code; // 复制给变量就可以打印了，醉了
            if (res.code) {
              // wx.getUserInfo({
              //   // 该变量设成true，必须要求已经登录且处于登录态才能获取用户信息；该变量设成false，只能获取到明文信息，不要求处于登录态
              //   withCredentials: true,
              //   // 用户同意授权获取用户信息
              //   success: function (res) {
              //     // console.log({ encryptedData: res.encryptedData, iv: res.iv, code: code });
              //     // userInfo 只存储个人的基础数据
              //     // console.log(res); // 用户同意授权且处于登录状态时，会获取到用户的明文和加密信息！
              //     wx.setStorageSync('userInfo', res.userInfo);
              //     // 只获取openid的话，自己就可以
              //     that.getOpenid(code);
              //   },
              //   // 用户拒绝授权
              //   fail: function (res) {
              //     console.log(res);
              //   }
              // })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        });
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log(res);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // wx.getUserInfo({
          //   success: res => {
          //     // 可以将 res 发送给后台解码出 unionId
          //     this.globalData.userInfo = res.userInfo;
          //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          //     // 所以此处加入 callback 以防止这种情况
          //     if (this.userInfoReadyCallback) {
          //       this.userInfoReadyCallback(res)
          //     }
          //   }
          // })
        }
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: (res) => {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              // wx.startRecord();
            },
            fail: (res) => {
              console.log("拒绝授权！");
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                },
                fail: (res) => {
                  console.log(res);
                }
              });
            }
          })
        }
        // if (!res.authSetting["scope.werun"]) {
        //   wx.showModal({
        //     title: '提示',
        //     content: '获取微信运动步数，需要开启计步权限',
        //     success: function(res) {
        //       if (res.confirm) {
        //         wx.openSetting({
        //           success: function(res) {},
        //           fail: function(res) {},
        //           complete: function(res) {},
        //         })
        //       }
        //     },
        //     fail: function(res) {},
        //     complete: function(res) {},
        //   })
        // }
        if (!res.authSetting['scope.userInfo', 'scope.userLocation', 'scope.werun', 'scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: function (res) {
              wx.showToast({
                title: '成功授权!',
              })
            },
            fail: function (res) {
              console.log("拒绝授权！");
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                },
                fail: (res) => {
                  console.log(res);
                }
              });
            },
            complete: function (res) { },
          })
        }
        if (!res.authSetting['scope.userInfo', 'scope.userLocation', 'scope.werun', 'scope.camera']) {
          wx.openSetting({});
        }
      }
    })
  },

  // 自己获取openid和session_key,只有前提：微信开放平台帐号必须已完成开发者资质认证后，才可以获取用户的unionid!
  // 微信提供的接口，其中appid和secret都是放在globalData中的
  getOpenid: function (code) {
    var that = this;
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + that.globalData.appid + '&secret=' + that.globalData.secret +
      '&js_code=' + code + '&grant_type=authorization_code',
      data: {},
      method: 'GET',
      success: function (res) {
        var obj = {};
        console.log(res.data);
        obj.openid = res.data.openid;
        // console.log(res.data.openid);
        obj.expires_in = Date.now() + res.data.expires_in;
        obj.session_key = res.data.session_key;
        wx.setStorageSync('openid', obj.openid);// 存储openid  
      }
    });
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    // console.log("onShow");
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    // console.log("onHide");
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    // console.log("onError");
  }
})
