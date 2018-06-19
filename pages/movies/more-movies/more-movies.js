var util = require("../../../utils/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: [],
    inTheaterKey: "正在热映",
    comingSoonKey: "即将上映",
    top250Key: "经典推荐",
    us_boxKey: "北美票房榜",
    navigationTitile: "",
    categary: "",
    start: 0,
    count: 21,
    requestUrl: "",
    isFirstLoad: true,
    readyShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载中'
    })
    var categary = options.categary;
    this.data.navigationTitile = categary;
    this.getMoreMoviesByCategary(categary);
    this.data.categary = categary;
  },

  getMoreMoviesByCategary: function(categary) {
    var doubanBaseurl = app.globalData.doubanBaseUrl;//默认获取前20条数据
    var inTheatersUrl = doubanBaseurl + "/v2/movie/in_theaters";
    var comingSoonUrl = doubanBaseurl + "/v2/movie/coming_soon";
    var top250url = doubanBaseurl + "/v2/movie/top250";
    var usBoxUrl = doubanBaseurl + "/v2/movie/us_box";
    var dataUrl = "";
    switch (categary) {
      case this.data.inTheaterKey:
        dataUrl = inTheatersUrl;
        break;
      case this.data.comingSoonKey:
        dataUrl = comingSoonUrl;
        break;
      case this.data.top250Key:
        dataUrl = top250url;
        break;
      case this.data.us_boxKey:
        dataUrl = usBoxUrl;
    }
    this.data.requestUrl = dataUrl;//保存数据:this.data.variable;数据绑定（更改）用setData函数
    dataUrl += "?start=" + this.data.start + "&count=" + this.data.count;
    this.getMoreMoviesByUrl(dataUrl, categary);
  },

  getMoreMoviesByUrl: function(url, categary) {
    util.httpRequest(url, this.processMovieDatas, categary);
  },

  processMovieDatas: function (data, categary) {
    // wx.showNavigationBarLoading();
    var movies = [];
    for(var idx in data.subjects) {
      var subjects = data.subjects[idx];
      if (categary == "北美票房榜") {
        subjects = subjects.subject;
      }
      var movieId = subjects.id;
      var coverImageUrl = subjects.images.large;
      var title = subjects.title;
      var score = subjects.rating.average;
      var starsArr = util.convertStarsToArray(subjects.rating.stars);
      var movie = {
        movieId: movieId,
        coverImageUrl: coverImageUrl,
        title: title,
        score: score,
        starsArr: starsArr
      };
      movies.push(movie);
    }
    var totalMovies = [];
    // if (this.data.isFirstLoad) {
    //   totalMovies = movies;
    //   this.data.isFirstLoad = false;
    // } else {
    //   totalMovies = this.data.movies.concat(movies);
    // }
    totalMovies = this.data.movies.concat(movies);
    var readyData = {};
    readyData["moreMovies"] = {
      categary: categary,
      movies: totalMovies
    };
    this.data.movies = totalMovies;
    this.data.categary = categary;
    this.data.start += 21;
    this.setData(readyData);
    this.setData({
      readyShow: true
    });
    console.log(readyData);
    wx.hideNavigationBarLoading();
    wx.hideLoading();
  },
  //上滑至scroll-view的底部事件方法：
  //新版本的小程序scroll-view组件里不响应onPullDownRefresh事件
  onScollToLower: function() {
    var categary = this.data.categary;
    var refreshMoreUrl = this.data.requestUrl + "?start=" + this.data.start + "&count=" + this.data.count;
    console.log("refreshUrl:" + refreshMoreUrl);
    wx.showNavigationBarLoading();
    util.httpRequest(refreshMoreUrl, this.processMovieDatas, categary);
  },

  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieId;
    wx.navigateTo({
      url: "../movie-detail/movie-detail?id=" + movieId,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.navigationTitile //动态设置导航栏的标题
    })
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
    wx.showNavigationBarLoading();
    var categary = this.data.categary;
    var refreshUrl = this.data.requestUrl + "?start=0&count=21";
    this.data.movies = [];
    this.data.start = 0;
    util.httpRequest(refreshUrl, this.processMovieDatas, categary);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showNavigationBarLoading();
    var categary = this.data.categary;
    var refreshMoreUrl = this.data.requestUrl + "?start=" + this.data.start + "&count=" + this.data.count;
    console.log("refreshUrl:" + refreshMoreUrl);
    util.httpRequest(refreshMoreUrl, this.processMovieDatas, categary);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})