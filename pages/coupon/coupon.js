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
    sort: 'createTime, desc',//排序参数
    module: '',
    params: {},//参数
    couponType: 'unuse',
    Sflag:0,
    type:'all',
    isShowI: true,
    nowDate:new Date().getTime()
  },

  onLoad: function (params) {
    let that = this;
    that.setData({
      module: params.module
    })
    let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
    }
    that.listData(); 
    if (params.module == 'order') {
      that.setData({
        orderStatus: params.orderStatus
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winh: res.windowHeight,
        
        })
      }
    })
    wx.setStorageSync('pageFlag', 'secoondPage');
  },

  //绑定列表页数据
  listData: function (e) {
    let that = this, params, data, listUrl, buyerId, type = that.data.type,
      token = wx.getStorageSync('token'),
      _pageNum = that.data._pageNum,
      _pageSize = that.data._pageSize,
      _couponType = that.data.couponType;
    if (that.data.module === "voucher") {
      // 领券中心
      that.data.params = common.objToString({
        _pageNum: _pageNum,
        _pageSize: _pageSize,
        merchantId: app.globalData.merchantId,
        type: type,
      });
      listUrl = Api.getUrl('coupon', 'list') + '?' + that.data.params
    }
    else {
      that.data.params = common.objToString({
        _pageNum: _pageNum,
        _pageSize: _pageSize,
        merchantId: app.globalData.merchantId
      });
      // 个人中心优惠券
      if (_couponType === 'unuse') {
        listUrl = Api.getUrl('coupon', 'unUseList') + '?' + that.data.params// 接口地址
      } else {
        listUrl = Api.getUrl('coupon', 'invalidUseList') + '?' + that.data.params// 接口地址
      }
    }
    common.requestData(listUrl, '', 'GET', token, function (cbData) {
      console.log("-------------------------优惠劵列表--------------------------")
      console.log(cbData)
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
  /**
   *切换列表的类型 
   *unuse or invalid
   */
  changeType: function (e) {
    let that = this, _type = e.currentTarget.dataset.type;
    if (that.data.module =='voucher'){
      that.setData({
       type: _type,
        _pageNum: 0,
        listArray: []
      })
      that.listData();
    }else{
      if (_type !== that.data.couponType) {
        that.setData({
          couponType: _type,
          _pageNum: 0,
          listArray: []
        })
        that.listData();
      }
    }
    
  },
  // 显示领券中心介绍
  showInrtd:function(e){
    let that=this,
        flag = e.currentTarget.dataset.flag,
       sindex = e.currentTarget.dataset.index;
    if(flag==0){
      that.setData({
        Sflag:1,
        sindex: sindex,
      })
    }else{
      that.setData({
        Sflag: 0,
        sindex: -1,
        
      })
    }    
  },
  getCoupon:function(e){
    let that=this,
         token = wx.getStorageSync('token'),
        id = e.currentTarget.dataset.counponid;
    let params = common.objToString({
      couponId: id,
      merchantId: app.globalData.merchantId
    }),
    url = Api.getUrl('coupon', 'get') + '?' + params;
    common.requestData(url, '', 'GET', token, function (cb) {
      if (cb.statusCode == 200) {
        that.setData({
          tipsData: cb.data,
          onoff: false,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: cb.data.message,
        })
      }
    })   
     
  },
  // 关闭提示框
  colseCbox:function(){
   let that=this;
   that.setData({
    onoff: true,
   })
  }

})