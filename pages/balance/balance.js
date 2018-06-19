//获取应用实例
const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: '',
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
    _sort: '',//排序参数
    module: '',
    params: {},//参数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.listData();
    // 判断是否是登录
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
    let that = this,
      params = '',
      token = wx.getStorageSync('token'),
      _pageNum = that.data._pageNum,
      _sort = that.data._sort,
      _pageSize = that.data._pageSize;
    //查看token是否过期
    params = common.objToString({
      _pageNum: _pageNum,
      _pageSize: _pageSize,
      _sort: that.data._sort,
      merchantId: app.globalData.merchantId,
      status: that.data.status
    })

    let listUrl = Api.getUrl('balance', 'list') + '?' + params;

    common.requestData(listUrl, '', 'GET', token, function (cbData) {
      console.log("-------------------------交易记录--------------------------")
      console.log(listUrl)
      console.log(cbData)
      let num = cbData.data.totalPages, currPage = _pageNum + 1;
      if (currPage <= num) {
        let listaData = [], _content = cbData.data.content;
        _content.map(function (item, index) {
          item.createTime = item.createTime ? that.getLocalTime(item.createTime) : '';
        })
        //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加
        that.data.isFromSearch ? listaData = _content : listaData = that.data.listArray.concat(_content)

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
  //切换列表类型
  changeStatus:function(e){
    let that = this,status = e.currentTarget.dataset.status;
    that.setData({
      status:status,
      _pageNum:0,
      listArray: [],
    })
    that.listData();
  },
  //改变日期的样式
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