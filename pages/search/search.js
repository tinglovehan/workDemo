const app = getApp();
const common = require("../../commonJs/common.js");
const Api = require('../../api/getApi.js');
Page({

  data: {
    _pageNum: 0,//页数
    _pageSize: 10,//每页个数
    loading: false, //"上拉加载"的变量，默认false，隐藏 
    loadingComplete: false, //“没有数据”的变量，默认false，隐藏 
    isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组 
    listArray: [],  //放置返回列表数据的数组  
    params: {},//参数
    packageArr:[],
  },

  onLoad: function (params) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    let that = this;
    // query数据
    that.setData({
      searchName: params.searchName,
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

  //绑定列表页数据
  listData: function (e) {
    let that = this, params, data, listUrl, buyerId,
        token = wx.getStorageSync('token'),
        _pageNum = that.data._pageNum,
        _pageSize = that.data._pageSize;
    // 判断搜索值是否为空
    if (that.data.searchName != 'undefined') {
      that.data.params = common.objToString({
        _pageNum: _pageNum,
        _pageSize: _pageSize,
        merchantId: app.globalData.merchantId,
        name: decodeURI(that.data.searchName),
      });
    } else {
      that.data.params = common.objToString({
        _pageNum: _pageNum,
        _pageSize: _pageSize,
        merchantId: app.globalData.merchantId,
      });
    }

    listUrl = Api.getUrl('ticket', 'list') + '?' + that.data.params;//门票接口地址
    let packageurl = Api.getUrl('package', 'list') + '?' + that.data.params;//套票接口地址

    common.requestData(listUrl, '', 'GET', token, function (cbData) {
      console.log("-------------------------门票搜索--------------------------")
      console.log(cbData)
      let num = cbData.data.totalPages, currPage = _pageNum + 1;
      if (currPage <= num) {
        let listaData = [];
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加
        that.data.isFromSearch ? listaData = cbData.data.content : listaData = that.data.listArray.concat(cbData.data.content)
        if (typeof that.data.listType === 'undefined') {
          if (cbData.data.content.length <= 0) {
            that.setData({
              listType: 'package'
            })
          } else {
            that.setData({
              listType: 'ticket'
            })
          }
        }
        that.setData({
          listArray: listaData, //获取数据数组     
          loading: true, //把"上拉加载"的变量设为false，显示  
          loadingComplete: false,
          module: 'ticket',
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
    common.requestData(packageurl, '', 'GET', token, function (cb) {
      console.log("-------------------------套票搜索--------------------------")
      console.log(cb)
      let num = cb.data.totalPages, currPage = _pageNum + 1;
      if (currPage <= num) {
        let listaData = [];
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加
        that.data.isFromSearch ? listaData = cb.data.content : listaData = that.data.packageArr.concat(cb.data.content)
        if (typeof that.data.listType === 'undefined') {
          if (cb.data.content.length <= 0) {
            that.setData({
              listType: 'ticket'
            })
          } else {
            that.setData({
              listType: 'ticket'
            })
          }
        }
        that.setData({
          packageArr: listaData, //获取数据数组     
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
  tabClick:function(e){
    let that=this;
    that.setData({
      listType: e.currentTarget.dataset.type,
    })
  }
})