const app = getApp();
const Api = require('../../api/getApi.js')
const common = require('../../commonJs/common.js')
Page({
  data: {
    odTitle:'',
    id:'',//门票id
    bookday:'',//选中日期
    num: {},//最大购买最小购买值身份证是否必填
    leftSum:0,//当天可选库存
    numVal:1,
    totalprice:0,
    price:0,
    isRealname:'',
    module:'',
    realNameArr:[],
    ticketDataArr:[],
    linkMans:'',//联系人
    teles:'',//手机号
    idNos:'',//身份证
    ifIdCardFlag: 'F', // 身份证必填 默认否
    flag1:-1,
    flag2: -1,
    flag3: -1,
    flag4: -1,
    flag5: -1,
    sFlag:1,//处理提交订单按钮只能点击一次
    couponIndex:0,
    showCoupon:true,
    hasSelected:false,//优惠券是否选中
    useClickID:'',//用来判断是哪个票型id点击进去的优惠券
    payShow:0,
    RealShow:true,
    realNums:'',
    selectedRealArr:[],
    tnshow:false,
    Ranums :0,
    Iflag:1,
  
  },
  onLoad: function (options) {
    wx.setStorageSync('pageFlag', 'secoondPage');
    var that=this;
    that.setData({
      module: options.module,
      id: options.id,
    })
    
    that.getOrder()
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
      let getDate2=that.changeDateType(DateArr[0], DateArr[1],DateArr[2])
      that.setData({
        bookDate: getDate2,
        occDate: nS,
      })
    }
  },
  
 //初始化绑定数据
 getOrder:function(){
   let that = this, orderTicket,
        token = wx.getStorageSync('token');
    // 取订单信息
    orderTicket = wx.getStorageSync('ticketOrderInfo');
    // 如果保存的下单信息不存在，展示提示页面
    if (!orderTicket) {
      wx.redirectTo({
        url: '../orderInfoLost/orderInfoLost?module=that.data.module&id=that.data.id',
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    let ticketArr = orderTicket.orderInfo;
    let occDate = orderTicket.occDate;
    let ticketDataArr = [];
    that.getLocalTime(occDate,1);
    // 商户优惠券权限
    let couponurl = Api.getUrl('coupon', 'permission') + '?merchantId=' + app.globalData.merchantId;
    common.requestData(couponurl, '', 'GET', token, function (cb) {
      if (cb.statusCode === 200 && cb.data.length > 0) {
        that.setData({
          couponPermission: true,
        })
        if (that.data.module == "ticket") {
          that.ticketType(ticketArr, token);
        }
      }
    })
    that.scenicInfo(token);
    that.userInfor(token);
   },
  // 多个票型信息
 ticketType:function (ticketArr,token){
  let that = this;
  let index = 0;
  let ticketLength = ticketArr.length;
  let newArr = [], realName = false, realNums =0,realNArr=[];
  getTicketList(ticketArr,token, index);
  function getTicketList(ticketArr, token, index){
    if (index >= ticketLength) return false;
    let ticketId = ticketArr[index].id, 
      ticketNum = +ticketArr[index].num,
     ticketUrl = Api.getUrl('ticket', 'ticketTypeById') + ticketId;
    common.requestData(ticketUrl, '', 'GET', token, function (cb) {
      console.log("_________票型信息__________");
      console.log(cb)
      if (cb.statusCode === 200) {
        let ticketData = cb.data;
        ticketData.orderNums = ticketNum;
        
        // 插入票型信息和对应优惠券信息
        let ticketObj = {
          ticketData: ticketData
        };
         // 是否开启优惠券插件
        if (that.data.couponPermission) {
          // 优惠券信息
          let couponParams = common.objToString({
            products: ticketData.id,
            productTypes: ticketData.type,
            amount: ticketData.salePrice * ticketNum,
            merchantId: app.globalData.merchantId,
          }),
            couponUrl2 = Api.getUrl('coupon', 'orderList') + '?' + couponParams;
          common.requestData(couponUrl2, '', 'GET', token, function (cbcp) {
            if (cbcp.statusCode === 200) {
              console.log("=============优惠券信息================");
              console.log(cbcp);
              cbcp.data.couponTxt=null;
              ticketObj.couponData = cbcp.data;
              newArr.push(ticketObj);
              index++;
              getTicketList(ticketArr, token, index);
              console.log("++++++++++最终数组++++++++++");
              console.log(newArr);
             
              newArr.forEach((item, index) => {
                if (item.ticketData.realnameRequired == "realname") {
                  realName = true;
                  if (item.ticketData.orderNums>0){
                    realNums = + item.ticketData.orderNums;
                  }
                }
              });
             
             that.calcTotalPrice(newArr)
              that.setData({
                ticketDataArr: newArr,
                realName: realName,
                realNums: realNums,
               
              });
            }
          })
        }else{
          newArr.push(ticketObj);
          index++;
          getTicketList(ticketArr, token, index);
          newArr.forEach((item, index) => {
            if (item.ticketData.realnameRequired == "realname") {
              realName = true;
              if (item.ticketData.orderNums > 0) {
                realNums = + item.ticketData.orderNums;
              }
            }
          });
          wx.hideLoading();
          that.calcTotalPrice(newArr)
          that.setData({
            ticketDataArr: newArr,
            realName: realName,
            realNums: realNums,

          });
        }
        // 是否必填身份证
      let ifIdCardUrl = Api.getUrl('ticket', 'getRules') + '?restrictionRulsId=' + ticketData.restrictionRulsId;
      common.requestData(ifIdCardUrl, '', 'GET', token, function (cbCard) {
          if (cbCard.data === 'T') {
            that.setData({
              ifIdCardFlag: 'T'
            })
          }
        })
      }
    }) 
  }
 
 },
// 套票信息
 packageType: function (packageData,token){
    let that=this;
    console.log('bbbbbbbbbbbbbbb')
    console.log(that.data.couponPermission)
    if (that.data.couponPermission) {
      // 优惠券信息
      let couponParams = common.objToString({
        products: packageData.id,
        productTypes: packageData.category,
        amount: packageData.salePrice,
        merchantId: app.globalData.merchantId,
      }),
        url = Api.getUrl('coupon', 'orderList') + '?' + couponParams;
      common.requestData(url, '', 'GET', token, function (cb) {
        console.log('---------套票优惠券--------')
        console.log(cb)
        if (cb.statusCode === 200) {
           cb.data.couponTxt = null;
           cb.data.packageid = packageData.id;
           let newArr = [{
             couponData: cb.data,
             ticketData: packageData,
           }]
           that.setData({
             couponData: cb.data,
             ticketDataArr: newArr
           })
         that.calcTotalPrice(newArr)
        }
      })   
    }else{
      let newArr = [{
        ticketData: packageData,
      }]
      that.calcTotalPrice(newArr)
    }
  
  },
// 景区信息
 scenicInfo: function (token) {
   let that = this,
       orderTicket = wx.getStorageSync('ticketOrderInfo'),// 取订单信息
       url = Api.getUrl(that.data.module, 'detail')+ that.data.id;
  common.requestData(url, '', 'GET', token, function (cb) {
     console.log('1111111111 景区信息1111111111111111111')
     console.log(cb.data)
     if(that.data.module=="package"){
        if (cb.data.realnameRequired ==="realname"){
         that.setData({
            realName: true,
            realNums: orderTicket.orderInfo.num,
            })
        }
        cb.data.orderNums = orderTicket.orderInfo.num;
       //身份证是否必填
        if (cb.data.ifIdcard === 'T') {
          that.setData({
            ifIdCardFlag: 'T'
          })
          }
        that.packageType(cb.data, token)
      }
     that.setData({
       scenicData: cb.data,
       orderNums: orderTicket.orderInfo.num
      })
   })   
 },
// 获取用户信息
  userInfor:function(token){
    let that=this,
      url = Api.getUrl('user', 'getUserInfo') + token + '/' + app.globalData.merchantId;
    common.requestData(url, '', 'GET', token, function (cb) {
      console.log('222222222222用户信息22222222222');
      console.log(cb.data);
      that.setData({
        userInforData: cb.data,
      })
    })
  },
  //优惠券列表
  useCoupon: function (e) {
    let that = this,
      token = wx.getStorageSync('token'),
      id = e.currentTarget.dataset.id,
      type = e.currentTarget.dataset.type,
      price = e.currentTarget.dataset.price,
      num = e.currentTarget.dataset.num,
      totalPrice = common.getTotalPrice(num, price);
    let params = common.objToString({
      products:id,
      productTypes: type,
      amount: totalPrice,
      merchantId: app.globalData.merchantId
    }),
      url = Api.getUrl('coupon', 'orderList') + '?' + params;
    common.requestData(url, '', 'GET', token, function (cb) {
      if (cb.statusCode === 200) {
        let couponData = cb.data;
        // 删除已使用过的不可用优惠券
        couponData.cantUse.forEach((t, i) => {
          if (t.orderId) {
            couponData.cantUse.splice(i, 1);
          }
          t.hasSelected = false;
        });
        // 选择优惠券后修改订单票型数据

        let ticketlist2 = that.data.ticketDataArr;
        couponData.useable.forEach((item, index) => {
          for (let j = 0; j < ticketlist2.length; j++) {
            if (item.id === ticketlist2[j].selectCouponId) {
              item.hasSelected = true;
            }
          }

        });
        that.setData({
          couponDatalist: couponData,
        })
      }
      console.log("_____________可用的优惠券列表____________________")
      console.log(that.data.couponDatalist)
    })
    that.setData({
          showCoupon: false,
          useClickID:id,
        })
  },
  canCoupon:function(e){
    let that = this,
        idx = e.currentTarget.dataset.idx;
    that.setData({
      couponIndex: idx,
    })
  },
  // 关闭优惠券列表
  closeCoupon:function(e){
    let that=this;
    that.setData({
      showCoupon: true,
    })
  },
// 选择优惠券
  selectCouponClick:function(e){
    let that = this, id = e.currentTarget.dataset.getid,
        token = wx.getStorageSync('token'),
        useLimit = e.currentTarget.dataset.useLimit,
        url = Api.getUrl('coupon', 'discount') + id,
       useAblelist = that.data.couponDatalist.useable;
    let flag = true;
    useAblelist.forEach((item, index) => {
      // 已经选择后不能点击
      if (id === item.id && item.hasSelected){
        wx.showModal({
          title: '提示',
          content: '此优惠券已经选过，不能再选',
          
        })
       flag=false;
      }
      return false;
   });
   if(!flag){
     return false;
   }
   common.requestData(url, '', 'GET', token, function (cb) {
     console.log(cb)
     if (cb.statusCode === 200) {
       let couponMoney = cb.data.money,
         couponDiscount = cb.data.discount,
         couponType = couponMoney ? 'money' : 'discount';
       var couponTxt = '';
       if (couponMoney) {
         couponTxt = '- ¥' + couponMoney;
       }
       if (couponDiscount) {
         couponTxt = couponDiscount + '折';
         couponMoney = couponDiscount;
       }

       //  选择优惠券后修改优惠券列表数据
       let ticketlist = that.data.ticketDataArr;
       ticketlist.forEach((item, index) => {
         if (that.data.useClickID == item.ticketData.id) {
           item.couponData.couponTxt = couponTxt;
           item.couponData.couponMoney = couponMoney;
           item.couponData.couponType = couponType,
             item.selectCouponId = id;
         }
       });
       that.calcTotalPrice(ticketlist);
       that.setData({
         ticketDataArr: ticketlist,
         showCoupon: true,
       })

     }
   })
   },
  // 不适用优惠券
  noSelect:function(e){
    let that=this;
    let ticketlist = that.data.ticketDataArr;
    ticketlist.forEach((item, index) => {
      if (item.ticketData.id == that.data.useClickID) {
        item.couponData.couponTxt = null;
        item.couponData.couponMoney = null;
        item.couponData.couponType = null,
        item.selectCouponId = null;
      }
      });
      that.setData({
        ticketDataArr: ticketlist,
        showCoupon: true,
      })
      // 计算总价
      that.calcTotalPrice(ticketlist);
  },
// 计算总价
calcTotalPrice:function(ticketList){
    let totalPrice = 0,that=this;
    ticketList.forEach((item, index) => {
     let couponType, couponMoney, couponId;
      if (item.couponData){
        couponType = item.couponData.couponType;
        couponMoney = item.couponData.couponMoney;
        couponId = item.selectCouponId;
      }
      let salesPrice = item.ticketData.salePrice,
            quantity = item.ticketData.orderNums,
            withCouponPrice = common.accMul(salesPrice, quantity);
      if (couponId){
       if (couponType === 'money') {
          withCouponPrice = common.accSub(couponMoney, withCouponPrice) < 0 ? 0 : common.accSub(couponMoney, withCouponPrice);
        }
        if (couponType === 'discount') {
          withCouponPrice= (common.accMul(withCouponPrice, couponMoney * .1)).toFixed(2);
           withCouponPrice = Math.ceil(withCouponPrice * 100) / 100;
        }   
      }    
      totalPrice = common.accAdd(withCouponPrice, totalPrice);
   });
    that.setData({
      totalPrice:totalPrice,
    })
  },
  // 显示实名制
showRealbox:function(e){
  let that = this,
    nums = +e.currentTarget.dataset.num,
    type = e.currentTarget.dataset.type;
  that.getRealNameList(nums);
  that.setData({
    RealShow: false,
    realType: type,
    arnums: nums,
  })
},
// 实名制列表选择
getRealNameList: function(nums){
  let  that=this,
       num = nums,
       token = wx.getStorageSync('token'),
       selectedRealArr = that.data.selectedRealArr,
       url = Api.getUrl('user', 'realName') + '?merchantId=' + app.globalData.merchantId;
  common.requestData(url, '', 'GET', token, function (cb) {
    that.data.Ranums = 0;
    if (cb.statusCode === 200) {
      let realData = cb.data;
      if (selectedRealArr.length > 0) {
        realData.content.forEach((item, index) => {
          for (let k = 0; k < selectedRealArr.length; k++) {
            if (item.id == selectedRealArr[k].id) {
              item.checked = true;
              that.data.Ranums++;
            }
          }
        });
        realData.content.forEach((item, index) => {
          item.ycertNo = common.replaceCertNo(item.certNo);
          item.yname = common.replaceName(item.name);
          if (!item.checked) {
            if (that.data.Ranums == that.data.realNums) {
              item.disabled = true;
            } else {
              item.disabled = false;
            }
          }
        });
      } else {
        realData.content.forEach((item, index) => {
          item.ycertNo = common.replaceCertNo(item.certNo);
          item.yname = common.replaceName(item.name);
          item.disabled = false;
          item.checked = false;
        })
      }
      console.log("+++++++实名制列表+++++=");
      console.log(realData)
      that.setData({
        realList: realData,
      })
    }
  })
},
// 添加实名制信息
  addReal:function(e){
   let that=this,
     type = e.currentTarget.dataset.type;   
   that.setData({
     realType: type,
     Rid:'',
     Rname:'',
     tips:'',
   })
  },
  // 提交实名制信息
  addSubmit:function(e){
    console.log('________aaaaaaaaaaaaaaaaaaaa_________-');
    console.log(this.data)
    let that=this,
        type = e.currentTarget.dataset.type;
         
    //提交错误描述
    if (that.data.tips) {
      wx.showModal({
            title: '提示',
            content: '请输入实名制信息！',
      })
        return false;
      
    } 
    
    let data = {
      certNo: that.data.Rid,
      name: that.data.Rname,
      merchantId: app.globalData.merchantId,
    }, url, method;
    if (type ==='addOredit'){
      if (that.data.realType == 'add') {
        url = Api.getUrl('user', 'realName');
        method = 'POST';
      } else if (that.data.realType == 'edit') {
        method = 'PUT';
        url = Api.getUrl('user', 'realName');
        data.id = that.data.edID
      }
    } else if (type === 'del'){
      method = 'DELETE';
      data='';
      url = Api.getUrl('user', 'realName') + that.data.edID;
    }
   let  token = wx.getStorageSync('token');
   common.requestData(url, data, method, token, function (cb) {
     if (cb.statusCode === 200) {
       that.setData({
         addReal: cb.data,
         realType: 'list',
       })
       that.getRealNameList(that.data.arnums);
     } else {
       wx.showModal({
         title: '提示',
         content: cb.data.message,
       })
     }
   }) 
  },
// 关闭实名制
  closeRealbox:function(e){
    let that=this;
     that.setData({
      RealShow:true,
      Ranums:0,
    
    })
  },
  closeRealbox2: function (e) {
    let that = this;
    that.setData({
      realType:'list',
    })
  },
  // 实名制勾选
  checkboxChange:function(e){
    let that = this,  tnshow, reaObj,
        requireNum = that.data.realNums,
        realList = that.data.realList,
        T_id = e.currentTarget.dataset.id,
        T_name = e.currentTarget.dataset.name,
        T_certno = e.currentTarget.dataset.certno;
    
    realList.content.forEach((item, index) => {
      // 判断是否已选中并且已选数量小于等于实名票型要求的数量
      
        if (item.id == T_id) {
          item.checked = !item.checked;
          // 选中+1，取消-1
          if (item.checked) {
            that.data.selectedRealArr.push(item);
            that.data.Ranums++;
          } else {
            for (let m = 0; m < that.data.selectedRealArr.length; m++) {
              if (that.data.selectedRealArr[m].id == T_id) {
                that.data.selectedRealArr.splice(m, 1);
              }
            }
            that.data.Ranums--;
          }
        }
    });
    console.log("_______选择的_________")
    console.log(that.data.selectedRealArr);
    realList.content.forEach((item, index) => {
      if (!item.checked) {
        console.log(item.id, that.data.Ranums)
        if (that.data.Ranums == requireNum) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      }
    })
    that.setData({
      //selectedReal: selectedReal,
      realList: realList,
      tnshow: true,
    });
    
  },
  // 确认选择
  Okselect:function(){
    let that=this;
    that.setData({
      selectedRealArr: that.data.selectedRealArr,
      RealShow: true,
      Ranums: that.data.Ranums,
    }) 
  },
// 删除选择的实名制信息
  deleteReal:function(e){
   let that=this,
     _id = e.currentTarget.dataset.id,
     DrealArr = that.data.selectedRealArr;
    DrealArr.forEach((item,index)=>{
     if (item.id === _id){
       DrealArr.splice(index,1);
     }
    })
    that.setData({
      selectedRealArr: DrealArr,
      tnshow:false,
      Ranums: that.data.Ranums-1,
    })
  },
  // 修改实名制
  editReal:function(e){
    let that=this,
      id = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name,
      certno = e.currentTarget.dataset.certno;
    that.setData({
      edName: name,
      edID: id,
      edIdcard: certno,
      realType: 'edit',
      Rid: certno,
      Rname: name,
      tips:'',
    })  
  },

  //提交订单
  submitOrder: function (e) {
    let that = this,
        dflag = e.currentTarget.dataset.flag;
    if (dflag===0){
      return false;
    }else{
      wx.showLoading({
        title: '正在提交中',
        mask: true,
      })
      //除门票外其它业务身份证是否为必填字段
        if (that.data.ifIdCardFlag == 'T' && that.data.module != 'ticket') {
          if (that.data.linkMans == '' || that.data.teles == '' || that.data.idNos == ''  ){
            wx.showModal({
              title: '下单失败',
              content: '信息不全！',
              success: function (res) { }
            })
            return false;
         }
        } else {
          if (that.data.linkMans == '' || that.data.teles == ''){
            wx.hideLoading();
            wx.showModal({
              title: '下单失败',
              content: '信息不全！',
              success: function (res) { }
            })
            return false;
          }
         
        }
    
      let ticketList = that.data.ticketDataArr,
          ticketArr = [],
          totalPrice = 0,
          credentialsArr = [];//实名制数组
      // 实名制
      let realArr = that.data.selectedRealArr;
      if (realArr.length>0){
        for (let n = 0; n < realArr.length;n++){
          let realNameObj = {
            id: realArr[n].certNo,
            name: realArr[n].name,
          };
          credentialsArr.push(realNameObj );
        }
      }

      ticketList.map(function (item, index) {
        let ticketType;
        if(that.data.module=="ticket"){
          ticketType = item.ticketData.type;
        }else{
          ticketType = item.ticketData.category;
        }
        let obj={
            ticketTypeName:item.ticketData.name,
            quantity: item.ticketData.orderNums,
            price: +item.ticketData.salePrice,
            ticketTypeCode: item.ticketData.code,
            occDate: that.data.occDate,
            ticketType: ticketType,
            couponUserRecordId: item.selectCouponId ? item.selectCouponId:'',
            restrictionRulsId: item.ticketData.restrictionRulsId,
            isCertAuth: item.ticketData.realnameRequired === "realname" ? 'T' : 'F',
          }
          if (obj.isCertAuth==='T'){
            obj.credentials = credentialsArr;
          }
          ticketArr.push(obj);
          totalPrice += obj.quantity * obj.price
      });
     let data = {
        ticketDtos: ticketArr,
        orderInfoDto: {
         linkName:that.data.linkMans,
         tel: that.data.teles,
         certificateNo: that.data.idNos,
         src:'wechatMini'
        },
        totalPrice: totalPrice,
        merchantId: app.globalData.merchantId,
      },
      token = wx.getStorageSync('token'),
      url = Api.getUrl('ticket', 'buildOrderTickets');
      data = JSON.stringify(data); 
      common.requestData(url, data, 'POST', token, function (cb) {
        if (cb.statusCode === 200) {
          wx.hideLoading();
          let orderCode = cb.data.orderCode,
            infourl = Api.getUrl('order', 'getOrderInfoTotalPriceByCode') + orderCode;
          common.requestData(infourl, '', 'GET', token, function (cbInfo) {
            that.setData({
              orderInforData: cbInfo.data,
            })
          })
          that.setData({
            payShow: 1,
            sFlag: 0
          })
        } else {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: cb.data.message,
          })
          that.setData({
            sFlag: 1
          })
        }
      })  
   }
  },
  // 关闭支付弹出层
  closeLayer:function(e){
    let that=this;
    that.setData({
      payShow: 0,
      sFlag: 1
    })  
  },
  // 支付
  toPay:function(e){
     let that=this,
         orderCode=e.currentTarget.dataset.code,
         Iflag = e.currentTarget.dataset.iflag,
         token = wx.getStorageSync('token');
     that.setData({
       Iflag: 0,
     })
     if (Iflag==0){
       return false;
     }else{
       let openid = wx.getStorageSync('openId'),
         data = common.objToString({
           openid: openid,
           orderCode: orderCode,
           payMethod: 'wxpay',
         });

       if (that.data.totalPrice == 0) {
         let url = Api.getUrl('pay', 'checkZeroOrder'),
           params = {
             actualPay: 0,
             orderNo: orderCode
           };
         common.requestData(url, params, 'POST', token, function (cb) {
           if (cb.statusCode === 200) {
             wx.redirectTo({
               url: '../list/list?module=order&orderStatus=',
             })
           }
         })
       } else {
         let url = Api.getUrl('pay', 'wxPayWhat') + '?' + data;
         common.requestData(url, '', 'POST', token, function (cb) {
           console.log(cb)
           if (cb.statusCode === 200) {
             that.setData({
               Iflag: 1,
             })
             wx.requestPayment({
               'timeStamp': cb.data.timeStamp,
               'nonceStr': cb.data.nonceStr,
               'package': cb.data.packageStr,
               'signType': 'MD5',
               'paySign': cb.data.paySign,
               'success': function (rs) {
                 // if (that.data.orderInforData.orderCount > 1) {
                 wx.redirectTo({
                   url: '../myTicket/myTicket?orderNo=' + that.data.orderInforData.orderCode + '&merchantId=' + app.globalData.merchantId
                 })
                 // } else {
                 //   wx.redirectTo({
                 //     url: '../payResult/payResult?orderNo=' + that.data.orderInforData.orderCode + '&merchantId=' + app.globalData.merchantId
                 //   })
                 // }

               }
               //  ,
               //  'fail': function (rqs) {
               //    that.setData({
               //      Iflag: 1,
               //    })
               //    wx.showModal({
               //      title: '支付失败',
               //      content:'请重新支付',

               //    })
               //  }
             })
           } else {
             wx.showModal({
               title: '提示',
               content: cb.data.message,
             })
           }
         })
       }
    }    
       
  },
  //实名制表单验证
  testRName: function (e) {
    let that = this,
      Ftype = e.target.dataset.type,
      value = e.detail.value,
      index = e.target.dataset.index;
    var testData = common.getTest(Ftype, index, value);//验证
    if (parseInt(testData.flag) < 0) {
      that.setData({
        Rname: e.detail.value,
      })
    }
    that.setData({
      flag4: parseInt(testData.flag),
      tips: testData.tips
    })
  },
  testRID: function (e) {
    let that = this,
      Ftype = e.target.dataset.type,
      value = e.detail.value,
      index = e.target.dataset.index;
   
    if (that.data.ifIdCardFlag == 'T' && that.data.module != 'ticket') {
      return false;
    }
   
    var testData = common.getTest(Ftype, index, value);//验证
    if (parseInt(testData.flag) < 0) {
     
     that.setData({
        Rid: e.detail.value,
      })
     console.log(that.data);
    }
    that.setData({
      flag5: parseInt(testData.flag),
      tips: testData.tips
    })
  },


  //表单验证
  testName: function (e) {
    let that = this,
      Ftype = e.target.dataset.type,
      value = e.detail.value,
      index = e.target.dataset.index;
    var testData = common.getTest(Ftype, index, value);//验证
    if (testData.flag < 0) {
      that.setData({
        linkMans: e.detail.value,
      })
    }
    that.setData({
      flag1: testData.flag,
      tips: testData.tips
    })
  },
  //  手机号验证
  testTel: function (e) {
    let that = this,
      Ftype = e.target.dataset.type,
      value = e.detail.value,
      index = e.target.dataset.index;
    var testData = common.getTest(Ftype, index, value);//验证
    if (testData.flag < 0) {
      that.setData({
        teles: e.detail.value,
      })
    }
    that.setData({
      flag2: testData.flag,
      tips: testData.tips
    })
  },
  // 身份证验证
  testID: function (e) {
    let that = this,
      Ftype = e.target.dataset.type,
      value = e.detail.value,
      index = e.target.dataset.index;
    if (that.data.ifIdCardFlag == 'T' && that.data.module != 'ticket') {
      return false;
    }
    var testData = common.getTest(Ftype, index, value);//验证
    if (testData.flag < 0) {
      that.setData({
        idNos: e.detail.value,
      })
    }
    that.setData({
      flag3: testData.flag,
      tips: testData.tips
    })
  },
})