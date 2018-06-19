const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    userInfo:{}
  },
  onLoad: function (options) {
    let that = this;
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      wx.getUserInfo({
        success: function (res) {
          console.log(res.userInfo)
          app.globalData.userInfo = res.userInfo;
          that.setData({
            userInfo: res.userInfo
          })
          // var nickName = userInfo.nickName
          // var avatarUrl = userInfo.avatarUrl
          // var gender = userInfo.gender 
          // var province = userInfo.province
          // var city = userInfo.city
          // var country = userInfo.country
        }
      })
    }
    wx.setStorageSync('pageFlag', 'secoondPage');
    that.coupon();
  },
  
  coupon:function(){
    let that=this,
        token = wx.getStorageSync('token');
    let couponurl = Api.getUrl('coupon', 'permission') + '?merchantId=' + app.globalData.merchantId;
    common.requestData(couponurl, '', 'GET', token, function (cb) {
      if (cb.statusCode === 200 && cb.data.length > 0) {
        that.setData({
          couponPermission: true,
        })

      }
    })
   },

})