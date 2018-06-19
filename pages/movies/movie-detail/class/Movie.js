var util = require("../../../../utils/util.js");
// ES6的class语法
class Movie {
  // 构造器
  constructor(url) {
    this.url = url;
  }
  // 暴露给外部的（公有）方法，回调函数作为参数绑定到上下文环境中，调用http请求（异步方法）
  getDoubanMovieData(callback) {
    this.callback = callback;
    util.httpRequest(this.url, this.processMovieData.bind(this));//将函数调用的this绑定到class对象的this！
  }
  //httpRequest的回调方法！，用于组装http请求后返回的数据
  processMovieData(data) {
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
    // console.log(data.casts);
    var movie = {
      movieImg: data.images ? data.images.large : "",
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
      starsArr: util.convertStarsToArray(data.rating.stars),
      score: data.rating.average,
      reviews_count: data.reviews_count,
      casts_infos: util.convertToCastsInfo(data.casts),
      casts_names: util.convertToCastsName(data.casts),
      summary: data.summary,
      warning: data.warning
    };
    // return movie; // 异步方法不能用return返回！
    this.callback(movie);// 将movie作为结果返回到异步回调（匿名）函数中！
  }

}
export {Movie}