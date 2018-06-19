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
    params: {},//参数
  },

  onLoad: function (params) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this;
    that.setData({
      type: params.type,
    })
     wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winh: res.windowHeight,
        })
      }
    })
    that.listData();
  },
  listData: function (e) {
    let that = this, params, data, listUrl, buyerId,
      token = wx.getStorageSync('token'),
      _pageNum = that.data._pageNum,
      _pageSize = that.data._pageSize;
    // 周边新闻列表
    that.data.params = common.objToString({
      _pageNum: _pageNum,
      _pageSize: _pageSize,
      merchantId: app.globalData.merchantId,
      type: 1,
      _sort: 'createTime,desc',
      status: 1,
    });

    listUrl = Api.getUrl('news', 'list') + '?' + that.data.params;
    common.requestData(listUrl, '', 'GET', token, function (cbData) {
      console.log("-------------------------新闻列表--------------------------")
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

})