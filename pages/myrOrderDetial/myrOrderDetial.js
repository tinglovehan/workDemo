const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    orderCode: '',
    isShow: true,
    isShowMask: true,
    info: {},
    sFlag:1,
  },
  onLoad: function (params) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this,
      orderCode = params.orderCode;
    that.setData({
      orderCode: orderCode
    })
  that.InfoData();
 },
  //初始化页面数据
  InfoData: function () {
    let that = this,
      data = {},
      token = wx.getStorageSync('token'),
      inforUrl = Api.getUrl('order', 'getOrderByCode') + that.data.orderCode;
    common.requestData(inforUrl, '', 'GET', token, function (cb) {
      console.log("-------------------------订单详情----------------------")
      console.log(cb.data)
      if (cb.statusCode === 200) {
        let _info = cb.data;
        let _orderDetails = _info.orderDetailList[0];
        let _order = {
          id: _orderDetails.id,
          linkName: _info.linkName,
          tel: _info.tel,
          idCardNo: _info.certificateNo,
          createTime: _info.createTime ? that.getLocalTime(_info.createTime) : '',
          orderType: _orderDetails.orderType,
          orderStatus: _info.orderStatus,
          orderCode: _info.orderCode,
          newFee: _info.newFee,
          batchNo: _info.batchNo,
          checkStatus: _info.checkStatus,
          goodsName: _orderDetails.goodsName,
          quantity: _orderDetails.quantity,
          occDate: _orderDetails.occDate ? that.getLocalTime(_orderDetails.occDate, 1) : ''
        };
        _order.orderTypeName = that.getOrderTypeName(_orderDetails.orderType);
        _order.orderStatusName = that.getOrderStatusName(_info.orderStatus);
        that.setData({
          info: _order,
          orderCertAuths: cb.data.orderCertAuths,
        })
      }
    })
  },

  //是否取消
  canleBox: function (e) {
    let that = this;
    wx.showModal({
      title: '取消订单',
      content: '您确定要取消此订单吗？',
      success: function (res) {
        if (res.confirm) {
        that.canleOrder();
        }
      }
    })

  },
  //取消订单
  canleOrder: function (e) {
    let that = this,
      token = wx.getStorageSync('token'),
      inforUrl = Api.getUrl('order', 'cancelOrder') + that.data.orderCode;
    console.log('-----------------------------取消订单-------------------------------')
    wx.showLoading({
      title: '加载中',
    })
    common.requestData(inforUrl, '', 'POST', token, function (cb) {
      console.log(cb)
      if (cb.statusCode === 200) {
        let newInfo = that.data.info;
        if (cb.data.orderStatus) newInfo.orderStatus = cb.data.orderStatus;
        that.setData({
          info: newInfo
        })
        wx.hideLoading();
        that.InfoData() //刷新数据；
        wx.showToast({
          title: cb.errMsg === 'request:ok' ? '取消成功' : cb.errMsg,
          icon: cb.errMsg === 'request:ok' ? 'success' : 'fail',
          duration: 2000
        })
      }
      setTimeout(function () {
        wx.hideToast();
        wx.redirectTo({
          url: '../list/list?module=order&orderStatus=',
        })
      }, 3000)
    })          
  },
  //去支付
  toPay: function (e) {
    let that = this,
        orderCode = e.currentTarget.dataset.code,
        dflag = e.currentTarget.dataset.flag,
        token = wx.getStorageSync('token');
    that.setData({
      sFlag: 0
    })
      if (dflag === 0) {
        return false;
      }else{
        let openid = wx.getStorageSync('openId'),
          data = common.objToString({
            openid: openid,
            orderCode: orderCode,
            payMethod: 'wxpay',
          }),
          url = Api.getUrl('pay', 'wxPayWhat') + '?' + data;
        common.requestData(url, '', 'POST', token, function (cb) {
          if (cb.statusCode === 200) {
            that.setData({
              sFlag: 1
            })
            wx.requestPayment({
              'timeStamp': cb.data.timeStamp,
              'nonceStr': cb.data.nonceStr,
              'package': cb.data.packageStr,
              'signType': 'MD5',
              'paySign': cb.data.paySign,
              'success': function (rs) {

                wx.redirectTo({
                  url: '../myTicket/myTicket?orderNo=' + that.data.info.batchNo + '&merchantId=' + app.globalData.merchantId
                })
              }
              // ,
              // 'fail': function (rqs) {
              //   that.setData({
              //     sFlag: 1
              //   })
              //   wx.showModal({
              //     title: '支付失败',
              //     content: '请重新支付',
              // })
              // }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: cb.data.message,
            })
          }
        })
       }
    },
  //退单
  getRefund:function(){
    let that = this,
      token = wx.getStorageSync('token'),
      inforUrl = Api.getUrl('order', 'retreatOrder') + that.data.info.id + '/' + app.globalData.merchantId;
    wx.showLoading({
      title: '加载中',
    })
    common.requestData(inforUrl, '', 'POST', token, function (cb) {
      console.log(cb)
      console.log(inforUrl)
      if (cb.statusCode === 200) {
        let newInfo = that.data.info;
        if (cb.data.orderStatus) newInfo.orderStatus = cb.data.orderStatus;
        that.setData({
          info: newInfo
        })
        that.InfoData() //刷新数据；
        wx.hideLoading();
        wx.showToast({
          title: cb.errMsg === 'request:ok' ? cb.data.description : cb.errMsg,
          icon: cb.errMsg === 'request:ok' ? 'success' : 'fail',
          duration: 2000
        })
        wx.redirectTo({
          url: '../list/list?module=order&orderStatus=',
        })
      } else {
        wx.hideLoading();
        wx.showModal({
          title: '退款提示',
          content: cb.data.message,
        })
      }
   })
 },
  //获取订单类型名称
  getOrderTypeName: function (orderType) {
    let _orderTypeName = '';
    switch (orderType) {
      case 'scenic':
        _orderTypeName = '门票';
        break;
      case 'family':
        _orderTypeName = '套票';
        break;
      default:
        break;
    }
    return _orderTypeName;
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
  getLocalTime:function(nS, type){
    let that=this,
        getDate = new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    if (type === 1){
      getDate = getDate.split(' ')[0];
      let DateArr = getDate.split('/');
      getDate=that.changeDateType(DateArr[0], DateArr[1],DateArr[2])
    }
    return getDate;
  },

  //获取订单状态的名称
  getOrderStatusName: function (status) {
    let payStatus = '', className = '';
    switch (status) {
      case 'wait_pay':
        payStatus = '未支付';
        className = 'wait_pay';
        break;
      case 'payed':
        payStatus = '已支付';
        className = 'is_ok';
        break;
      case 'is_closed':
        payStatus = '已取消';
        className = 'is_closed';
        break;
      case 'is_finished':
        payStatus = '已完结';
        className = 'is_closed';
        break;
      case 'retreatding':
        payStatus = '退款中';
        className = 'is_refund';
        break;
      case 'retreat_finished':
        payStatus = '已退款';
        className = 'is_closed';
        break;
      case 'wait_confirm':
        payStatus = '待确认';
        className = 'wait_pay';
        break;
      case 'failure':
        payStatus = '出票失败';
        className = 'is_refund';
        break;
      case 'exceptionOrder':
        payStatus = '异常订单';
        className = 'is_refund';
        break;
      case 'retreatFail':
        payStatus = '退票失败';
        className = 'is_refund';
        break;
      case 'refunding':
        payStatus = '退款处理中';
        className = 'wait_pay';
        break;
      case 'refund_success':
        payStatus = '退款成功';
        className = 'is_ok';
        break;
      case 'refund_fail':
        payStatus = '退款失败';
        className = 'is_refund';
        break;
      default:
        payStatus = status
        break;
    }
    console.log({
      statusName: payStatus,
      className: className
    })
    return {
      statusName: payStatus,
      className: className
    };
  },
  //获取退单状态
  getrefundStatus: function (status) {
    let refundStatus = '';
    switch (status) {
      case 'refunding':
        refundStatus = '退款处理中'
      case 'refund_success':
        refundStatus = '退款成功';
        break;
      case 'refund_fail':
        refundStatus = '退款失败';
        break;
      default:
        refundStatus = status;
        break;
    }
    return refundStatus;
  }
})