const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    miniprogram: "微信小程序",
    userInfo: "",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
    // canIUse: false
  },

  onContainerTap() { //ES6函数写法
    //父子级页面之间的跳转
    // wx.navigateTo({
    //   url: '/pages/posts/posts'
    // })
    // console.log("onContainerTap...");
    //平行页面跳转
    wx.switchTab({
    // wx.navigateTo({
      url: '../movies/movies'
      // url: '../ydbg/ydbg'
      // url: '../posts/posts'
    })
  },

  onSubTap: function() {
    wx.switchTab({
    // wx.navigateTo({
      url: '../movies/movies',
      // url: '../ydbg/ydbg',
      // url: '../posts/posts',
      success: function(e) {
        var page = getCurrentPages().pop();
        if (!page) return;
        page.onLoad();
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("onLoad");
    var pages = getCurrentPages() //获取加载的页面
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = currentPage.route //当前页面url
    // console.log(url);
    var options = currentPage.options //如果要获取url中所带的参数可以查看options
    var _this = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = function (res) {
        _this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: function success(res) {
          app.globalData.userInfo = res.userInfo;
          _this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },

  getUserInfo: function getUserInfo(e) {
    app.globalData.userInfo = e.detail.userInfo;
    console.log(e.detail.userInfo);
    wx.setStorageSync("userInfo", app.globalData.userInfo);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
      isShow: true
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // console.log("posts is onHide...");//关闭卸载或者navagateTo方法调用后触发
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log("posts is onUnload...");//隐藏或redirectTo方法调用后触发
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
