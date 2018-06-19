const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    autoplay: false,
    interval: 5000,
    duration: 1000,
    swiperCurrent: 0,
  },
 onLoad: function (options) {
   wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this;
    that.setData({
      orderNo: options.orderNo,
    })
   
    let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
      
    }
    that.getOrder();
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
         winh:res.windowHeight
        })
      }
    })
  },
 swiperchange: function (e) {
   this.setData({
     swiperCurrent: e.detail.current
   })
 },
  getOrder:function(){
   let that = this,
       token = wx.getStorageSync('token'),
       url = Api.getUrl('order', 'ticketByBatchNo') + that.data.orderNo;

    common.requestData(url, '', 'GET', token, function (cb) {
       if (cb.statusCode === 200) {
         let timeArr=[],newArr=[];
         cb.data.forEach((item, index) => {
           let a = cb.data[index].orderDetailList[0].occDate;
           let time = that.getLocalTime(a ,1);
           timeArr.push(time);
           if (item.orderStatus ==='payed'){
             newArr.push(item);

           }
         })
        that.setData({
          orderInfo: newArr,
           palyTime: timeArr,
        })

       } else {
         wx.showModal({
           title: '提示',
           content: cb.data.message,
        })
      }
     })
  },
  
  // 时间戳转换
  getLocalTime: function (nS, type) {
    let that = this,
      getDate = new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    if (type === 1) {
      getDate = getDate.split(' ')[0];
      let DateArr = getDate.split('/');
      let getDate2 = that.changeDateType(DateArr[0], DateArr[1], DateArr[2])
      return getDate2;
    }
  },
  changeDateType: function (year, month, day) {
    let y = year;
    let m = month;
    if (m < 10) m = "0" + m;
    let d = day;
    if (d < 10) d = "0" + d;
    return y + "-" + m + "-" + d;
  },
})