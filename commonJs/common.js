
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//请求数据
function requestData(url, data, method,token, callback, option){
 let header = { 'x-auth-token': token, 'Content-Type': 'application/json' };
  if (option==='form'){
    header = { 'x-auth-token': token, 'Content-Type': 'application/x-www-form-urlencoded' };
  }
  wx.request({
    url: url,
    data:data,
    header: header,
    method: method,
    success: (res) => {
      if (res.statusCode === 401){
       wx.redirectTo({
         url: '../login/login',
       })
      }else{
        callback(res); 
      }
    },
    fail: (res) => {
      console.log('++++++++++++错误信息++++++++++++++')
      console.log(url)
      console.log(res)
      wx.showModal({
        showCancel: false,
        title: '出错啦',
        content: `${res.errMsg} `
      })
    }
  })
}

//url转对象
function parseURL(url) {
  var urlArr = url.split('/');
  return  urlArr[urlArr.length - 1].split('?')[0];
}  
// 隐藏显示信息 *
function replacePhone(num) {
  return num.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function replaceCertNo(cardNumber) {
  return cardNumber.replace(/^(.{6})(?:\d+)(.{4})$/, "$1****$2");
}


function replaceName(name) {
  return name.length > 2 ? name.replace(/^(.).+(.)$/g, "$1*$2") : name.replace(/^(.)(.)$/g, "$1*");
}
//验证表单数据
function getTest(type, index, value){
  let Fdata, Illegal = new RegExp("[`~!@#$^&*()=|{}':'\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'、？\\s]");
  if (!value) {
    return Fdata = {
      flag: index,
      tips: '这里是必填项'
    }
    return;
  }else{
    if (Illegal.test(value)) {
      return Fdata = {
        flag: index,
        tips: '包含非法字符'
      }
    }
  }
 
  if (value && !Illegal.test(value)){
    if (type == "linkname") {
      return Fdata = {
        flag: -1,
        tips: ''
      }
    } else if (type == 'tel'){
      let rule = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
      if (!rule.test(value)) {
          return Fdata = {
          flag: index,
          tips: '请输入正确的手机号'
        }
      }
      else {
        return Fdata = {
          flag: -1,
          tips: ''
        }
      }
    } else if (type == 'idcard'){
      if (!isIdCardNo(value)) {
        return Fdata = {
          flag: index,
          tips: '请输入正确的身份证号码'
        }
      } else {
        return Fdata = {
          flag: -1,
          tips: ''
        }
      }
    }

  }
 
 
 
}

//身份证验证
function isIdCardNo(num) {

  var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
  var parityBit = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");
  var varArray = new Array();
  var intValue;
  var lngProduct = 0;
  var intCheckDigit;
  var intStrLen = num.length;
  var idNumber = num;
  // initialize
  if ((intStrLen != 15) && (intStrLen != 18)) {
    return false;
  }
  // check and set value
  for (let i = 0; i < intStrLen; i++) {
    varArray[i] = idNumber.charAt(i);
    if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
      return false;
    } else if (i < 17) {
      varArray[i] = varArray[i] * factorArr[i];
    }
  }

  if (intStrLen == 18) {
    // check date
    var date8 = idNumber.substring(6, 14);
    if (isDate8(date8) == false) {
      return false;
    }
    // calculate the sum of the products
    for (let i = 0; i < 17; i++) {
      lngProduct = lngProduct + varArray[i];
    }
    // calculate the check digit
    intCheckDigit = parityBit[lngProduct % 11];
    // check last digit
    if (varArray[17] != intCheckDigit) {
      return false;
    }
  }
  else {        // length is 15
    // check date
    var date6 = idNumber.substring(6, 12);
    if (isDate6(date6) == false) {

      return false;
    }
  }
  return true;

}
/**
	 * 判断是否为"YYYYMMDD"式的时期
	 * 
	 */
function isDate8(sDate) {
  if (!/^[0-9]{8}$/.test(sDate)) {
    return false;
  }
  var year, month, day;
  year = sDate.substring(0, 4);
  month = sDate.substring(4, 6);
  day = sDate.substring(6, 8);
  var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1700 || year > 2500) return false
  if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
  if (month < 1 || month > 12) return false
  if (day < 1 || day > iaMonthDays[month - 1]) return false
  return true
}
// 计算总价
function getTotalPrice(count, price) {
  var totalprice = (parseFloat(price) * count).toFixed(2);
  return parseFloat(totalprice);
}
// 修改日期格式
// 改一下日历的格式
function changeDateType(year, month, day) {
  let y = year;
  let m = month;
  if (m < 10) m = "0" + m;
  let d = day;
  if (d < 10) d = "0" + d;
  return y + "-" + m + "-" + d;
}
// 对象转字符串并用&连接
function objToString(obj){
  let values = [];//定义一个数组用来接受value
  for (var key in obj) {
    var str = key + '=' + obj[key];
  values.push(str);//取得value
  }
  return values.join('&')
}
// 计算价格
 function accMul(arg1, arg2) {
   var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
   try {
     m += s1.split(".")[1].length
   } catch (e) {
   }
   try {
     m += s2.split(".")[1].length
   } catch (e) {
   }
   return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  }
 
function accAdd(arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (this.accMul(arg1, m) + this.accMul(arg2, m)) / m;
  }
function accSub(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    //last modify by deeka
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg2 * m - arg1 * m) / m).toFixed(n);
  }

module.exports = {
  formatTime: formatTime,
  requestData: requestData,//请求数据
  getTest: getTest,//表单验证
  changeDateType:changeDateType,
  objToString: objToString,
  parseURL: parseURL,
  accSub: accSub,
  accAdd:accAdd,
  //accDiv: accDiv,
  accMul: accMul,
  replacePhone:replacePhone,
  replaceCertNo:replaceCertNo,
  replaceName: replaceName,
  getTotalPrice: getTotalPrice,//计算总价
  
}
