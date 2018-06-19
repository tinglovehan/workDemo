const WxParse = require('../../wxParse/wxParse.js');
Page({

  data: {
  
  },
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'orderNotice',
      success: function (res) {
        WxParse.wxParse('article', 'html', res.data, that, 5);
      },
    })
  },

  
})