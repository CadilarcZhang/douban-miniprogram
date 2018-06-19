//引入数据文件（必须用相对路径）
// var postsData = require("../../datas/posts_data.js"); 
var postsData = require("../../datas/data.js"); 
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // banners : [swiper_key
    //   "/images/wx.png",
    //   "/images/vr.png",
    //   "/images/iqiyi.png"
    // ]
    readingNum: "readingNum",
    webUrl: "http://thunisoftxcx.mynatapp.cc/mobileOA/mobile/oa/workflow/homeIndex?approveType=0&userKey=liyang7&timestamp="
    + new Date().getTime(),
  },

  //点击某个列表的子新闻跳转
  onPostDetail(event) {
    var postId = event.currentTarget.dataset.postId;//从事件捕获的组件中的自定义属性中获取ID！
    // console.log("postId:" + postId);
    // wx.setStorageSync("readingNum", data);
    // var postDetail = postsData.postList[postId];
    // var postReading = postDetail.reading -0 + 1;
    // this.setData({
    //   reading: postReading
    // });
    var postsReadingNums = wx.getStorageSync(this.data.readingNum);
    postsReadingNums[postId-1] = postsReadingNums[postId-1] - 0 + 1;
    wx.setStorageSync(this.data.readingNum, postsReadingNums);
    postsData.postList[postId-1].readingNum = postsReadingNums[postId-1];
    this.setData({
      post_key: postsData.postList
    });
    wx.navigateTo({
      url: 'post-detail/post-detail?postId='+postId
    });
  },

  //点击swiper的某个子图片跳转到相应的详情页面（使用事件冒泡机制）
  onSwiperTap: function(event) {
    //target和currentTarget的区别：
    //target:指当前被点击的组件；currentTarget指的是事件捕获的组件！！！
    //在这里target指的是image组件，currentTarget指的是swiper组件！
    // var swiperId = event.currentTarget.dataset.swiperId;
    var swiperId = event.target.dataset.swiperId;//
    wx.navigateTo({
      url: 'post-detail/post-detail?postId='+swiperId
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("posts is onLoad...");
    wx.showLoading({
      title: '正在加载中',
    })
    var postList = postsData.postList;
    var postsReadingNums = wx.getStorageSync(this.data.readingNum);//先从缓存里获取阅读的次数
    if (!postsReadingNums) {//第一次创建新闻列表的阅读次数数组
      postsReadingNums = [];//创建空数组
      for (var i in postList) {
        var readingNum = postList[i].readingNum;
        postsReadingNums[i] = readingNum;//为空数组赋值
      }
    } else {
      for (var i in postList) {
        postList[i].readingNum = postsReadingNums[i];//根据缓存刷新新闻列表中每个新闻阅读次数
      }
    }
    wx.setStorageSync(this.data.readingNum, postsReadingNums);
    this.setData({
      //为从服务器端获取的数据设置一个对象的键值，前台通过这个键值对列表进行渲染
      post_key: postsData.postList,
      swiper_key: postsData.swiperList
    });
    wx.hideLoading();
  },

  //点击清除数据缓存
  onClearTap: function (event) {
    try {
      wx.clearStorageSync();
      wx.showToast({
        title: '清除缓存成功',
      })
    } catch (e) {
      wx.showToast({
        title: '清除缓存失败',
      })
    }
  },

  onChooseAddressTap: function() {
    wx.chooseAddress({
      success: function(res) {
        console.log(res);
        console.log(res.userName);
        console.log(res.postalCode);
        console.log(res.provinceName);
        console.log(res.cityName);
        console.log(res.countyName);
        console.log(res.detailInfo);
        console.log(res.nationalCode);
        console.log(res.telNumber);
      }
    });
  },
  onWorkflowTap: function(event) {
    var webUrl = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../welcome/welcome',
    })
  },
  onNavigateMiniProgramTap: function(event) {
    wx.navigateToMiniProgram({
      appId: 'wx16b8f171a89653d8',
      path: 'pages/index/index',
      extarData: {
        // open: 'happy'
      },
      envVersion: 'release',
      success(res) {
        console.log(res); 
      }
    })  
  },
  orderSign: function(event) {
    var appid = app.globalData.appid;
    var secret = app.globalData.secret;
    var accessTokenUrl = app.globalData.accessTokenUrl.replace("APPID", appid).replace("APPSECRET",secret);
    var formId = event.detail.formId;
    var formData = event.detail.value;
    wx.request({
      url: accessTokenUrl,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        // console.log(res);
        var accessToken = res["data"].access_token;
        var expiresIn = res["data"].expires_in;
        // console.log(accessToken+"/"+expiresIn);
        var templateSendUrl = app.globalData.templateSendUrl.replace("ACCESS_TOKEN", accessToken);
        var openid = wx.getStorageSync("openid");
        // console.log("openid:" + openid);
        this.sendTemplateMsg(templateSendUrl, openid, formId, formData);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  sendTemplateMsg: function(url, openid, formId, formData) {
    var postData = {
      "touser": openid,
      "template_id": "Fv7gjcxm8Ziu1UFzUxt98PsmcXpZiOnOSK0xw7JHJT8",
      "page": "/pages/welcome/welcome",
      "form_id": formId,
      "data": {
        "keyword1": {
          "value": formData.place,
          "color": "#173177"
        },
        "keyword2": {
          "value": formData.time,
          "color": "#173177"
        },
        "keyword3": {
          "value": formData.name,
          "color": "#173177"
        },
        "keyword4": {
          "value": formData.orderId,
          "color": "#173177"
        }
      },
      // "emphasis_keyword": "keyword1.DATA"
    };
    wx.request({
      url: url,
      data: postData,
      method: 'POST',
      dataType: 'json',
      success: function(res) {
        console.log(res);
      }
    })
  },
  onChooseInvoiceTitleTap: function(event) {
    wx.chooseInvoiceTitle({
      success: function(res) {
        console.log(res);
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log("posts is onReady...");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("posts is onShow...");
    wx.hideLoading();
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
    if(res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target);
    }
    return {
      title: "新闻阅读与电影资讯",
      path: "/pages/movies/movies",
      imageUrl: "/images/avatar/5.png",
      success: function(result) {
        console.log("转发成功");
      },
      fail: function(reslut) {
        console.log("转发失败");
      }
    };
  }
})