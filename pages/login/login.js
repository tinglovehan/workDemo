const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
 data: {
  
  },
  onLoad: function (options) {
    let that=this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winh: res.windowHeight,
        })
      }
    })
    that.reLogin();
  },
  // 请求加载
  reLogin: function () {
   wx.showLoading({
     title: '登录中',
     mask:true,
   })
   wx.login({
     success: function (loginres) {
       let code = loginres.code,
           url = Api.getUrl('main', 'login') + "?merchantId=" + app.globalData.merchantId + "&code=" + code,
         method = 'GET';
       common.requestData(url, '', method, '', function (cb) {
         console.log("cb", cb)
         if (cb.statusCode === 200) {
           wx.hideLoading();
           wx.setStorageSync('openId', cb.data.openid);
           wx.setStorageSync('token', cb.data.token);
           wx.setStorageSync('member', cb.data.memberInfoRes);
           if (wx.getStorageSync('pageFlag')==='index'){
            wx.switchTab({
              url: '../index/index',
            })
          }else{
            wx.navigateBack({
              delta: 1,
            })
          }
          
         } else {
           wx.showModal({
             title: '提示',
             content: cb.data.message,
           })
         }
       })
      }
   })
  
  }
 

 
})