const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    module:''
  },
  onLoad: function (options) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this;
    that.setData({
      orderNo: options.orderNo,
      module: options.module || ''
    })
     that.getOrder();
  },
  getOrder: function () {
    let that = this,
      token = wx.getStorageSync('token'),
      url = Api.getUrl('order', 'getOrderByCode') + that.data.orderNo;
    common.requestData(url, '', 'GET', token, function (cb) {
      if (cb.statusCode === 200) {
        that.setData({
          orderInfo: cb.data,
        })
      }
    })

  },
  toIndex:function(e){
    wx.switchTab({
      url: '../index/index'
    })
  }

})