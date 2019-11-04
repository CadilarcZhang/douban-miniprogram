var util = require("../../utils/util.js");
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // inTheater: {},
        // comingSoon: {},
        // Top250: {}
        movieContainerShow: true,
        searchPanelShow: false,
        historyShow: false,
        readyShow: false,
        hintShow: false,
        // readyNum: 0,
        tags: ["动作", "爱情", "喜剧", "科幻", "悲剧", "惊悚", "美剧"],
        startNum: 0,
        doMovieTap: false,
        userInfo: app.globalData.userInfo,
        contentHeight: wx.getSystemInfoSync().screenHeight - 80,
        refreshIconShow: [true, true, true, true],
        loadingIconShow: [false, false, false, false],
        clickMore: ["换一批", "换一批", "换一批", "换一批"]
        // keyword: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            userInfo: app.globalData.userInfo,
            contentHeight: wx.getSystemInfoSync().screenHeight - 80 + "px",
            // refreshIconShow: true,
            // loadingIconShow: false
        });
        console.log(this.data.userInfo.avatarUrl);
        if (this.data.doMovieTap) {
            return;
        }
        wx.showLoading({
            title: "正在加载中",
        })
        var that = this;
        // var first3Movies = [];
        // var second3Movies = [];
        // var third3Movies = [];
        var movieArr = [];
        var inTheatersUrl = app.globalData.doubanBaseUrl + "/v2/movie/in_theaters?start=0&count=21";
        var comingSoonUrl = app.globalData.doubanBaseUrl + "/v2/movie/coming_soon?start=0&count=21";
        var usBoxUrl = app.globalData.doubanBaseUrl + "/v2/movie/us_box?start=0&count=21";
        var top250Url = app.globalData.doubanBaseUrl + "/v2/movie/top250?start=0&count=21";
        // 四个异步方法
        // this.getMovieListDatas(inTheatersUrl, "in_theaters", "正在热映");
        // this.getMovieListDatas(comingSoonUrl, "coming_soon", "即将上映");
        // this.getMovieListDatas(usBoxUrl, "us_box", "北美票房榜");
        // this.getMovieListDatas(top250Url, "top250", "经典推荐");
        // 必须等到所有promise实例的resolve方法都执行完毕（都执行成功）,才成功返回!!!
        let promise1 = new Promise((resolve, reject) => {
            this.getMovieListDatas(inTheatersUrl, "in_theaters", "正在热映", resolve);
        });
        let promise2 = new Promise((resolve, reject) => {
            this.getMovieListDatas(comingSoonUrl, "coming_soon", "即将上映", resolve);
        });
        let promise3 = new Promise((resolve, reject) => {
            this.getMovieListDatas(usBoxUrl, "us_box", "北美票房榜", resolve);
        }); 
        let promise4 = new Promise((resolve, reject) => {
            this.getMovieListDatas(top250Url, "top250", "经典推荐", resolve);
        });
        Promise.all([promise1, promise2, promise3, promise4]).then(() => {
            this.setData({
                readyShow: true
            });
            wx.hideLoading();
        }).catch((error) => {
            console.log(error);
        }) ;
        // wx.request({
        //   url: "http://t.yushu.im/v2/movie/top250",
        //   data: {},
        //   header: {
        //     "Content-Type": "json"
        //   },
        //   success: (res) => {
        //     // console.log(JSON.stringify(res));
        //     first3Movies = this.getThreeMovies(0,res);
        //     second3Movies = this.getThreeMovies(3, res);
        //     third3Movies = this.getThreeMovies(6, res);
        //     movieArr = new Array(first3Movies, second3Movies, third3Movies);
        //     that.setData({
        //       movieList: movieArr
        //     });
        //     console.log(this.data.movieList);
        //   },
        //   fail: function(res) {
        //     console.log(res);
        //   },
        //   complete: function(res) {

        //   }
        // });
    },

    getMovieListDatas: function(url, settedKey, categary, resolve) {
        wx.request({
            url: url,
            method: "GET",
            data: {
                userInfo: JSON.stringify(this.data.userInfo)
            },
            header: {
                "Content-Type": "application/json;charset=utf-8"
            },
            success: (res) => {
                if (categary) {
                    this.processMovieData(res.data, settedKey, categary, resolve);
                } else {
                    this.processSearchMovieData(res.data, settedKey, resolve);
                }
            },
            fail: function(res) {
                console.log(res);
                wx.showModal({
                    title: '系统提示',
                    // content: '网络无法连接，请检查网络设置',
                    content: res.errMsg,
                    complete: function(res) {
                        if (!res.cancel) {
                            wx.redirectTo({
                                url: '../welcome/welcome',
                            });
                        }
                    }
                });
                // wx.navigateBack({
                //     url: '../welcome/welcome',
                // })
            },
            complete: function(res) {

            }
        });
    },

    processMovieData: function(data, settedKey, categary, resolve) {
        var movies = [];
        var group01 = [];
        var group02 = [];
        // console.log(data.subjects);
        // 错误信息提示处理
        if (!data.subjects) {
            util.handleErrorMsg(data);
            return;
        }
        if (data.subjects.length == 0) {
            var reloadUrl = app.globalData.doubanBaseUrl + "/v2/movie/" + settedKey + "?start=0&count=21";
            this.data.startNum = startNum;
            this.getMovieListDatas(reloadUrl, type, categary);
        }
        var subjects = data.subjects;
        // for (var idx in subjects) {
        for (var idx = 0; idx < 6; idx++) { //从前20个取前6个
            var subject = subjects[idx];
            if (settedKey === "us_box") {
                subject = subjects[idx].subject;
            }
            var movieId = subject.id;
            var title = subject.title;
            // if (title.length >= 10) { //也可以用js控制影片名的样式！
            //   title = title.substring(0,10) + "...";
            // }
            var coverImageUrl = subject.images.large;
            var score = subject.rating.average;
            var starsArr = util.convertStarsToArray(subject.rating.stars);
            var tempData = {
                movieId: movieId,
                title: title,
                coverImageUrl: coverImageUrl,
                starsArr: starsArr,
                score: score
            };
            if (idx < 3) {
                group01.push(tempData);
            } else if (idx < 6) {
                group02.push(tempData);
            }
        }
        movies = [group01, group02];
        var startNum = this.data.startNum;
        var readyData = {};
        let cate_index;
        switch (settedKey) {
            case "in_theaters": cate_index = 0; break;
            case "coming_soon": cate_index = 1; break;
            case "us_box": cate_index = 2; break;
            case "top250": cate_index = 3; break;
        }
        readyData[settedKey] = {
            categary: categary,
            type: settedKey,
            movies: movies,
            startNum: startNum,
            cateIndex: cate_index
        };
        // console.log(readyData);
        // this.processMoviesByCategary(allMovies, settedKey);
        // var inTheaterMovies = allMovies["inTheater"].movies;
        // var comingSoonMovies = allMovies["comingSoon"].movies;
        // var Top250Movies = allMovies["Top250"].movies;
        // this.setData({
        // movies: movies
        // inTheaterMovies: inTheaterMovies,
        // comingSoonMovies: comingSoonMovies,
        // Top250Movies: Top250Movies
        // });
        // this.data.readyNum++; //计数器自增，因为执行了三次异步操作，最后执行完的时机不确定，当三个异步均执行完后，显示页面元素！
        this.setData(readyData);
        // if (this.data.readyNum == 4) {
        //     this.setData({
        //         readyShow: true
        //     });
        //     wx.hideLoading();
        // }
        // wx.hideNavigationBarLoading();
        if (resolve) {
            resolve(); // 异步函数执行完，继续执行promise对象的then方法的回调函数！！！
        }
    },

    processSearchMovieData: function(data, settedKey) {
        var movies = [];
        var subjects = data.subjects;
        // subjects = [];
        if (subjects.length == 0) {
            data.msg = "没有查询到您想要的结果(｡•ˇ‸ˇ•｡)";
            util.handleErrorMsg(data);
            return;
        }
        if (!subjects) {
            util.handleErrorMsg(data);
            return;
        }
        for (var idx in subjects) {
            var movieId = data.subjects[idx].id;
            var title = data.subjects[idx].title;
            var coverImageUrl = data.subjects[idx].images.large;
            var score = data.subjects[idx].rating.average;
            var starsArr = util.convertStarsToArray(data.subjects[idx].rating.stars);
            var movie = {
                movieId: movieId,
                title: title,
                coverImageUrl: coverImageUrl,
                score: score,
                starsArr: starsArr
            };
            movies.push(movie);
        }
        var readyData = {};
        readyData[settedKey] = {
            movies: movies
        }
        this.setData(readyData);
        this.setData({
            readyShow: true
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading();
    },

    onMoreMoviesTap: function(event) {
        var categary = event.currentTarget.dataset.categary;
        wx.navigateTo({
            url: 'more-movies/more-movies?categary=' + categary,
        })
    },

    onMovieTap: function(event) {
        var movieId = event.currentTarget.dataset.movieId;
        this.data.doMovieTap = true;
        wx.navigateTo({
            url: "movie-detail/movie-detail?id=" + movieId,
        });
    },

    onReloadTap: function(event) {
        wx.showNavigationBarLoading();
        var type = event.currentTarget.dataset.type;
        var categary = event.currentTarget.dataset.categary;
        var startNum = event.currentTarget.dataset.startNum + 6;
        var cateIndex = event.currentTarget.dataset.cateIndex;
        var reloadUrl = app.globalData.doubanBaseUrl + "/v2/movie/" + type + "?start=" + startNum + "&count=21";
        this.data.startNum = startNum;
        // 在Promise对象中设置resolve和reject两个函数作为参数，调用此异步方法加载数据，同时传入resolve方法，继续调用then()方法中的回调函数，保证同步执行，数据加载完毕后切换状态！
        var promise = new Promise((resolve, reject) => { // 利用箭头函数，是this对象指向当前调用onReloadTap的对象
            this.data.refreshIconShow[cateIndex] = false;
            this.data.loadingIconShow[cateIndex] = true;
            this.data.clickMore[cateIndex] = "加载中";
            this.setData({
                refreshIconShow: this.data.refreshIconShow,
                loadingIconShow: this.data.loadingIconShow,
                clickMore: this.data.clickMore
            });
            this.getMovieListDatas(reloadUrl, type, categary, resolve); 
        });
        promise.then(() => {
            this.data.refreshIconShow[cateIndex] = true;
            this.data.loadingIconShow[cateIndex] = false;
            this.data.clickMore[cateIndex] = "换一批";
            this.setData({
                refreshIconShow: this.data.refreshIconShow,
                loadingIconShow: this.data.loadingIconShow,
                clickMore: this.data.clickMore
            });
            wx.hideNavigationBarLoading();
        }).catch(function(error) {
            console.log(error);
        });
    },

    onBindFocus: function() {
        var search_history_arr = wx.getStorageSync("search_history_arr");
        var hintShow = true;
        if (!search_history_arr) {
            search_history_arr = [];
        }
        if (search_history_arr.length == 0) {
            hintShow = false;
        }
        this.setData({
            movieContainerShow: false,
            searchPanelShow: true,
            historyShow: true,
            hintShow: hintShow,
            searchResult: [],
            search_history_arr: search_history_arr.reverse()
        });
    },

    onCancelTap: function() {
        this.setData({
            movieContainerShow: true,
            searchPanelShow: false,
            historyShow: false,
            hintShow: false,
            searchResult: {},
            keyword: ""
        });
    },
    onSaveKeyword: function(e) {
        var keyword = e.detail.value.trim();
        this.data.keyword = keyword;
    },
    onBindConfirm: function(e) {
        var text = e.detail.value.trim();
        if (!text) {
            // if (!wx.getStorageSync("search_history_arr")) {
            //   wx.showToast({
            //     title: '关键字不能为空，请重新输入',
            //     icon: "none",
            //   });
            // }
            this.data.keyword = text;
            this.setData({
                movieContainerShow: true,
                searchPanelShow: false,
                historyShow: false,
                hintShow: false,
            });
            return;
        }
        wx.showLoading({
            title: '正在加载中',
        })
        var searchUrl = app.globalData.doubanBaseUrl + "/v2/movie/search?q=" + encodeURI(text); //注意一定要对中文字符串进行URLEncode编码！  
        this.getMovieListDatas(searchUrl, "searchResult", "");
        this.data.keyword = text;
        this.setData({
            keyword: text,
            historyShow: false,
            hintShow: false
        });
        var searchArr = wx.getStorageSync("search_history_arr");
        if (!searchArr) {
            searchArr = new Array(text);
            // searchArr.add(text);
        } else {
            searchArr.push(text);
        }
        var searchSet = new Set(searchArr); //根据Array创建一个Set，元素不重复
        searchArr = Array.from(searchSet); //再将Set转出Array，元素去重
        // searchArr = searchArr.reverse();
        if (searchArr.length > 8) {
            searchArr = searchArr.splice(1, searchArr.length - 1); //记录数量超过8个，删除第一个记录
        }
        wx.setStorageSync("search_history_arr", searchArr);
    },

    onSearchTap: function(event) {
        // this.setData({
        //   movieContainerShow: false
        // });
        wx.showLoading({
            title: '正在加载中',
        });
        var keyword = event.currentTarget.dataset.keyword;
        var searchUrl = app.globalData.doubanBaseUrl + "/v2/movie/search?q=" + encodeURI(keyword); //注意一定要对中文字符串进行URLEncode编码！
        this.getMovieListDatas(searchUrl, "searchResult", "");
        this.data.keyword = keyword;
        this.setData({
            keyword: keyword,
            historyShow: false,
            hintShow: false
        });
    },

    onCancelItemTap: function(event) {
        var index = event.currentTarget.dataset.index;
        var searchArr = wx.getStorageSync("search_history_arr");
        searchArr.splice(searchArr.length - index - 1, 1);
        wx.setStorageSync("search_history_arr", searchArr);
        this.setData({
            search_history_arr: searchArr.reverse()
        });
    },

    onClearAllTap: function() {
        var searchArr = wx.getStorageSync("search_history_arr");
        searchArr.splice(0, searchArr.length);
        wx.setStorageSync("search_history_arr", searchArr);
        this.setData({
            search_history_arr: searchArr,
            hintShow: false
        });
    },

    onBlurTap: function() {
        var keyword = this.data.keyword;
        if (!keyword) {
            this.setData({
                movieContainerShow: true,
                searchPanelShow: false,
                historyShow: false,
                hintShow: false,
            });
            return;
        }
        wx.showLoading({
            title: '正在加载中',
        })
        var searchUrl = app.globalData.doubanBaseUrl + "/v2/movie/search?q=" + encodeURI(keyword); //注意一定要对中文字符串进行URLEncode编码！  
        this.getMovieListDatas(searchUrl, "searchResult", "");
        this.setData({
            keyword: keyword,
            historyShow: false,
            hintShow: false
        });
        var searchArr = wx.getStorageSync("search_history_arr");
        if (!searchArr) {
            searchArr = new Array(keyword);
            // searchArr.add(text);
        } else {
            searchArr.push(keyword);
        }
        var searchSet = new Set(searchArr); //根据Array创建一个Set，元素不重复
        searchArr = Array.from(searchSet); //再将Set转出Array，元素去重
        // searchArr = searchArr.reverse();
        if (searchArr.length > 8) {
            searchArr = searchArr.splice(1, searchArr.length - 1); //记录数量超过8个，删除第一个记录
        }
        wx.setStorageSync("search_history_arr", searchArr);
    },

    goIndex: function() {
        wx.switchTab({
            url: '../setting/setting',
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // this.setData({
        //   readyShow: true
        // });
        // wx.hideLoading();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        this.onLoad(); //暂时离开此页面，重新刷新数据
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})
// getThreeMovies: function(j, res) {
//   var arr = [];
//   for (var i = j; i < j + 3; i++) {
//     arr[i] = res.data.subjects[i];
//   }
//   return arr;
// },