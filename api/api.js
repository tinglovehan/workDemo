let option = {
  geteWay: 'http://b2c-merchant.sendinfo.com.cn/gateway-shop',
  geteWay1: 'http://b2c-merchant.sendinfo.com.cn/'
  // geteWay: 'https://merchant-b2c.zhiyoubao.com/gateway-shop',
  // geteWay1: 'https://merchant-b2c.zhiyoubao.com/'
};
module.exports={
  "main": {
   "login": option.geteWay1 +"api/oauth-client/authz/authMiniAndSave/wechatMini",
    "checkToken": option.geteWay +"/api/authc/check",
    'info': option.geteWay1 +'/api/order/rest/member/',
  },
  "index": {
    "index": option.geteWay1 +"/api/order/index/pageData",
    "setIndexUrl": option.geteWay1+"/api/merchant/storelink/index",
    "banner":option.geteWay +"/api/merchant/flexSlider/getOnlineBatch/",
    "scenic":option.geteWay1 +"/api/order/scenic/findAllScenic/",
    "package":option.geteWay1 +"api/order/familyTicketType/findAllFamilyTicket",
    "hotel": option.geteWay1 + "/api/order/hotel/findAllHotel/",
    "recommendScenic": option.geteWay1+"/api/order/scenic/recommend",
    "recommendPackage": option.geteWay1 +"/api/order/familyTicketType/recommend",
    "search": option.geteWay + '',
    "qyyx": option.geteWay1 +"/api/merchant/rest/merchant/",
  },
  "coupon": {
    "today": option.geteWay + '/api/plugin/coupon/byMerchantToday/',
    "list": option.geteWay + '/api/plugin/coupon/byMerchantGoodsType/',
    "scenicList": option.geteWay + '/api/plugin/coupon/bySubLevel/',
    "orderList": option.geteWay + '/api/plugin/coupon/byOrder/',
    "discount": option.geteWay + '/api/plugin/rest/couponUserRecord/',
    "get": option.geteWay + '/api/plugin/couponUserRecord/get/',
    "use": option.geteWay + '/api/plugin/couponUserRecord/use/',
    "userList": option.geteWay + '/api/plugin/couponUserRecord/getUserRecord/',
    "unUseList": option.geteWay + '/api/plugin/coupon/byCustomer/unuse',
    "invalidUseList": option.geteWay + '/api/plugin/coupon/byCustomer/invalid',
    "permission": option.geteWay1 + '/api/plugin/coupon/byMerchant'
  },
  "news": {
    "list": option.geteWay1 + '/api/merchant/rest/news/',
    "detail": option.geteWay1 + '/api/merchant/rest/news/'
  },
  "ticket": {
    "list": option.geteWay1 + '/api/order/scenic/findAllScenic/',
    "detail": option.geteWay1 + '/api/order/rest/scenic/',
    "detailBanner": option.geteWay1 + '/api/order/album/getAlbumByIsCarouselFigure/',
    "ticketTypeByScenicCode": option.geteWay1 + '/api/order/scenicTicketType/findByScenicIdCD/',
    "ticketTypeById": option.geteWay1 + '/api/order/rest/scenicTicketType/',
    "buildOrder": option.geteWay1 + '/api/order/order/saveScenicOrderWaitPayB2C',
    "buildOrderTickets": option.geteWay1 + '/api/order/order/saveOrderWaitPayC',
    "payed": option.geteWay1 + '/api/order/order/saveOrderPayedZYB',
    "getRules": option.geteWay1 + '/api/order/rest/scenicRestrictionRules/getIfIdCard'
  },
  "package": {
    "list": option.geteWay1 + '/api/order/familyTicketType/findAllFamilyTicket',
    "detail": option.geteWay1 + '/api/order/familyTicketType/getFamilyDetailById/'
  },
  "order": {
    "getRules": option.geteWay1 + '/api/order/rest/scenicRestrictionRules/getIfIdCard/',
    "checkOrder": option.geteWay1 + '/api/order/order/saveOrderCheckC',
    "getOrderByCode": option.geteWay1 + '/api/order/order/getOrderInfoByOrderCode/',
    "getOrderInfoTotalPriceByCode": option.geteWay1 + '/api/order/order/getOrderInfoTotalPriceByOrderCode/',
    "getOrderCheckNoByCode": option.geteWay1 + 'api/order/order/getOrderInfoCheckNoByOrderCode/',
    "getOrderByUserName": option.geteWay1 + '/api/order/order/getOrderInfoByUserName/',
    "getOrderByUserId": option.geteWay1 + '/api/order/order/getOrderInfoByUserId/',
    "getOrderByType": option.geteWay1 + '/api/order/order/getOrderInfoByOrderType/',
    "cancelOrder": option.geteWay1 + '/api/order/order/cancelScenicOrderWaitPayedB2C/',
    "retreatOrder": option.geteWay1 + '/api/order/order/retreatOrderPayedC/',
    "rePayZyb": option.geteWay1 + '/api/order/order/saveOrderPayedZYB_TS/',
    "retreatScenicOrderFail": option.geteWay1 + '/api/order/order/retreatScenicOrderPayedB2cAndZYB_Fail/',
    "ticketByBatchNo": option.geteWay1 + 'api/order/order/getOrderInfoCheckNoListByOrderCodeSP/',
     "ticketEWM": option.geteWay1 +'/api/order/order/getOrderInfoCheckNoByOrderCodeSP/'
  },
  "balance": {
    "list": option.geteWay1 + '/api/order/userOrder/getUserOrderTradeInfo',
    "detail": option.geteWay1 + '/api/order/userOrder/getUserOrderDetail/',
    "getPayDetail": option.geteWay1 + 'api/order/userOrder/getPayUserOrderDetail'
  },
  "user": {
    "register": option.geteWay + '/api/authc/rest/account',
    "loginAliPay": option.geteWay + '/api/oauth-client/authz/alipay',
    "loginWeChat": option.geteWay1 + '/api/oauth-client/authz/wechat',
    "logout": option.geteWay + '/api/authc/logout',
    "checkToken": option.geteWay + '/api/authc/check',
    "info": option.geteWay1 + '/api/order/rest/member/',
    "password": option.geteWay + '',
    "scenicOrderAudit": option.geteWay + '/rest/order/scenicOrderAudit',
    "getUserInfo": option.geteWay1 + 'api/order/redis/getUserInfo/',
    "realName": option.geteWay1 + '/api/order/rest/realNamePassenger/'
  },
  "pay": {
    "wxPayWhat": option.geteWay1 +"/api/order/payment/smallprepay",
    "checkZeroOrder": option.geteWay1 + '/api/order/order/saveOrderPayedZYB',
   },
}
 