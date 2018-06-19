/**
 * 表单验证
 * 
 * @param {Object} rules 验证字段的规则
 * @param {Object} messages 验证字段的提示信息
 * 
 */
class WxValidate {
  constructor(rules = {}, messages = {}) {
    Object.assign(this, {
      rules,
      messages,
    })
    this.__init()
  }

  /**
   * __init
   */
  __init() {
    this.__initMethods()
    this.__initDefaults()
    this.__initData()
  }

  /**
   * 初始化数据
   */
  __initData() {
    this.form = {}
    this.errorList = []
  }

  /**
   * 初始化默认提示信息
   */
  __initDefaults() {
    this.defaults = {
      messages: {
        required: '这是必填字段。',
        email: '请输入有效的电子邮件地址。',
        tel: '请输入11位的手机号码。',
        url: '请输入有效的网址。',
        date: '请输入有效的日期。',
        dateISO: '请输入有效的日期（ISO），例如：2009-06-23，1998/01/22。',
        number: '请输入有效的数字。',
        digits: '只能输入数字。',
        idcard: '请输入有效身份证。',
        equalTo: this.formatTpl('输入值必须和 {0} 相同。'),
        contains: this.formatTpl('输入值必须包含 {0}。'),
        minlength: this.formatTpl('最少要输入 {0} 个字符。'),
        maxlength: this.formatTpl('最多可以输入 {0} 个字符。'),
        rangelength: this.formatTpl('请输入长度在 {0} 到 {1} 之间的字符。'),
        min: this.formatTpl('请输入不小于 {0} 的数值。'),
        max: this.formatTpl('请输入不大于 {0} 的数值。'),
        range: this.formatTpl('请输入范围在 {0} 到 {1} 之间的数值。'),
      }
    }
  }

