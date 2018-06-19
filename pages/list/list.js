//index.js
//获取应用实例
const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    userInfo: '',
    hasUserInfo: false,
    flag: 0,
    onoff: true,
    listArray: [],  //放置返回列表数据的数组  
    sortData: '',
    _pageNum: 0,//页数
    _pageSize: 10,//每页个数
    loading: false, //"上拉加载"的变量，默认false，隐藏 
    loadingComplete: false, //“没有数据”的变量，默认false，隐藏 
    isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组 
    sort: '',//排序参数
    module: '',
    Tflag:0,
    params: {},//参数
    filterName:'全部类型',//自由行头部搜索
    sortName:'默认排序'

  },

  onLoad: function (params) {
    let that = this;
   if (params.module == 'order') {
      that.setData({
        orderStatus: params.orderStatus
      })
    }
   that.setData({
    module: params.module
   })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winh: res.windowHeight,
         })
      }
    })
    wx.setStorageSync('pageFlag', 'secoondPage');
    that.listData();
  },
  // 自由行下拉菜单
  //下拉菜单事件
  tapMenu: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    console.log(index)
    this.setData({
      Tflag: index + 1,
      onoff: false
    })
  },

  //区域筛选
  getFilter: function (e) {
    let that = this,
         text = e.currentTarget.dataset.text,
         ticketType = e.currentTarget.dataset.tickettype;
    that.setData({
      filterName: text,
      onoff:true,
      ticketType: ticketType,
      Tflag: 0,
    })
    that.listData();
  },
  //排序筛选
  getSortselect: function (e) {
    let that = this,
      text = e.currentTarget.dataset.text,
      sort = e.currentTarget.dataset.sort;
    that.setData({
      sortName: text,
      onoff: true,
      Ssort: sort,
      Tflag: 0,
    })
    that.listData();
  },
  //下拉菜单事件
  getSort: function (e) {
    let that = this;
    var sort = e.currentTarget.dataset.sort;
    that.setData({
      sort: sort,
    })
    that.listData();
  },

  //绑定列表页数据
  listData: function (e) {
    let that = this, params, data, listUrl, buyerId,
      token = wx.getStorageSync('token'),
      _pageNum = that.data._pageNum,
      _pageSize = that.data._pageSize,
      _sort = that.data.sort;
    //个人中心列表数据
    if (that.data.module == 'order') {
      that.data.params = common.objToString({
        _pageNum: _pageNum,
        _pageSize: _pageSize,
        merchantId: app.globalData.merchantId,
        orderStatus: that.data.orderStatus,
        _sort: _sort || 'createTime,desc',
      });
      listUrl = Api.getUrl(that.data.module, 'getOrderByUserId') + '?' + that.data.params;// 排序接口地址
    } else {
      if (that.data.module == 'package') {
        that.data.params = common.objToString({
          _pageNum: _pageNum,
          _pageSize: _pageSize,
          merchantId: app.globalData.merchantId,
          ticketType: that.data.ticketType || '',
          _sort: that.data.Ssort || '',
        });

      } else {
        that.data.params = common.objToString({
          _pageNum: _pageNum,
          _pageSize: _pageSize,
          merchantId: app.globalData.merchantId,
          _sort: _sort,
        });
      }
      listUrl = Api.getUrl(that.data.module, 'list') + '?' + that.data.params// 排序接口地址
    }
    common.requestData(listUrl, '', 'GET', token, function (cbData) {
      console.log("-------------------------门票列表--------------------------")
      console.log(cbData)
      if (that.data.module === 'order') {
        cbData.data.content = that.handelOrderData(cbData);
      }
      that.setData({
        sortData: cbData.data.sort,
      })
      let num = cbData.data.totalPages, currPage = _pageNum + 1;
      if (currPage <= num) {
        let listaData = [];
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加
        that.data.isFromSearch ? listaData = cbData.data.content : listaData = that.data.listArray.concat(cbData.data.content)
        that.setData({
          listArray: listaData, //获取数据数组     
          loading: true, //把"上拉加载"的变量设为false，显示  
          loadingComplete: false,
        });
        if (currPage == num) {
          that.setData({
            loadingComplete: true,
            loading: false //把"上拉加载"的变量设为false，显示  
          });
        }

      } else {
        that.setData({
          loadingComplete: true, //把“没有数据”设为true，显示     
          loading: false //把"上拉加载"的变量设为false，隐藏   
        });
      }
    })      
     
  },
  //下拉加载
  dropDown: function (e) {
    let that = this;
    if (that.data.loading && !that.data.loadingComplete) {
      that.setData({
        _pageNum: that.data._pageNum + 1, //每次触发上拉事件，把currPage+1    
        isFromSearch: false //触发到上拉事件，把isFromSearch设为为false   
      });
      if (e.detail.scrollHeight > that.data.winh) {
        that.listData();
      }

    }
  },
  // 获取url地址
  getPreUrl: function (e) {
    wx.setStorageSync('preUrl', e.currentTarget.dataset.url);
  },

  /**
   * 处理订单数据
   */
  handelOrderData: function (datas) {
    console.log(datas)
    let that = this;
    let _orderLists = datas.data.content;
    let _orderRows = [];
    _orderLists.map((item, index) => {
      let _orderDetails = item.orderDetailList[0];
      let _order = {
        createTime: item.createTime?that.getLocalTime(item.createTime,1) :'',
        startDate: item.startDate ? that.getLocalTime(item.startDate,1) : '',
        orderType:_orderDetails.orderType,
        orderStatus: item.orderStatus,
        orderCode: item.orderCode,
        newFee: item.newFee,
        checkStatus: item.checkStatus,
        goodsName: _orderDetails.goodsName,
        quantity: _orderDetails.quantity,
        occDate:_orderDetails.occDate ? that.getLocalTime(_orderDetails.occDate,1) : '' 
      };
      _order.orderTypeName = that.getOrderTypeName(_orderDetails.orderType);
      _order.orderStatusName = that.getOrderStatusName(item.orderStatus);
      _orderRows.push(_order);
    })
    console.log('-------------------------_orderRows-------------------------------')
    console.log(_orderRows)
    return _orderRows;
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
  //时间格式转换
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
    let payStatus = '',className = '';
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
      statusName:payStatus,
      className:className
    })
    return {
      statusName:payStatus,
      className:className
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
