//引入JSON数据文件
// var postsData = require("../../../datas/posts_data.js");
var postsData = require("../../../datas/data.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //方式一：将函数间传递的变量通过data中传递，也可以不在这里指定
    // currentPostId: "",
    postCollectedKey: "post-collected",
    // isPlayingMusic : false
    openType: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showLoading({
    //   title: '正在加载文章数据，请稍后~~',
    // });
    // setTimeout(function() {
    //   wx.hideLoading();
    // }, 1500);
    var postId = options.postId;
    // var postDetail = postsData.postList[postId];
    var postDetail = postsData.postList[postId - 1];
    //方式二：也可以直接给this.data对象设置一个属性！！！
    // this.data.currentPostId = postId;
    // console.log("postDetail:" + JSON.stringify(postDetail));
    this.setData({
      post: postDetail,
      currentPostId: postId//方式三：动态设置data值
    });
    //从缓存中获取所有文章详情页中是否收藏的值
    var postsCollected = wx.getStorageSync(this.data.postCollectedKey);
    if (postsCollected) {
      var collected = postsCollected[postId];
      if (collected === undefined) {
        collected = false;
        postsCollected[postId] = false;
        wx.setStorageSync(this.data.postCollectedKey, postsCollected);
      }
      this.setData({
        collected: collected
      });
    } else {
      postsCollected = [];//定义一个数组，存储所有文章的是否收藏值
      postsCollected[postId] = false;
      wx.setStorageSync(this.data.postCollectedKey, postsCollected);
    }
    // var that = this;
    if (app.globalData.g_isPlayingMusic 
      && app.globalData.g_currentMusicPostId==postId) {
      this.setData({
        isPlayingMusic: true
      });
    }
    this.onMusicMonitor(postId);
    //监听音乐停止播放的事件（事件驱动思想）
    // wx.onBackgroundAudioStop(callback);
  },

  onMusicMonitor: function (postId) {
    var that = this;
    //监听音乐播放的事件（事件驱动思想）
    wx.onBackgroundAudioPlay(function() {
      that.setData({
        isPlayingMusic: true
      });
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicPostId = postId;
    });
    //监听音乐暂停的事件（事件驱动思想）
    wx.onBackgroundAudioPause(function() {
      that.setData({
        isPlayingMusic: false
      });
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicPostId = null;
    });
    wx.onBackgroundAudioStop(function() {
      that.setData({
        isPlayingMusic: false
      });
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicPostId = null;
    });
  },

  onCollectionTap: function(event) {
    // this.getPostsCollectionAsy();//异步方式获取和设置缓存(根据业务需要编写异步代码)
    var postsCollected = wx.getStorageSync(this.data.postCollectedKey);
    //通过当前文章的id获得当前文章的是否收藏值
    var collected = postsCollected[this.data.currentPostId];
    //如果collected为undefined,!collected值为true
    var postCollected = !collected;
    // postsCollected[this.data.currentPostId] = postCollected;
    // //更新“收藏”的缓存
    // wx.setStorageSync(this.data.postCollectedKey, postsCollected);
    // //更新data中的数据，更新页面中的值
    // this.setData({
    //   collected: postCollected
    // });
    // this.doCollectedOrCancelCollected(postCollected, postsCollected);
    // this.showToast(postCollected);
    this.showModal(postCollected, postsCollected);
  },
  //同步方式执行更安全稳定（严格按顺序执行），但是效率偏低，异步方式能缓解服务器并发的压力
  //异步方式获取和设置缓存（这个案例中更适合用同步的写法！）
  getPostsCollectionAsy() {
    wx.getStorage({
      key: this.data.postCollectedKey,
      success: (res) => {
        var postsCollected = res.data;
        var postCollected = !postsCollected[this.data.currentPostId];
        this.showModal(postCollected, postsCollected);
      },
    })
  },

  onShareTap: function() {
    let itemList = [
      "分享给微信好友",
      "分享到微信朋友圈",
      "分享到新浪微博",
      "分享到QQ空间"
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#405f80",
      //ES6箭头函数
      success: (res) => {
        console.log(res.tapIndex);
        wx.showModal({
          title: '分享文章',
          content: '是否分享文章到' + itemList[res.tapIndex] + "？",
          //ES6箭头函数
          success : (res) => {
            if (res.confirm) {
              wx.showToast({
                title: '暂不支持分享文章(＞人＜；)',
                icon: "none"
              });
              // this.shareArtical();
              // this.onShareAppMessage();
              this.setData({
                openType: "share"
              });
            }
            //此处this指向Page对象!!!
            this.setData({
              shared: true
            });
          }
        })
      }
    })
  },
  //“音乐”按钮的点击事件
  onMusicTap: function(event) {
    var isPlayingMusic = this.data.isPlayingMusic;
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      });
    } else {
      var postItem = postsData.postList[this.data.currentPostId - 1];
      wx.playBackgroundAudio({
        dataUrl: postItem.music.url,
        title: postItem.music.title,
        coverImgUrl: postItem.music.coverImg
      });
      this.setData({
        isPlayingMusic: true
      });
    }
  },

  showToast: function (postCollected) {
    wx.showToast({
      title: postCollected ? "收藏成功" : "取消收藏",//三元运算符
      duration: 1000,
      icon: 'success'
    })
  },

  showModal: function (postCollected, postsCollected) {
    var that = this;
    wx.showModal({
      title: '收藏',
      content: postCollected ? "是否收藏该文章？" : "是否取消收藏该文章？",
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#333",
      confirmText: "确认",
      confirmColor: "#405f80",
      success : function(res) {
        if (res.confirm) {
          that.doCollectedOrCancelCollected(postCollected, postsCollected);
          that.showToast(postCollected);
        }
      }
    })
  },

  doCollectedOrCancelCollected(postCollected, postsCollected) {
    postsCollected[this.data.currentPostId] = postCollected;
    //更新“收藏”的缓存
    wx.setStorageSync(this.data.postCollectedKey, postsCollected);
    //更新data中的数据，刷新页面中的值
    this.setData({
      collected: postCollected
    });
  },
  //自定义分享（暂时不起效果）
  shareArtical() {
    return {
      title: postsData.postList[this.data.currentPostId].title,
      path: 'post-detail/post-detail?postId=' + this.data.currentPostId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
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
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
    }
    return {
      title: postsData.postList[this.data.currentPostId].title,
      path: 'post-detail/post-detail?postId=' + this.data.currentPostId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})