//获取应用实例
const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
const WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    autoplay: true,
    interval: 5000,
    duration: 1000,
    swiperCurrent: 0,
    modelExplain:"",
    isShow:true,
    module: '',
    moduleName:'',
    bannersData:'',
    id:'',//接口参数query
    activeIndex: 0, 
    showItems:true,
    bookDate:'',
    itemEq:'-1',
    selectIdArr:[],//票型id数组
    couponPermission:false,
    isScoupon: false,
    min:0,
    max:99,
    totalPrice:0,
    selectNums:0,
    height2: null,
    ticketTab: ["票型", "景区介绍","预定须知"],
    comboTab:['购票','行程详情','预定须知'],
    PnumVal:1,//套票购买默认份数
    PtotalPrice: 0,
   
  
  },
  onLoad: function (params) {
    let that=this,
        date = new Date(),
        Tmonth = date.getMonth() + 1,
        Tyear = date.getFullYear(),
        Tday= date.getDate(),
        startday = that.changeDateType(Tyear, Tmonth, Tday);
    that.setData({
      id: params.id,
      module: params.module,
      startday: startday,
    })
    let member = wx.getStorageSync("member");
    if (member) {
      that.setData({
        member: member
      })
   
    }
    wx.setStorageSync('pageFlag', 'secoondPage');
    that.InforData();
  },
  // 改一下日历的格式
  changeDateType: function (year, month, day) {
    let y = year;
    let m = month;
    if (m < 10) m = "0" + m;
    let d = day;
    if (d < 10) d = "0" + d;
    return y + "-" + m + "-" + d;
  },
  //事件处理函数
  swiperchange: function (e) {
   this.setData({
      swiperCurrent: e.detail.current
    })
  },
  // 门票
  pictureData:function(token,id){
    let that=this,
      imgUrl = Api.getUrl(that.data.module,'detailBanner')+id;
    common.requestData(imgUrl, '', 'GET', token, function (cb) {
      that.setData({
            bannersData: cb.data
          })
          
        })    
  },
  InforData:function(){
    let that = this,
        data={},
        token = wx.getStorageSync('token'),
        id = that.data.id,
        inforUrl = Api.getUrl(that.data.module, 'detail')+id;
    //查看token是否过期
    common.requestData(inforUrl, '', 'GET', token, function (cb) {
      console.log("+++++++++详情++++++++++")
      console.log(cb.data)
      if (cb.statusCode === 200) {
        if (that.data.module == "package") {
          let packLabels = cb.data.labels === null ? [] : cb.data.labels.split(',');
          let ptotalprice = common.getTotalPrice(that.data.PnumVal, cb.data.salePrice);
          that.setData({
            packLabels: packLabels,
            PtotalPrice: ptotalprice
          })
        }
        that.setData({
          infor: cb.data
        })
        if (cb.data.reservationNotes) {
          WxParse.wxParse('orderNotice', 'html', cb.data.reservationNotes, that, 5);
        }
        if (cb.data.detail && that.data.module == "ticket") {
          WxParse.wxParse('detail', 'html', cb.data.detail, that, 5);
        }
        if (cb.data.description && that.data.module == "package") {
          WxParse.wxParse('description', 'html', cb.data.description, that, 5);
        }
        if (that.data.module == "ticket") {
          that.pictureData(token, cb.data.id);
          that.getTicketList(token, cb.data.code);
        }
        that.coupon(token, cb.data.id);

      }
    })  
 },
  
  //地图
  openMap:function(){
    let that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度  
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          name: that.data.addr,
          scale: 28
        })
      }
    })
  },
  //票型列表
  getTicketList:function(token,code){
    let that = this,
        merchantId = app.globalData.merchantId,
        productUrl = Api.getUrl(that.data.module, 'ticketTypeByScenicCode') + code+'/'+ merchantId + '?_sort=id,desc';;
       
    common.requestData(productUrl, '', 'GET', token, function (cb) {
     console.log("===========票型列表===========");
     console.log(cb.data)
     let updaeData = cb.data;
     for (let i = 0; i < updaeData.content.length;i++){
       updaeData.content[i].selected=false;
       updaeData.content[i].numVal=0;
    }
    that.setData({
      productItems: updaeData,
      }) 
     }) 
  },
  // 商户优惠券权限(是否显示优惠券信息的)
  coupon: function (token,id) {
    let that = this, params,
      url = Api.getUrl('coupon', 'permission') + '?merchantId=' + app.globalData.merchantId;
    common.requestData(url, '', 'GET', token, function (cb) {
       console.log('---------------优惠券Data:-----------');
      console.log(cb.data)
      if (cb.statusCode === 200 && cb.data.length > 0) {
        that.setData({
          couponPermission: true,
        })
        if(that.data.module=='ticket'){
        params = common.objToString({
            merchantId: app.globalData.merchantId,
            subLevel: id,
            goodsType: 'scenic'
          });
        } else if (that.data.module == 'package'){
         params = common.objToString({
            merchantId: app.globalData.merchantId,
            subLevel: id,
            goodsType: 'family'
          });
        }
        
        let couponurl = Api.getUrl('coupon', 'scenicList') + '?' + params;
        common.requestData(couponurl, '', 'GET', token, function (cb) {
          console.log('---------------优惠券列表:-----------');
          console.log(cb.data)
          that.setData({
                couponList: cb.data
              })
        })


      }
    })
  },
  dowmCoupon:function(){
    let that=this;
    if (that.data.height2){
      that.setData({
        height2:null,
        jtdirection: true,
      })
    }else{
      that.setData({
        height2: 'auto',
        jtdirection: true,
      })
    }
   
  },
 
  //查看详情弹出层
  lightboxShow:function(e){
     let showInfor="",
          that=this,
         _index = parseInt(e.currentTarget.dataset.index);
    for (let i = 0; i < that.data.productItems.content.length; i++) {
      if (i == _index) {
        WxParse.wxParse('content', 'html', that.data.productItems.content[i].introduction, that, 5);
        that.setData({
          isShow: false,
          orderTitle: that.data.productItems.content[i].name,
          Dprice: that.data.productItems.content[i].salePrice,
          originalprice:that.data.productItems.content[i].costPrice
        })
      }     
    }
    
    
    
  },
  //关闭弹出层
  closeBox:function(e){
    let that=this;
    that.setData({
      isShow: true,
    })
  },
  tabClick: function (e) {
    let that=this;
    that.setData({
      activeIndex: e.currentTarget.dataset.idx
    })
   
  },
  bindDateChange: function (e) {
    let that=this;
    that.setData({
      bookDate: e.detail.value
    })
  },