  /**
   * 初始化默认验证方法
   */
  __initMethods() {
    const that = this
    that.methods = {
      /**
       * 验证必填元素
       */
      required(value, param) {
        if (!that.depend(param)) {
          return 'dependency-mismatch'
        } else if (typeof value === 'number') {
          value = value.toString()
        } else if (typeof value === 'boolean') {
          return !0
        }

        return value.length > 0
      },
      /**
       * 验证电子邮箱格式
       */
      email(value) {
        return that.optional(value) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value)
      },
      /**
       * 验证手机格式
       */
      tel(value) {
        return that.optional(value) || /^1[34578]\d{9}$/.test(value)
      },
      /**
       * 验证URL格式
       */
      url(value) {
        return that.optional(value) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value)
      },
      /**
       * 验证日期格式
       */
      date(value) {
        return that.optional(value) || !/Invalid|NaN/.test(new Date(value).toString())
      },
      /**
       * 验证ISO类型的日期格式
       */
      dateISO(value) {
        return that.optional(value) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value)
      },
      /**
       * 验证十进制数字
       */
      number(value) {
        return that.optional(value) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
      },
      /**
       * 验证整数
       */
      digits(value) {
        return that.optional(value) || /^\d+$/.test(value)
      },
      /**
       * 验证身份证号码  
       */
      idcard(value) {
        return that.optional(value) || that.IdentityCodeValid(value)
      },
      /**
       * 验证两个输入框的内容是否相同
       */
      equalTo(value, param) {
        return that.optional(value) || value === that.scope.detail.value[param]
      },
      /**
       * 验证是否包含某个值
       */
      contains(value, param) {
        return that.optional(value) || value.indexOf(param) >= 0
      },
      /**
       * 验证最小长度
       */
      minlength(value, param) {
        return that.optional(value) || value.length >= param
      },
      /**
       * 验证最大长度
       */
      maxlength(value, param) {
        return that.optional(value) || value.length <= param
      },
      /**
       * 验证一个长度范围[min, max]
       */
      rangelength(value, param) {
        return that.optional(value) || (value.length >= param[0] && value.length <= param[1])
      },
      /**
       * 验证最小值
       */
      min(value, param) {
        return that.optional(value) || value >= param
      },
      /**
       * 验证最大值
       */
      max(value, param) {
        return that.optional(value) || value <= param
      },
      /**
       * 验证一个值范围[min, max]
       */
      range(value, param) {
        return that.optional(value) || (value >= param[0] && value <= param[1])
      },
    }
  }

  /**
   * 添加自定义验证方法
   * @param {String} name 方法名
   * @param {Function} method 函数体，接收两个参数(value, param)，value表示元素的值，param表示参数
   * @param {String} message 提示信息
   */
  addMethod(name, method, message) {
    this.methods[name] = method
    this.defaults.messages[name] = message !== undefined ? message : this.defaults.messages[name]
  }

  /**
   * 判断验证方法是否存在
   */
  isValidMethod(value) {
    let methods = []
    for (let method in this.methods) {
      if (method && typeof this.methods[method] === 'function') {
        methods.push(method)
      }
    }
    return methods.indexOf(value) !== -1
  }

  /**
   * 格式化提示信息模板
   */
  formatTpl(source, params) {
    const that = this
    if (arguments.length === 1) {
      return function () {
        let args = Array.from(arguments)
        args.unshift(source)
        return that.formatTpl.apply(this, args)
      }
    }
    if (params === undefined) {
      return source
    }
    if (arguments.length > 2 && params.constructor !== Array) {
      params = Array.from(arguments).slice(1)
    }
    if (params.constructor !== Array) {
      params = [params]
    }
    params.forEach(function (n, i) {
      source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
        return n
      })
    })
    return source
  }

  /**
   * 判断规则依赖是否存在
   */
  depend(param) {
    switch (typeof param) {
      case 'boolean':
        param = param
        break
      case 'string':
        param = !!param.length
        break
      case 'function':
        param = param()
      default:
        param = !0
    }
    return param
  }

  /**
   * 判断输入值是否为空
   */
  optional(value) {
    return !this.methods.required(value) && 'dependency-mismatch'
  }

  IdentityCodeValid(code) {
    var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
    var tip = "";
    var pass = true;

    if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
      tip = "身份证号格式错误";
      pass = false;
    }

    else if (!city[code.substr(0, 2)]) {
      tip = "地址编码错误";
      pass = false;
    }
    else {
      //18位身份证需要验证最后一位校验位
      if (code.length == 18) {
        code = code.split('');
        //∑(ai×Wi)(mod 11)
        //加权因子
        var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        //校验位
        var parity = [1, 0, 'x', 9, 8, 7, 6, 5, 4, 3, 2];
        var sum = 0;
        var ai = 0;
        var wi = 0;
        for (var i = 0; i < 17; i++) {
          ai = code[i];
          wi = factor[i];
          sum += ai * wi;
        }
        var last = parity[sum % 11];
        if (parity[sum % 11] != code[17].toLocaleLowerCase()) {
          tip = "校验位错误";
          pass = false;
        }
      }
    }
    //if (!pass) alert(tip);
    return pass;
  }
  /**
   * 获取自定义字段的提示信息
   * @param {String} param 字段名
   * @param {Object} rule 规则
   */
  customMessage(param, rule) {
    const params = this.messages[param]
    const isObject = typeof params === 'object'
    if (params && isObject) return params[rule.method]
  }

  /**
   * 获取某个指定字段的提示信息
   * @param {String} param 字段名
   * @param {Object} rule 规则
   */
  defaultMessage(param, rule) {
    let message = this.customMessage(param, rule) || this.defaults.messages[rule.method]
    let type = typeof message

    if (type === 'undefined') {
      message = `Warning: No message defined for ${rule.method}.`
    } else if (type === 'function') {
      message = message.call(this, rule.parameters)
    }

    return message
  }

  /**
   * 缓存错误信息
   * @param {String} param 字段名
   * @param {Object} rule 规则
   * @param {String} value 元素的值
   */
  formatTplAndAdd(param, rule, value) {
    let msg = this.defaultMessage(param, rule)

    this.errorList.push({
      param: param,
      msg: msg,
      value: value,
    })
  }

  /**
   * 验证某个指定字段的规则
   * @param {String} param 字段名
   * @param {Object} rules 规则
   * @param {Object} event 表单数据对象
   */
  checkParam(param, rules, event) {

    // 缓存表单数据对象
    this.scope = event

    // 缓存字段对应的值
    const data = event.detail.value
    const value = data[param] !== null && data[param] !== undefined ? data[param] : ''

    // 遍历某个指定字段的所有规则，依次验证规则，否则缓存错误信息
    for (let method in rules) {

      // 判断验证方法是否存在
      if (this.isValidMethod(method)) {

        // 缓存规则的属性及值
        const rule = {
          method: method,
          parameters: rules[method]
        }

        // 调用验证方法
        const result = this.methods[method](value, rule.parameters)

        // 若result返回值为dependency-mismatch，则说明该字段的值为空或非必填字段
        if (result === 'dependency-mismatch') {
          continue
        }

        this.setValue(param, method, result, value)

        // 判断是否通过验证，否则缓存错误信息，跳出循环
        if (!result) {
          this.formatTplAndAdd(param, rule, value)
          break
        }
      }
    }
  }

  /**
   * 设置字段的默认验证值
   * @param {String} param 字段名
   */
  setView(param) {
    this.form[param] = {
      $name: param,
      $valid: true,
      $invalid: false,
      $error: {},
      $success: {},
      $viewValue: ``,
    }
  }

  /**
   * 设置字段的验证值
   * @param {String} param 字段名
   * @param {String} method 字段的方法
   * @param {Boolean} result 是否通过验证
   * @param {String} value 字段的值
   */
  setValue(param, method, result, value) {
    const params = this.form[param]
    params.$valid = result
    params.$invalid = !result
    params.$error[method] = !result
    params.$success[method] = result
    params.$viewValue = value
  }

  /**
   * 验证所有字段的规则，返回验证是否通过
   * @param {Object} event 表单数据对象
   */
  checkForm(event) {
    this.__initData()

    for (let param in this.rules) {
      this.setView(param)
      this.checkParam(param, this.rules[param], event)
    }

    return this.valid()
  }

  /**
   * 返回验证是否通过
   */
  valid() {
    return this.size() === 0
  }

  /**
   * 返回错误信息的个数
   */
  size() {
    return this.errorList.length
  }

  /**
   * 返回所有错误信息
   */
  validationErrors() {
    return this.errorList
  }
}

export default WxValidate