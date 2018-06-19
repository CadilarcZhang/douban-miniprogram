const app = getApp();
// var util = require("../../../utils/util.js");
import {Movie} from "class/Movie.js";//接收Movie对象
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: {},
    summaryShow: true,
    readyShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载中'
    })
    var movieId = options.id;
    var movieUrl = app.globalData.doubanBaseUrl + "/v2/movie/subject/" + movieId;
    // util.httpRequest(movieUrl, this.processMovieData/*, null*/);
    // var that = this;
    var movie = new Movie(movieUrl);//创建movie对象，完成构造器的初始化
    // 调用movie对象的getDoubanMovieData方法，参数是一个回调函数！
    // movie.getDoubanMovieData(function(movie) {//C#、Java、Python lamda表达式(箭头)
    movie.getDoubanMovieData((movie) => { //ES6的箭头函数,里面的this指代的是Page对象！
      // console.log(this);//如果不用箭头函数，this指代的是Movie类的对象
      var summaryShow = this.data.summaryShow;
      if (!movie.summary) {
        summaryShow = false;
      }
      // that.setData({
      this.setData({
        movie: movie,
        summaryShow: summaryShow,
        readyShow: true
      });
    });
    wx.hideLoading();
  },
  // 面向过程的做法（常规做法），若用面向对象的方法，此方法不会调用
  processMovieData: function(data, categary) {
    if (!data) {
      return;
    }
    var director = {
      id: "",
      name: "",
      avatar: ""
    };
    if (data.directors[0] != null) {
      if (data.directors[0].avatars != null) {
        director.avatar = data.directors[0].avatars.large;
      }
      director.name = data.directors[0].name;
      director.id = data.directors[0].id;
    }
    var movie = {
      movieImg: data.images ? data.images.large: "",
      country: data.countries.join("、"),
      title: data.title,
      original_title: data.original_title,
      wish_count: data.wish_count,
      comments_count: data.comments_count,
      year: data.year,
      genres: data.genres.join("、"),
      director: director,
      stars: util.convertStarsToArray(data.rating.stars),
      score: data.rating.average,
      reviews_count: data.reviews_count,
      // stars: {
      //   starsArr: util.convertStarsToArray(data.rating.stars),
      //   score: data.rating.average
      // },
      starsArr: util.convertStarsToArray(data.rating.stars),
      score: data.rating.average,
      reviews_count: data.reviews_count,
      casts_infos: util.convertToCastsInfo(data.casts),
      casts_names: util.convertToCastsName(data.casts),
      summary: data.summary,
      warning: data.warning
    };
    console.log(movie);
    var summaryShow = this.data.summaryShow;
    if (!data.summary) {
      summaryShow = false;
    }
    this.setData({
      movie: movie,
      summaryShow: summaryShow,
      readyShow: true
    });
    wx.hideLoading();
  },
  
  onPreviewImgTap: function(event) {
    var imgSrc = event.currentTarget.dataset.imgSrc;
    wx.previewImage({
      current: imgSrc, // 当前显示图片的http链接
      urls: [imgSrc], // 需要预览的图片http链接列表
    });
  },

  onCastDetailTap: function(event) {
    var castId = event.currentTarget.dataset.castId;
    wx.navigateTo({
      url: '../cast-detail/cast-detail?id=' + castId,
    })
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
  onShareAppMessage: function () {
  
  }
})