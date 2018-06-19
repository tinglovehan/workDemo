const WxParse = require('../../wxParse/wxParse.js');
Page({

  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.getStorage({
      key: 'content',
      success: function(res) {
        WxParse.wxParse('article', 'html', res.data, that, 5);
      },
    })
  },

 
})