//  显示领取优惠券
showCouponbox:function(e){
    let that=this,
       text = e.currentTarget.dataset.text,
       couponid = e.currentTarget.dataset.couponid,
       scope = e.currentTarget.dataset.scope,
       validDate = e.currentTarget.dataset.validdate;
    that.setData({
      showCtext: text,
      scouponid: couponid,
      svalidDate: validDate,
      sscope: scope,
      isScoupon:true,
      isSmask:true,
    })  
  },
//领取优惠券
  submitCoupon:function(){
    let that=this,
        token = wx.getStorageSync('token'),
        params = common.objToString({
          merchantId: app.globalData.merchantId,
          couponId: that.data.scouponid,
         }),
        url = Api.getUrl('coupon', 'get') + "?" + params;
    common.requestData(url, '', 'GET', token, function (cb) {
      console.log('============领取优惠券===============');
      console.log(cb.data);
      if (cb.statusCode === 200) {
        that.setData({
          isScoupon: false,
          isSmask: true,
          isScoupon2: true,
          message: '领取成功'
        })
      } else {
        that.setData({
          isScoupon: false,
          isSmask: true,
          isScoupon2: true,
          message: cb.data.message,
        })
      }
    })
   },
  // 取消领取
  hideCouponbox:function(){
   let that=this;
   that.setData({
     isScoupon:false,
     isSmask: false,
     isScoupon2: false,
   })
  },
  hideCouponbox2: function () {
    let that = this;
    that.setData({
      isScoupon2: false,
      isSmask: false,
    })
  },
  // 加 显示加减框
  addCount: function (e) {
    let that = this, tprice,
         _idArr=[],
         selectnum = that.data.selectNums,//选择的份数
         _id=e.currentTarget.dataset.id;
   _idArr.push(_id);
    if (that.data.selectIdArr.length<=0){
      that.data.selectIdArr.push(_idArr[0]);
    }else{
      if (that.data.selectIdArr.indexOf(_id) < 0){
        that.data.selectIdArr.push(_idArr[0]);
      }
    }
   //获取票型id数组
    let modifyData=that.data.productItems;
    modifyData.content.forEach(function (item, index){
      for (let j = 0; j < that.data.selectIdArr.length; j++) {
        if (item.id == that.data.selectIdArr[j]) {
          // 修改数据 （减和文本框值的显示隐藏）
          modifyData.content[index].selected = true;
          let value = modifyData.content[index].numVal, addvalue,
            max = that.data.max;
          if (value >= max) {
            return;
          } else if (_id == that.data.selectIdArr[j]) {
            modifyData.content[index].numVal = value + 1;
            selectnum += 1;
            console.log(that.data.selectIdArr)
          }

        }
      }
    }) 
   
    let total = that.allSelectPrice()
    that.setData({
      productItems: modifyData,
      selectNums: selectnum,
      totalPrice: total,
    })
  },
  // 减
  reduceCount: function (e) {
    let that = this,
      selectnum = that.data.selectNums,//选择的份数
      r_id = e.currentTarget.dataset.id;
    let modifyData = that.data.productItems;
    for (let i = 0; i < modifyData.content.length; i++) {
      for (let j = 0; j < that.data.selectIdArr.length; j++) {
        if (modifyData.content[i].id == that.data.selectIdArr[j]) {
            let value = modifyData.content[i].numVal, addvalue,
              max = that.data.max;
          if (value >= max) {
              return false;
            } else if (r_id == that.data.selectIdArr[j]) {
              modifyData.content[i].numVal = value - 1;
              selectnum -= 1;
              console.log(that.data.selectIdArr)
            }
         if (modifyData.content[i].numVal <= 0) {
           // 修改数据 （减和文本框值的显示隐藏）
           modifyData.content[i].selected = false;

           if (r_id == that.data.selectIdArr[j]) {
             that.data.selectIdArr.splice(j, 1);
            
             console.log(that.data.selectIdArr)
           }
         }
        }
      }
    }
    let total = that.allSelectPrice()
    that.setData({
      productItems: modifyData,
      selectNums: selectnum,
      totalPrice: total,
    })
  },
  //总价
  allSelectPrice:function(){
    let that = this, tprice = 0;
    that.data.productItems.content.forEach(function (t) {
      tprice+= common.getTotalPrice(t.numVal, t.salePrice);
    });
    return parseFloat(tprice).toFixed(2);
  },
  // 校验 并预定
  toOrder:function(){
    let that = this, occDate, ticketIdArr = that.data.selectIdArr,
         orderArr = [],
         checkArr = [],
         token = wx.getStorageSync('token'),
         realNameNums = [];//实名制预定的数量数组
    if (that.data.selectIdArr.length<=0){
       return false;
    }
    wx.showLoading({
      title: '正在预定中',
      mask:true,
    })
    // 时间获取
    if (that.data.bookDate==''){
     let now = new Date();
      now.setHours(0)
      now.setMinutes(0)
      now.setSeconds(0)
      now.setMilliseconds(0)
      occDate = now.getTime();
    }else{
      occDate = new Date(that.data.bookDate).getTime()
    }
    that.data.productItems.content.forEach(function (item, index) {
      // 实名制选择的份数
      if (item.numVal > 0 && item.realnameRequired ==="realname" ){
        realNameNums.push(item.numVal);
      }
      if (item.numVal > 0){
        let ticketObj = {
                id: item.id,
                num: item.numVal
              },
            checkObj = {
              "ticketTypeName": item.name,
              "quantity": item.numVal,
              "price": item.salePrice,
              "ticketTypeCode": item.code,
              "ticketType": item.type,
              "isCertAuth": item.realnameRequired === 'realname' ? 'T' : 'F',
              "occDate": occDate
            };
        orderArr.push(ticketObj);
        checkArr.push(checkObj);    
      }
    })
    let sameRealName = true;
    for (let j = 0; j < realNameNums.length - 1; j++) {
      if (realNameNums[j] !== realNameNums[j + 1]) {
        sameRealName = false
      }
    }
    // 实名制选择的数量是否相同
    if (!sameRealName) {
      setTimeout(function () {
        wx.hideLoading()
      }, 300)
      wx.showModal({
        title: '提示',
        content: '实名制门票需要选择相同数量！',
        mask:true,
      })
   
      return false
    }
    if (ticketIdArr.length > 0) {
      let checkData = {
            totalPrice: that.data.totalPrice,
            ticketDtos: checkArr
          },
          orderInfo = {
            occDate: occDate,
            orderInfo: orderArr
          };
      checkData.merchantId= app.globalData.merchantId;
      let url = Api.getUrl('order', 'checkOrder');
      common.requestData(url, checkData, 'POST', token, function (cb) {
        console.log(cb)
        if (cb.statusCode === 200) {
          wx.setStorageSync('ticketOrderInfo', orderInfo)
          setTimeout(function () {
            wx.hideLoading()
          }, 300)
          wx.redirectTo({
            url: '../order/order?module=ticket&id=' + that.data.id,
          })
        } else {
          setTimeout(function () {
            wx.hideLoading()
          }, 300)
          wx.showModal({
            title: '提示',
            content: cb.data.message,
            mask: true,
          })
        }
      })
     }
 },
  // 套票加减
  PreduceCount:function(e){
    let that = this, tprice,
        price = e.currentTarget.dataset.price,
       num = parseInt(that.data.PnumVal);
    if(num<=1){
      return false;
    }else{
      num = num - 1;
      tprice = common.getTotalPrice(num, price);
    }
   that.setData({
      PnumVal: num,
      PtotalPrice: tprice,
    })    
  },
  PaddCount: function (e) {
    let that = this, tprice,
      price = e.currentTarget.dataset.price,
      num = parseInt(that.data.PnumVal);
    if (num>=that.data.max) {
      return false;
    } else {
      num = num + 1;
      tprice = common.getTotalPrice(num, price);
    }
    that.setData({
      PnumVal: num,
      PtotalPrice: tprice,
    })
  },
  // 套票提交订单
  PtoOrder:function(e){
    let that = this, occDate, 
          infor = that.data.infor,
          token = wx.getStorageSync('token'),
          id = e.currentTarget.dataset.id;
      wx.showLoading({
        title: '正在预定中',
        mask: true,
      })
      // 时间获取
    if (that.data.bookDate == '') {
        let now = new Date();
        now.setHours(0)
        now.setMinutes(0)
        now.setSeconds(0)
        now.setMilliseconds(0)
        occDate = now.getTime();
      } else {
        occDate = new Date(that.data.bookDate).getTime()
      }

    let orderInfo={
        "occDate": occDate,
        "orderInfo":{
          id: id,
          num: that.data.PnumVal,
        }
        },
        checkData={
          merchantId: app.globalData.merchantId,
          ticketDtos:[{
            "ticketTypeName": infor.name,
            "quantity": that.data.PnumVal,
            "price": infor.salePrice,
            "ticketTypeCode": infor.code,
            "ticketType": "",
            "isCertAuth": infor.realnameRequired === 'realname' ? 'T' : 'F',
            "occDate": occDate
          }],
          totalPrice: that.data.PtotalPrice,
        };   
    let url = Api.getUrl('order', 'checkOrder');
    common.requestData(url, checkData, 'POST', token, function (cb) {
      console.log(cb)
      if (cb.statusCode === 200) {
        wx.setStorageSync('ticketOrderInfo', orderInfo)
        setTimeout(function () {
          wx.hideLoading()
        }, 300)
        wx.redirectTo({
          url: '../order/order?module=package&id=' + id,
        })
      } else {
        setTimeout(function () {
          wx.hideLoading()
        }, 300)
        wx.showModal({
          title: '提示',
          content: cb.data.message,
          mask: true,
        })
      }
    })
  }
})