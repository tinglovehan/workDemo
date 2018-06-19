const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({

  data: {
    member: {
      token: '',
      leaguerId: '',
      openId: ''
    },
  },

  onLoad: function (options) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that=this;
    let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
    }
    that.setData({
      orderNo: options.orderNo
    })
    that.getOrderInfor();
  },
  // 获取订单信息
  getOrderInfor:function(){
    let that = this,
      UserData = app.globalData.userInfo,
      data = {
        orderNo: that.data.orderNo,
        corpCode: app.globalData.corpCode,
        wayType: app.globalData.wayType
      },
      url = app.globalData.host + Api.getUrl('member', 'order').detail;
    common.getData(url, data, UserData, that.data.member.token, function (cbData) {
      console.log(cbData)
     
      that.setData({
        orderInfo: cbData.data
      })
    })     
  },
  toWxPay:function(e){
    var that=this,
        orderId = that.data.orderInfo.id,
        UserData = app.globalData.userInfo,
        operateId = that.data.member.leaguerId,
        url = app.globalData.host + Api.getUrl('main', 'wechat').toWxpay,
        data={
          orderId: orderId,
          operateId: operateId,
          corpCode: app.globalData.corpCode,
          wayType: app.globalData.wayType,
          openId: that.data.member.openId
        };
    common.getData(url, data, UserData, that.data.member.token, function (cb) {
      let lastData = JSON.parse(cb.data);
      wx.requestPayment({
        'timeStamp': lastData.timeStamp,
        'nonceStr': lastData.nonceStr,
        'package': lastData.package,
        'signType': 'MD5',
        'paySign': lastData.paySign,
        'success': function (rs) {
          wx.redirectTo({
            url: '../payResult/payResult?orderNo=' + that.data.orderInfor.orderNo
          })
          // wx.setStorageSync('preUrl', '../payResult/payResult?orderNo=' + that.data.orderInfor.orderNo)
        },
        'fail': function (rqs) {
          console.log(res)
          wx.showModal({
            title: '支付失败',
            content: rqs.data.msg,
            success: function (rqs) {
            }
          })
        }
      })
    })
    
  }
 
})