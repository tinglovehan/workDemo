const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
const WxParse = require('../../wxParse/wxParse.js');
Page({

  data: {
  
  },

  onLoad: function (options) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this;
    that.setData({
      type: options.type,
      id: options.id,
    })
   that.getDetail();
   
  },
  getDetail:function(){
    let that=this,url,
         token = wx.getStorageSync('token');
    url = Api.getUrl('news', 'detail') + that.data.id;
    common.requestData(url, '', 'GET', token, function (cb) {
      console.log("-------------------------新闻详情--------------------------")
      console.log(cb)
      that.setData({
        detailData: cb.data,
      })
      if (cb.data.text) {
        WxParse.wxParse('detailText', 'html', cb.data.text, that, 5);
      }
      that.getLocalTime(cb.data.createTime, 1);
    })
  },
  changeDateType: function (year, month, day) {
    let y = year;
    let m = month;
    if (m < 10) m = "0" + m;
    let d = day;
    if (d < 10) d = "0" + d;
    return y + "-" + m + "-" + d;
  },
  // 时间戳转换
  getLocalTime: function (nS, type) {
    let that = this,
      getDate = new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    if (type === 1) {
      getDate = getDate.split(' ')[0];
      let DateArr = getDate.split('/');
      let getDate2 = that.changeDateType(DateArr[0], DateArr[1], DateArr[2])
      that.setData({
        bookDate: getDate2,
        occDate: nS,
      })
     
    }
  },
})