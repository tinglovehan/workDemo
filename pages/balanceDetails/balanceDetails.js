const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    id: '',
    chargeNo: '',
    isShow: true,
    isShowMask: true,
    info: {}
  },
  onLoad: function (params) {
    let that = this;
    that.setData({
      id: params.id || '',
      chargeNo: params.chargeNo || ''
    })
  let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
    } 
    wx.setStorageSync('pageFlag', 'secoondPage');
    that.InfoData();
  },
  //初始化页面数据
  InfoData: function () {
    let that = this,
      data = {},
      token = wx.getStorageSync('token'),
      inforUrl = Api.getUrl('balance', 'detail') + that.data.id;
    if (that.data.chargeNo) inforUrl = Api.getUrl('balance', 'getPayDetail') + '?chargeNo=' + that.data.chargeNo;
   
    common.requestData(inforUrl, '', 'GET', token, function (cb) {
      console.log("-------------------------订单详情----------------------")
      console.log(cb)
      if (cb.statusCode === 200) {
        let transInfo = cb.data.userOrderTradeInfo;
        let _data = {
          statusName: transInfo.status === 'pay' ? '支付' : '退款',
          name: cb.data.scenicName || '',
          orderInfo: cb.data.orderInfoVOs,
          price: transInfo.amount,
          id: transInfo.id,
          description: transInfo.description,
          batchNo: transInfo.batchNo,
          status: transInfo.status,
          chargeNo: transInfo.chargeNo || ''
        };
        _data.payMethod = transInfo.status === 'pay' ? that.payWay(transInfo.payMethod) : that.payWay(transInfo.refundMethod)
        _data.createTime = that.getLocalTime(transInfo.createTime);
        _data.changeNo = transInfo.status === 'pay' ? transInfo.chargeNo : transInfo.refundChargeNo;

        console.log(_data);
        that.setData({
          info: _data,
          transInfo: cb.data.userOrderTradeInfo,
        })
      }
    })
         
      

  },
  //关联付款记录
  getPayDetail:function(){
    let that = this;
    that.setData({
      chargeUrl:true
    })
    that.InfoData();
  },
  //返回退单详情
  getRefundDetail:function(){
    let that = this;
  },
  //支付方式
  payWay: function (data) {
    let _payWay = '';
    switch (data) {
      case 'alipay':
        _payWay = '支付宝';
        break;
      case 'wechat':
        _payWay = '微信';
        break;
      default:
      _payWay = '无';
        break;
    }
    return _payWay;
  },
  //修改日期格式
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
      getTime = '',
      getDate = new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    getTime = getDate.split(' ')[1];
    getDate = getDate.split(' ')[0];
    let DateArr = getDate.split('/');
    getDate = that.changeDateType(DateArr[0], DateArr[1], DateArr[2]);
    getDate = type ? getDate : (getDate + ' ' + getTime);
    return getDate;
  }
})