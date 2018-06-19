const app = getApp();
const common = require("../../commonJs/common.js");
const Api = require('../../api/getApi.js');
Page({
  data: {
    autoplay: true,
    interval: 5000,
    duration: 1000,
    logoData:'',//logo数据
    bannerData:'',//轮播图数据
    scenicData:'',//门票数据
    packageData:'',//套票数据
    newsData:'',//新闻数据
    couponPermission:false,//是否显示优惠信息
    recommendScenicData:'',//推荐景区
    recommendPackageData:'',//推荐套票
    moduleType:'',//显示首页页面状态（是否单景区）
    swiperCurrent2:1,
    swiperCurrent:0,
  },
 onLoad: function () {
    let that=this;
    
    if(!wx.getStorageSync('token')){
     app.login(function(user){
       if(user){
         that.getIndexData();
         that.IsIndex();
       }
     });
    }else{
      that.getIndexData();
       that.IsIndex();
    }
    wx.setStorageSync('pageFlag', 'index')
  },
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  swiperchange2: function (e) {
    let that=this,
        length = that.data.indexData.listVo.length,
        index = e.detail.current;
    this.setData({
      swiperCurrent2: parseInt(e.detail.current)+1
    })
    if (index==0){
      that.setData({
        duration2: 1000,
      })
    }
    if (index == length/2) {
      index = 0;
      that.setData({
        duration: 1,
        s_index: index,
      });
    }
  },
  // // 查询系统设置首页
  IsIndex:function(e){
    let that=this,
        params = {
          merchantId: app.globalData.merchantId,
          _pageNum: 0,
          _pageSize: 5
        },
     
        method="GET",
        token = wx.getStorageSync('token');
    //that.logoData();
    //that.banner(params, token);
    //that.ticketList(params, token);
    that.packageList(params, token);
    that.coupon(token);
    that.news(token);
  },
  // 获取首页数据
  getIndexData: function () {
    let that = this,
      params = {
        merchantId: app.globalData.merchantId,
        _pageNum: 0,
        _pageSize: 5
      },
      token = wx.getStorageSync('token'),
      url = Api.getUrl('index', 'index') + '?' + common.objToString(params);
    common.requestData(url, params, 'post', token, function (cb) {
      if (cb.statusCode === 200){
        that.setData({
          indexData: cb.data,
          moduleType: 1,
        })
        let recData = cb.data.listVo;
        let result=[];
        for (var i = 0;i < recData.length; i += 2) {
          result.push(recData.slice(i, i + 2));
        }
        that.setData({
          recomData: result,
        })
      }
      
      
    })
  },
  // logo数据
  logoData:function(){
    let that=this,
      url =Api.getUrl('index', 'qyyx') + app.globalData.merchantId,
      token = wx.getStorageSync('token');
  common.requestData(url, '', 'GET', token, function (cb) {
      console.log('---------------logoData:-----------');
      console.log(cb.data)
      if (cb.statusCode === 200){
        that.setData({
          logoData: cb.data,
        })
      }
     
    })
  },
  // 轮播图
  banner: function (params, token){
    let that = this,
        url =Api.getUrl('index', 'banner') + '?' + common.objToString(params);
    console.log('444444444444')
    common.requestData(url, '', 'GET', token, function (cb) {
      console.log('---------------bannerData:-----------');
       console.log(url)
      console.log(cb)
      if (cb.statusCode === 200) {
        that.setData({
          bannerData: cb.data,
        })
      }

    })    
  },
  // 门票列表
  ticketList: function (params, token) {
    let that = this,
      url =Api.getUrl('index', 'scenic') + '?' + common.objToString(params);
    console.log('555555')
    console.log(url)
    common.requestData(url, '', 'GET', token, function (cb) {
      console.log('---------------scenicData:-----------');
      console.log(cb.data)
      if (cb.statusCode === 200) {
        that.setData({
          scenicData: cb.data,
        })
      }

    })
  },
  // 套票列表
  packageList: function (params, token) {
    let that = this,
      url =Api.getUrl('index', 'package') + '?' + common.objToString(params);
    common.requestData(url, '', 'GET', token, function (cb) {
      // console.log('---------------packageData:-----------');
      // console.log(cb.data)
      if (cb.statusCode === 200) {
        that.setData({
          packageData: cb.data,
        })
        that.recommend(params, token, cb.data);
       }

    })
    
  },
  // 商户优惠券权限(是否显示优惠券信息的)
  coupon:function(token){
      let that=this,
          url =Api.getUrl('coupon', 'permission') + '?merchantId=' + app.globalData.merchantId;
      common.requestData(url, '', 'GET', token, function (cb) {
        // console.log('---------------优惠券Data:-----------');
        // console.log(cb.data)
        if (cb.statusCode === 200 && cb.data.length > 0) {
          that.setData({
            couponPermission:true,
          })
        }
    })
  },
  // 新闻列表
  news:function(token){
    let that=this,
        newsParams = {
          merchantId: app.globalData.merchantId,
          _pageNum: 0,
          _pageSize: 10,
          _sort: 'createTime,desc',
          type: 0,
          status: 1
        },
        url =Api.getUrl('news', 'list') + '?' + common.objToString(newsParams);
    common.requestData(url, '', 'GET', token, function (cb) {
      // console.log('---------------newsData:-----------');
      // console.log(cb.data)
      if (cb.statusCode === 200) {
        that.setData({
          newsData: cb.data,
        })
      }
    })
  },
  // 推荐
  recommend: function (params, token,data){
    let that = this, rectotalnum, recnum1, recnum2;
    if (data.content.length>0){
      params._pageSize = 10;
     let recommendPackageUrl =Api.getUrl('index', 'recommendPackage') + '?' + common.objToString(params);
       common.requestData(recommendPackageUrl, '', 'GET', token, function (cb) {
          // console.log('---------------推荐套票Data:-----------');
          // console.log(cb.data)
          if (cb.statusCode === 200) {
            rectotalnum = recnum1 + parseInt(cb.data.length)
            let result = [];
            for (var i = 0; i < cb.data.length; i += 2) {
              result.push(cb.data.slice(i, i + 2));
            }
            that.setData({
              recommendPackageData: result ,
              rectotalnum: rectotalnum,
              moduleType: 1,
            })
          }
       })
     
      
     
    }else{
      that.setData({
       moduleType: 0,
      })
    }
  },
  // 搜索
  searchInput:function(e){
    let that=this,
      value = e.detail.value;
    that.setData({
      searchName: value,
    })
  },
  search:function(){
    let that = this;
   wx.navigateTo({
      url: '../search/search?searchName=' + that.data.searchName,
   })
  }
  
})