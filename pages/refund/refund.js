const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({

  /**
   * 页面的初始数据
   */
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
   that.setData({
        refundNum: options.refundNum,
        orderNo: options.orderNo
      })
    let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
    }
    
  },
  // 获取退款原因
  bindTextAreaBlur:function(e){
    let value = e.detail.value,
        that=this,
        Illegal = new RegExp("[`~!@#$^&*()=|{}':'\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'、？\\s]");
    if (!value){
      wx.showToast({
        title: '请输入退款原因！',
      })
    }else{
      if (Illegal.test(value)) {
        wx.showToast({
          title: '包含非法字符！请重新输入',
        })
      }else{
        that.setData({
          reason: value
        })
      }
    }
  },
  // 提交申请
  sumbitApply:function(){
   let that=this,
       UserData = app.globalData.userInfo,
       data={
         reason: that.data.reason,
         refundNum: that.data.refundNum,
         orderNo: that.data.orderNo,
         leaguerId: that.data.member.leaguerId,
         corpCode: app.globalData.corpCode,
         wayType: app.globalData.wayType,
       },
       url = app.globalData.host + Api.getUrl('member', 'order').refund;
  common.PostData(url, data, UserData, that.data.member.token, function (cb) {   
    wx.showModal({
      title: '提示',
      content: cb.message,
      success: function (res) {
        wx.navigateTo({
          url: '../myrOrderDetial/myrOrderDetial?orderNo=' + that.data.orderNo,
        })
      }
    })
   })
  }
})