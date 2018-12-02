const app = getApp();
/**
 * 计算评分组件星星的显示数量
 */
function convertStarsToArray(stars) {
  var starNum = (stars-0)/10;
  var floorNum = Math.floor(starNum);
  var ceilNum = Math.ceil(starNum);
  var starArr = [];
  for (var i = 0; i < 5; i++) {
    if (i < floorNum) {
      starArr.push(1);
    } else if (i >= floorNum && i < ceilNum){
        // starArr.push(0.5);
        // if (starNum <= i + 0.25) {
        //   starArr.push(1);
        // } else if (starNum <= i + 0.5) {
        //   starArr.push(0.5);
        // } else if (starNum <= i + 0.75) {
        //   starNum.push(0.5);
        // } else {
        //   starNum.push(0);
        // }
        if (i + 0.5 == starNum) {
          starArr.push(0.5);
        }
    } else {
        starArr.push(0);
    }
  }
  return starArr;
}

/**
 * 处理http网络请求
 */
function httpRequest(url, callback, categary) {
  wx.request({
    url: url,
    data: { userInfo: JSON.stringify(app.globalData.userInfo) },
    header: {
      "Content-Type": "json"
    },
    method: "GET",
    success: function (res) {
      callback(res.data, categary);
    },
    fail: function (res) {
      wx.showModal({
        title: '系统提示',
        content: '网络异常，请检查网络设置',
      });
      wx.redirectTo({
        url: '../welcome/welcome',
      });
    },
    complete: function (res) {

    },
  })
}

/**
 * 组装演员的信息数组，包括演员的头像和名字(以及id)
 */
function convertToCastsInfo(casts) {
  var castsInfoArray = [];
  for (var i in casts) {
    var castInfo = {
      id: casts[i].id,
      avatar: casts[i].avatars ? casts[i].avatars.large : "",
      name: casts[i].name
    };
    castsInfoArray.push(castInfo);
  }
  return castsInfoArray;
}

/**
 * 组装演员姓名的字符串，“/”作为分隔符
 */
function convertToCastsName(casts) {
  var castsName = [];
  for (var i in casts) {
    castsName.push(casts[i].name);
  }
  return castsName.join(" / ");
  //第二张方式：
  // var castsNameString = "";
  // for (var i in casts) {
  //   castsNameString += casts[i].name + " / ";
  // }
  // return castsNameString.substring(0, castsNameString.length-2);//去掉倒数第一个"/"
}

/**
 * 处理错误请求
 */
function handleErrorMsg(data) {
  wx.hideLoading();
  wx.showModal({
    title: '系统提示',
    // content: '您访问的请求频次达到服务器上限，请稍后重试',
    // content: JSON.stringify(data),
    content: data.msg ? data.msg : "web服务错误",
    complete: () => {
      // wx.navigateBack({
      //   delta: 1
      // });
      wx.redirectTo({
        url: '/pages/welcome/welcome',
      })
    }
  });
}

module.exports = {
  convertStarsToArray: convertStarsToArray,
  httpRequest: httpRequest,
  convertToCastsInfo: convertToCastsInfo,
  convertToCastsName: convertToCastsName,
  handleErrorMsg: handleErrorMsg
}

