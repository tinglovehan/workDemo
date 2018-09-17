
//app.js
import WxValidate from 'commonJs/WxValidate.js'
const common = require("commonJs/common.js");
const Api = require('api/getApi.js');
App({
   onLaunch:function(){
     let that=this;
  }, 
  // 获取用户信息
  login: function (cbUser) {
    let that = this;
    //wx.clearStorageSync();
    if (that.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else{
     wx.login({
          success: function (loginres){
            var code = loginres.code;
            wx.getUserInfo({
              success: function (res) {
                console.log('++++++++++++++++++++获取用户信息+++++++++++++++++++')
                that.globalData.userInfo = res.userInfo;
                //如果缓存中有数据从缓存中取用户信息请求接口
                console.log(that.globalData.userInfo)
                //if (!wx.getStorageSync('token')) {
                  that.userLogin(function (cbm) {
                    if (cbm) {
                      typeof cbUser == "function" && cbUser(cbm);
                    }
                  },code);
                 //}
              },
              fail:function(){
                wx.showModal({
                  title: '警告',
                  content: '您点击了拒绝授权，将无法正常使用此小程序的所有功能，请10分钟后重新点击授权，或者删除小程序重新进去并授权！',
                }) 
              }
            })
          }
        })
    }
  },
  
 
  //检测token是否过期
  // isOverdue:function(token,cbMinfor){
  //   let that = this,Minfor;
  //   let checkUrl =Api.getUrl('main', 'checkToken'),
  //       method = 'GET';
  //   common.requestData(checkUrl,'', method, token, function (cb) {
  //     console.log('--------token检测-----------')
  //     console.log(cb)
  //     if (cb.statusCode == 401) {
  //       wx.login({
  //         success: function (loginres) {
  //           var code = loginres.code;
  //           that.userLogin(function (cbm) {
  //             if (cbm) {
  //               typeof cbMinfor == "function" && cbMinfor(cbm);
  //             }
  //           }, code);
  //         }
  //       })  
  //     } else {
  //       typeof cbMinfor == "function" && cbMinfor(cb.data);
  //     }  
     
  //   })
   
  // },
  // 用户登录及会员绑定
  userLogin: function (cbm,code){
    let that = this;
    // 根据code获取token
      let url = Api.getUrl('main', 'login')+"?merchantId=" + that.globalData.merchantId+"&code=" + code,
          method = 'GET';
      common.requestData(url, '', method, '', function (cb) {
          console.log("cb", cb)
          if (cb.statusCode === 200) {
            wx.setStorageSync('openId', cb.data.openid);
            wx.setStorageSync('token', cb.data.token);
            wx.setStorageSync('member', cb.data.memberInfoRes)
            typeof cbm == "function" && cbm(cb.data);
          }else{
            wx.showModal({
              title: '提示',
              content: cb.data.message,
            })
          }
      })
    },
globalData: {
    userInfo: null,
     code:'',
     merchantId: 36,
     src:'wechatMini',
    
 },
//表单验证
  WxValidate: (rules, messages) => new WxValidate(rules, messages),


  addParams: function (params) {
    let that = this
    return common.json2Form(params)
    console.log(common.json2Form(params));
  }



})
