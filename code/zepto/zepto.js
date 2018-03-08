/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd)
    define(function() { return factory(global) })
  else
    factory(global)
}(this, function(window) {
  var Zepto = (function() {
    var undefined, key, $, classList, emptyArray = [],
      concat = emptyArray.concat,
      filter = emptyArray.filter,
      slice = emptyArray.slice,
      document = window.document,
      elementDisplay = {},
      classCache = {},
      // 设置CSS时，不用加px单位的属性
      cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
      // 匹配HTML代码
      fragmentRE = /^\s*<(\w+|!)[^>]*>/,
      // TODO 匹配单个HTML标签
      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      // TODO 匹配自闭合标签
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      // 匹配根节点
      rootNodeRE = /^(?:body|html)$/i,
      // 匹配A-Z
      capitalRE = /([A-Z])/g,

      // 需要提供get和set的方法名
      methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
      // 相邻DOM的操作
      adjacencyOperators = ['after', 'prepend', 'before', 'append'],
      table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      // 这里的用途是当需要给tr,tbody,thead,tfoot,td,th设置innerHTMl的时候，需要用其父元素作为容器来装载HTML字符串
      containers = {
        'tr': document.createElement('tbody'),
        'tbody': table,
        'thead': table,
        'tfoot': table,
        'td': tableRow,
        'th': tableRow,
        '*': document.createElement('div')
      },
      // 当DOM ready的时候，document会有以下三种状态的一种
      readyRE = /complete|loaded|interactive/,
      simpleSelectorRE = /^[\w-]*$/,
      // 缓存对象类型，用于类型判断 如object
      class2type = {},
      toString = class2type.toString,
      zepto = {},
      camelize, uniq,
      tempParent = document.createElement('div'),
      propMap = {
        'tabindex': 'tabIndex',
        'readonly': 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        'maxlength': 'maxLength',
        'cellspacing': 'cellSpacing',
        'cellpadding': 'cellPadding',
        'rowspan': 'rowSpan',
        'colspan': 'colSpan',
        'usemap': 'useMap',
        'frameborder': 'frameBorder',
        'contenteditable': 'contentEditable'
      },
      isArray = Array.isArray ||
      function(object) { return object instanceof Array }
    /**
     * 元素是否匹配选择器
     * @param element
     * @param selector
     * @returns {*}
     */
    zepto.matches = function(element, selector) {
      if (!selector || !element || element.nodeType !== 1) return false
      var matchesSelector = element.matches || element.webkitMatchesSelector ||
        element.mozMatchesSelector || element.oMatchesSelector ||
        element.matchesSelector
      if (matchesSelector) return matchesSelector.call(element, selector)

      var match, parent = element.parentNode,
        temp = !parent
      if (temp)(parent = tempParent).appendChild(element)
      match = ~zepto.qsa(parent, selector).indexOf(element)
      temp && tempParent.removeChild(element)
      return match
    }
    // 数据类型
    function type(obj) {
      return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }
    // 是否是函数
    function isFunction(value) { return type(value) == "function" }
    // 是否是窗口
    function isWindow(obj) { return obj != null && obj == obj.window }
    // 是否是文本
    function isDocument(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
    // 是否是对象
    function isObject(obj) { return type(obj) == "object" }

    function isPlainObject(obj) {
      return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    /**
     * 伪数组/数组判断
     * @param obj
     * @returns {boolean}
     */
    function likeArray(obj) {
      var length = !!obj && 'length' in obj && obj.length,
        type = $.type(obj)

      return 'function' != type && !isWindow(obj) && (
        'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
      )
    }
    /**
     * 清掉数组中的null/undefined
     * @param array
     * @returns {*}
     */
    function compact(array) { return filter.call(array, function(item) { return item != null }) }
    /**
     * 返回一个数组副本
     * 利用空数组$.fn.concat.apply([], array) 合并新的数组，返回副本
     * @param array
     * @returns {*|Function|Function|Function|Function|Function|Zepto.fn.concat|Zepto.fn.concat|Zepto.fn.concat|Array|string}
     */
    function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
    /**
     * 将'-'字符串转成驼峰格式
     * @param str
     * @returns {*|void}
     */
    camelize = function(str) { return str.replace(/-+(.)?/g, function(match, chr) { return chr ? chr.toUpperCase() : '' }) }
    /**
     * 字符串转换成浏览器可识别的 -拼接形式。 如background-color
     *
     * @param str
     * @returns {string}
     */
    function dasherize(str) {
      return str.replace(/::/g, '/')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .replace(/_/g, '-')
        .toLowerCase()
    }
    // 数组去重，如果该条数据在数组中的位置与循环的索引值不相同，则说明数组中有与其相同的值
    uniq = function(array) { return filter.call(array, function(item, idx) { return array.indexOf(item) == idx }) }
    /**
     * 将参数变为正则表达式
     * @param name
     * @returns {*}
     */
    function classRE(name) {
      return name in classCache ?
        classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }
    /**
     *  除了cssNumber指定的不需要加单位的，默认加上px
     * @param name
     * @param value
     * @returns {string}
     */
    function maybeAddPx(name, value) {
      return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }
    /**
     * 获取元素的默认display属性
     * 是为了兼容什么？
     * @param nodeName
     * @returns {*}
     */
    function defaultDisplay(nodeName) {
      var element, display
      if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName)
        document.body.appendChild(element)
        display = getComputedStyle(element, '').getPropertyValue("display")
        element.parentNode.removeChild(element)
        display == "none" && (display = "block")
        elementDisplay[nodeName] = display
      }
      return elementDisplay[nodeName]
    }
    /**
     * 获取元素的子节集
     * 原理：原生方法children  老的火狐不支持的，遍历childNodes
     * @param element
     * @returns {*}
     */
    function children(element) {
      return 'children' in element ?
        slice.call(element.children) :
        $.map(element.childNodes, function(node) { if (node.nodeType == 1) return node })
    }
    /**
     * 构造器
     * @param dom
     * @param selector
     * @constructor
     */
    function Z(dom, selector) {
      var i, len = dom ? dom.length : 0
      for (i = 0; i < len; i++) this[i] = dom[i]
      this.length = len
      this.selector = selector || ''
    }

    /**
     *  内部函数 HTML 转换成 DOM
     *  原理是 创建父元素，innerHTML转换
     * @param html  html片段
     * @param name  容器标签名
     * @param propertie  附加的属性对象
     * @returns {*}
     */
    zepto.fragment = function(html, name, properties) {
      var dom, nodes, container

      if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

      if (!dom) {
        if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
        if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) name = '*'

        container = containers[name]
        container.innerHTML = '' + html
        dom = $.each(slice.call(container.childNodes), function() {
          container.removeChild(this)
        })
      }

      if (isPlainObject(properties)) {
        nodes = $(dom)
        $.each(properties, function(key, value) {
          if (methodAttributes.indexOf(key) > -1) nodes[key](value)
          else nodes.attr(key, value)
        })
      }

      return dom
    }

    // 入口函数？
    zepto.Z = function(dom, selector) {
      return new Z(dom, selector)
    }

    // 判断给定的参数是否是Zepto集
    zepto.isZ = function(object) {
      return object instanceof zepto.Z
    }

    zepto.init = function(selector, context) {
      var dom
      // 未传参，undefined进行boolean转换，返回空Zepto对象
      if (!selector) return zepto.Z()
      // selector是字符串，即css表达式
      else if (typeof selector == 'string') {
        selector = selector.trim()
        // 如果是<开头 >结尾  基本的HTML代码时
        if (selector[0] == '<' && fragmentRE.test(selector))
          // 调用片段生成dom
          dom = zepto.fragment(selector, RegExp.$1, context), selector = null
        // 如果传递了上下文，在上下文中查找元素
        else if (context !== undefined) return $(context).find(selector)
        // 通过css表达式查找元素
        else dom = zepto.qsa(document, selector)
      }
      // 如果selector是函数，则在DOM ready的时候执行它
      else if (isFunction(selector)) return $(document).ready(selector)
      // 如果selector是一个Zepto对象，返回它自己
      else if (zepto.isZ(selector)) return selector
      else {
        // 如果selector是数组，过滤null,undefined
        if (isArray(selector)) dom = compact(selector)
        // 如果selector是对象,TODO://转换为数组？ 它应是DOM; 注意DOM节点的typeof值也是object，所以在里面还要再进行一次判断
        else if (isObject(selector))
          dom = [selector], selector = null
        // 如果selector是复杂的HTML代码，调用片段换成DOM节点
        else if (fragmentRE.test(selector))
          dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
        // 如果存在上下文context，仍在上下文中查找selector
        else if (context !== undefined) return $(context).find(selector)
        // 如果没有给定上下文，在document中查找selector
        else dom = zepto.qsa(document, selector)
      }
      // 将查询结果转换成Zepto对象
      return zepto.Z(dom, selector)
    }

    $ = function(selector, context) {
      return zepto.init(selector, context)
    }
    /**
     * 内部方法：用户合并一个或多个对象到第一个对象
     * @param target 目标对象  对象都合并到target里
     * @param source 合并对象
     * @param deep 是否执行深度合并
     */
    function extend(target, source, deep) {
      for (key in source)
        // 如果深度合并
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
          // 如果要合并的属性是对象，但target对应的key非对象
          if (isPlainObject(source[key]) && !isPlainObject(target[key]))
            target[key] = {}
          // 如果要合并的属性是数组，但target对应的key非数组
          if (isArray(source[key]) && !isArray(target[key]))
            target[key] = []
          // 执行递归合并
          extend(target[key], source[key], deep)
        }
      //不是深度合并，直接覆盖
      //TODO: 合并不显得太简单了？
      else if (source[key] !== undefined) target[key] = source[key]
    }

    /**
     * 对外方法
     * 合并
     * @param target
     * @returns {*}
     */
    $.extend = function(target) {

      var deep, //是否执行深度合并
        args = slice.call(arguments, 1) //arguments[0]是target，被合并对象，或为deep
      if (typeof target == 'boolean') {
        // 第一个参数为boolean值时，表示是否深度合并
        deep = target
        // target取第二个参数
        target = args.shift()
      }
      // 遍历后面的参数，都合并到target上
      args.forEach(function(arg) { extend(target, arg, deep) })
      return target
    }

    /**
     *  通过选择器表达式查找DOM
     *  原理  判断下选择器的类型（id/class/标签/表达式）
     *  使用对应方法getElementById getElementsByClassName getElementsByTagName querySelectorAll 查找
     * @param element
     * @param selector
     * @returns {Array}
     */
    zepto.qsa = function(element, selector) {
      var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
      return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
        ((found = element.getElementById(nameOnly)) ? [found] : []) :
        (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
        slice.call(
          isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
        )
    }
    /**
     * 在元素集中过滤某些元素
     * @param nodes
     * @param selector
     * @returns {*|HTMLElement}
     */
    function filtered(nodes, selector) {
      return selector == null ? $(nodes) : $(nodes).filter(selector)
    }
    /**
     * 父元素是否包含子元素
     * @type {Function}
     */
    $.contains = document.documentElement.contains ?
      function(parent, node) {
        return parent !== node && parent.contains(node)
      } :
      function(parent, node) {
        while (node && (node = node.parentNode))
          if (node === parent) return true
        return false
      }
    /**
     * 处理 arg为函数/值
     * 为函数，返回函数返回值
     * 为值，返回值
     * @param context
     * @param arg
     * @param idx
     * @param payload
     * @returns {*}
     */
    function funcArg(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }
    /**
     * 设置属性
     * @param node
     * @param name
     * @param value
     */
    function setAttribute(node, name, value) {
      value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    /**
     * 对SVGAnimatedString的兼容？
     * @param node
     * @param value
     * @returns {*}
     */
    function className(node, value) {
      var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined

      if (value === undefined) return svg ? klass.baseVal : klass
      svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    /**
     * 序列化值  把自定义数据读出来时做应该的转换，$.data()方法使用
     * @param value
     * @returns {*}
     */
    function deserializeValue(value) {
      try {
        return value ?
          value == "true" ||
          (value == "false" ? false :
            value == "null" ? null :
            +value + "" == value ? +value :
            /^[\[\{]/.test(value) ? $.parseJSON(value) :
            value) :
          value
      } catch (e) {
        return value
      }
    }

    $.type = type
    $.isFunction = isFunction
    $.isWindow = isWindow
    $.isArray = isArray
    $.isPlainObject = isPlainObject
    /**
     * 空对象
     * @param obj
     * @returns {boolean}
     */
    $.isEmptyObject = function(obj) {
      var name
      for (name in obj) return false
      return true
    }

    $.isNumeric = function(val) {
      var num = Number(val),
        type = typeof val
      return val != null && type != 'boolean' &&
        (type != 'string' || val.length) &&
        !isNaN(num) && isFinite(num) || false
    }
    /**
     * 获取在数组中的索引
     * @param elem
     * @param array
     * @param i
     * @returns {number}
     */
    $.inArray = function(elem, array, i) {
      return emptyArray.indexOf.call(array, elem, i)
    }
    //将字符串转成驼峰格式
    $.camelCase = camelize
    //去字符串头尾空格
    $.trim = function(str) {
      return str == null ? "" : String.prototype.trim.call(str)
    }

    // plugin compatibility
    $.uuid = 0
    $.support = {}
    $.expr = {}
    $.noop = function() {}
    /**
     * 内部方法
     * 遍历对象/数组 在每个元素上执行回调，将回调的返回值放入一个新的数组返回
     * @param elements
     * @param callback
     * @returns {*}
     */
    $.map = function(elements, callback) {
      var value, values = [],
        i, key
      //如果被遍历的数据是数组或者Zepto(伪数组）
      if (likeArray(elements))
        for (i = 0; i < elements.length; i++) {
          value = callback(elements[i], i)
          if (value != null) values.push(value)
        }
      else
        //如果是对象
        for (key in elements) {
          value = callback(elements[key], key)
          if (value != null) values.push(value)
        }
      return flatten(values)
    }
    /**
     * 以集合每一个元素作为上下文，来执行回调函数
     * @param elements
     * @param callback
     * @returns {*}
     */
    $.each = function(elements, callback) {
      var i, key
      if (likeArray(elements)) {
        for (i = 0; i < elements.length; i++)
          if (callback.call(elements[i], i, elements[i]) === false) return elements
      } else {
        for (key in elements)
          if (callback.call(elements[key], key, elements[key]) === false) return elements
      }

      return elements
    }
    /**
     * 查找数组满足过滤函数的元素
     * @param elements
     * @param callback
     * @returns {*}
     */
    $.grep = function(elements, callback) {
      return filter.call(elements, callback)
    }

    if (window.JSON) $.parseJSON = JSON.parse

    //填充class2type的值
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
      class2type["[object " + name + "]"] = name.toLowerCase()
    })

    //针对DOM的一些操作
    $.fn = {
      constructor: zepto.Z,
      length: 0,

      forEach: emptyArray.forEach,
      reduce: emptyArray.reduce,
      push: emptyArray.push,
      sort: emptyArray.sort,
      splice: emptyArray.splice,
      indexOf: emptyArray.indexOf,
      
      /**
       * 合并多个数组
       * @returns {*}
       */
      concat: function() {
        var i, value, args = []
        for (i = 0; i < arguments.length; i++) {
          value = arguments[i]
          args[i] = zepto.isZ(value) ? value.toArray() : value
        }
        return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
      },

      /**
       * 遍历对象/数组 在每个元素上执行回调，将回调的返回值放入一个新的Zepto返回
       * @param fn
       * @returns {*|HTMLElement}
       */
      map: function(fn) {
        return $($.map(this, function(el, i) { return fn.call(el, i, el) }))
      },
      /**
       * slice包装成Zepto
       * @returns {*|HTMLElement}
       */
      slice: function() {
        return $(slice.apply(this, arguments))
      },
      /**
       * 当DOM载入就绪时，绑定回调
       * 如  $(function(){}） $(document).ready(function(){
        // 在这里写你的代码
       * @param callback
       * @returns {*}
       */
      ready: function(callback) {
        //如果已经ready
        if (readyRE.test(document.readyState) && document.body) callback($)
        //监听DOM已渲染完毕事件
        else document.addEventListener('DOMContentLoaded', function() { callback($) }, false)
        return this
      },
      /**
       * 取Zepto中指定索引的值
       * @param idx    可选，不传时，将Zetpo转换成数组
       * @returns {*}
       */
      get: function(idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
      },
      /**
       * 将Zepto(伪数组)转换成数组
       * 原理是 伪数组转换成数组oa = {0:'a',length:1};Array.prototype.slice.call(oa);
       * 数组转换伪数组  var obj = {}, push = Array.prototype.push; push.apply(obj,[1,2]);
       * @returns {*}
       */
      toArray: function() { return this.get() },
      //获取集合长度
      size: function() {
        return this.length
      },
      /**
       * 删除元素集
       * 原理   parentNode.removeChild
       * @returns {*}
       */
      remove: function() {
        return this.each(function() {
          if (this.parentNode != null)
            this.parentNode.removeChild(this)
        })
      },
      //遍历集合，将集合中的每一项放入callback中进行处理，去掉结果为false的项，注意这里的callback如果明确返回false
      //那么就会停止循环了
      /**
       *  遍历Zepto，在每个元素上执行回调函数
       * @param callback
       * @returns {*}
       */
      each: function(callback) {
        emptyArray.every.call(this, function(el, idx) {
          return callback.call(el, idx, el) !== false
        })
        return this
      },
      /**
       *  过滤，返回处理结果为true的记录
       * @param selector
       * @returns {*}
       */
      filter: function(selector) {
        //this.not(selector)取到需要排除的集合，第二次再取反(这个时候this.not的参数就是一个集合了)，得到想要的集合
        if (isFunction(selector)) return this.not(this.not(selector))
        //filter收集返回结果为true的记录
        return $(filter.call(this, function(element) {
          //当element与selector匹配，则收集
          return zepto.matches(element, selector)
        }))
      },
      //将由selector获取到的结果追加到当前集合中
      add: function(selector, context) {
        //追加并去重
        return $(uniq(this.concat($(selector, context))))
      },
      //返回集合中的第1条记录是否与selector匹配
      is: function(selector) {
        return this.length > 0 && zepto.matches(this[0], selector)
      },
      //排除集合里满足条件的记录，接收参数为：css选择器，function, dom ,nodeList
      not: function(selector) {
        var nodes = []
        //当selector为函数时，safari下的typeof odeList也是function，所以这里需要再加一个判断selector.call !== undefined
        if (isFunction(selector) && selector.call !== undefined)
          this.each(function(idx) {
            if (!selector.call(this, idx)) nodes.push(this)
          })
        else {
          //当selector为字符串的时候，对集合进行筛选，也就是筛选出集合中满足selector的记录
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            //当selector为nodeList时执行slice.call(selector),注意这里的isFunction(selector.item)是为了排除selector为数组的情况
            //当selector为css选择器，执行$(selector)
            (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
          this.forEach(function(el) {
            //筛选出不在excludes集合里的记录，达到排除的目的
            if (excludes.indexOf(el) < 0) nodes.push(el)
          })
        }
        //由于上面得到的结果是数组，这里需要转成zepto对象，以便继承其它方法，实现链写
        return $(nodes)
      },
      /*
       接收node和string作为参数，给当前集合筛选出包含selector的集合
       isObject(selector)是判断参数是否是node，因为typeof node == 'object'
       当参数为node时，只需要判读当前记当里是否包含node节点即可
       当参数为string时，则在当前记录里查询selector，如果长度为0，则为false，filter函数就会过滤掉这条记录，否则保存该记录
       */
      has: function(selector) {
        return this.filter(function() {
          return isObject(selector) ?
            $.contains(this, selector) :
            $(this).find(selector).size()
        })
      },
      /**
       * 取Zepto中的指定索引的元素，再包装成Zepto返回
       * @param idx
       * @returns {*}
       */
      eq: function(idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
      },
      /*
       取第一条$(元素）
       */
      first: function() {
        var el = this[0] //取第一个元素
        //非$对象，转换成$，
        //如果element，isObject会判断为true。zepto也判断为true，都会重新转换成$(el)
        //TODO:这里是bug？
        return el && !isObject(el) ? el : $(el)
      },
      /*
       取最后一条$(元素）
       */
      last: function() {
        var el = this[this.length - 1]
        return el && !isObject(el) ? el : $(el)
      },
      /*
       在当前集合中查找selector，selector可以是集合，选择器，以及节点
       */
      find: function(selector) {
        var result, $this = this
        //如果selector为node或者zepto集合时
        if (!selector) result = $()
        //遍历selector，筛选出父级为集合中记录的selector
        else if (typeof selector == 'object')
          result = $(selector).filter(function() {
            var node = this
            //如果$.contains(parent, node)返回true，则emptyArray.some也会返回true,外层的filter则会收录该条记录
            return emptyArray.some.call($this, function(parent) {
              return $.contains(parent, node)
            })
          })
        //如果selector是css选择器
        //如果当前集合长度为1时，调用zepto.qsa，将结果转成zepto对象
        else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
        //如果长度大于1，则调用map遍历
        else result = this.map(function() { return zepto.qsa(this, selector) })
        return result
      },
      /**
       * 取最近的满足selector选择器的祖先元素
       * @param selector
       * @param context
       * @returns {*|HTMLElement}
       */
      closest: function(selector, context) {
        var nodes = [],
          collection = typeof selector == 'object' && $(selector)
        this.each(function(_, node) {
          //node递归parentNode，直到满足selector表达式，返回$
          while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
            //当node 不是context,document的时候，取node.parentNode
            node = node !== context && !isDocument(node) && node.parentNode
          if (node && nodes.indexOf(node) < 0) nodes.push(node)
        })
        return $(nodes)
      },
      /**
       * 取得所有匹配的祖先元素
       * @param selector
       * @returns {*}
       */
      parents: function(selector) {
        var ancestors = [],
          nodes = this
        //先取得所有祖先元素
        while (nodes.length > 0) //到不再有父元素时，退出循环
          //取得所有父元素 //nodes被再赋值为收集到的父元素数组
          nodes = $.map(nodes, function(node) {
            //获取父级， isDocument(node) 到Document为止
            //    ancestors.indexOf(node)去重复
            if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
              //收集已经获取到的父级元素，用于去重复
              ancestors.push(node)
              return node
            }
          })
        //筛选出符合selector的祖先元素
        return filtered(ancestors, selector)
      },
      /**
       * 获取父元素
       * @param selector
       * @returns {*|HTMLElement}
       */
      parent: function(selector) {
        return filtered(uniq(this.pluck('parentNode')), selector)
      },
      /**
       *   获取子元素集
       * @param selector
       * @returns {*|HTMLElement}
       */
      children: function(selector) {
        return filtered(this.map(function() { return children(this) }), selector)
      },
      /**
       * 获取iframe的docment，或子节集
       * @returns {*|HTMLElement}
       */
      contents: function() {
        return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
      },
      /**
       * 获取兄弟节点集
       * @param selector
       * @returns {*|HTMLElement}
       */
      siblings: function(selector) {
        return filtered(this.map(function(i, el) {
          //到其父元素取得所有子节点，再排除本身
          return filter.call(children(el.parentNode), function(child) { return child !== el })
        }), selector)
      },
      /**
       * 移除所有子元素
       * 原理：  innerHTML = ''
       * @returns {*}
       */
      empty: function() {
        return this.each(function() { this.innerHTML = '' })
      },
       /**
       * 根据是否存在此属性来获取当前集合
       * @param property
       * @returns {*}
       */
      pluck: function(property) {
        return $.map(this, function(el) { return el[property] })
      },
      /**
       * 展示
       * @returns {*}
       */
      show: function() {
        return this.each(function() {
          //清除内联样式display="none"
          this.style.display == "none" && (this.style.display = '')
          //计算样式display为none时，重赋显示值
          if (getComputedStyle(this, '').getPropertyValue("display") == "none")
            this.style.display = defaultDisplay(this.nodeName)
          //defaultDisplay是获取元素默认display的方法
        })
      },
      /**
       * 替换元素
       * 原理  before
       * @param newContent
       * @returns {*}
       */
      replaceWith: function(newContent) {
        //将要替换内容插到被替换内容前面，然后删除被替换内容
        return this.before(newContent).remove()
      },
      /**
       * 匹配的每条元素都被单个元素包裹
       * @param structure   fun/
       * @returns {*}
       */
      wrap: function(structure) {
        var func = isFunction(structure)
        if (this[0] && !func) //如果structure是字符串
          //直接转成DOM
          var dom = $(structure).get(0),
            //如果DOM已存在(通过在文档中读parentNode判断)，或$集不止一条，需要克隆。避免DOM被移动位置
            clone = dom.parentNode || this.length > 1

        return this.each(function(index) {
          //递归包裹克隆的DOM
          $(this).wrapAll(
            func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom //克隆包裹
          )
        })
      },
      /**
       * 将所有匹配的元素用单个元素包裹起来
       * @param structure   包裹内容
       * @returns {*}
       */
      wrapAll: function(structure) {
        if (this[0]) {
          //包裹内容插入到第一个元素前
          $(this[0]).before(structure = $(structure))
          var children
          //取包裹内容里的第一个子元素的最里层
          while ((children = structure.children()).length) structure = children.first()
          //将当前$插入到最里层元素里
          $(structure).append(this)
        }
        return this
      },
      /**
       * 包裹到里面  将每一个匹配元素的子内容(包括文本节点)用HTML包裹起来
       * 原理  获取节点的内容
       * @param structure
       * @returns {*}
       */
      wrapInner: function(structure) {
        var func = isFunction(structure)
        return this.each(function(index) {
          //遍历获取节点的内容，然后用structure将内容包裹
          var self = $(this),
            contents = self.contents(),
            dom = func ? structure.call(this, index) : structure
          contents.length ? contents.wrapAll(dom) : self.append(dom) //内容不存在，直接添加structure
        })
      },
      /**
       * 去包裹  移除元素的父元素
       * 原理： 子元素替换父元素
       * @returns {*}
       */
      unwrap: function() {
        this.parent().each(function() {
          $(this).replaceWith($(this).children())
        })
        return this
      },
       /**
       * 复制元素的副本 TODO:事件、自定义数据会复制吗？
       * 原理  cloneNode
       * @returns {*|HTMLElement}
       */
      clone: function() {
        return this.map(function() { return this.cloneNode(true) })
      },
      /**
       * 隐藏
       * @returns {*}
       */
      hide: function() {
        return this.css("display", "none")
      },
      /**
       * 不给参数，切换显示隐藏
       * 给参数  true show  false hide
       * @param setting
       * @returns {*}
       */
      toggle: function(setting) {
        return this.each(function() {
          var el = $(this);
          (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide()
        })
      },
      /**
       * 筛选前面所有的兄弟元素
       * @param selector
       * @returns {*}
       */
      prev: function(selector) { return $(this.pluck('previousElementSibling')).filter(selector || '*') },
      /**
       * 筛选后面所有的兄弟元素
       * @param selector
       * @returns {*}
       */
      next: function(selector) { return $(this.pluck('nextElementSibling')).filter(selector || '*') },
      /**
       * 读写元素HTML内容
       * 原理 通过innerHTML读内容,append()写内容
       * @param html
       * @returns {*|string|string|string|string|string}
       */
      html: function(html) {
        return 0 in arguments ?
          this.each(function(idx) {
            var originHtml = this.innerHTML  //记录原始的innerHTMl
            //如果参数html是字符串直接插入到记录中，
            //如果是函数，则将当前记录作为上下文，调用该函数，且传入该记录的索引和原始innerHTML作为参数
            $(this).empty().append(funcArg(this, html, idx, originHtml))
          }) :
          (0 in this ? this[0].innerHTML : null)
      },
      /**
       * 读写元素文本内容
       * 原理：  通过 textContent 读写文本
       * @param text
       * @returns {*}
       */
      text: function(text) {
        return 0 in arguments ?
          this.each(function(idx) {
            var newText = funcArg(this, text, idx, this.textContent)
            this.textContent = newText == null ? '' : '' + newText
          }) :
          (0 in this ? this.pluck('textContent').join("") : null)
      },
      /**
       * 元素的HTML属性读写
       * 读：原理是getAttribute
       * 写：原理是setAttribute
       * @param name
       * @param value
       * @returns {undefined}
       */
      attr: function(name, value) {
        var result
        //仅有name，且为字符串时，表示读
        return (typeof name == 'string' && !(1 in arguments)) ?
          //$是空的 或里面的元素非元素，返回undefined
          (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
          this.each(function(idx) {
            if (this.nodeType !== 1) return
            //如果name为对象，批量设置属性
            if (isObject(name))
              for (key in name) setAttribute(this, key, name[key])
            //处理value为函数/null/undefined的情况
            else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
          })
      },
      /**
       * 元素的删除
       * @param name 单个值 空格分隔
       * @returns {*}
       */
      removeAttr: function(name) {
        return this.each(function() {
          this.nodeType === 1 && name.split(' ').forEach(function(attribute) {
            //不传value，会直接调用removeAttribute删除属性
            setAttribute(this, attribute)
          }, this)
        })
      },
       //获取第一条数据的指定的name属性或者给每条数据添加自定义属性，注意和setAttribute的区别
      /**
       * 元素的DOM属性读写
       * 原理：Element[name] 操作
       * @param name
       * @param value
       * @returns {*}
       */
      prop: function(name, value) {
        //优先读取修正属性，DOM的两字母属性都是驼峰格式
        name = propMap[name] || name
        //没有给定value时，为获取，给定value则给每一条数据添加，value可以为值也可以是一个返回值的函数
        return (1 in arguments) ?
          //有value，遍历写入
          this.each(function(idx) {
            this[name] = funcArg(this, value, idx, this[name])
          }) :
          //读第一个元素
          (this[0] && this[0][name])
      },
      removeProp: function(name) {
        name = propMap[name] || name
        return this.each(function() { delete this[name] })
      },
      /**
       * 设置自定义数据
       * 注意与jQuery的区别，jQuery可以读写任何数据类型。这里原理是H5的data-，或直接setAttribute/getAttribute，只能读写字符串
       * @param name
       * @param value
       * @returns {*}
       */
      data: function(name, value) {
        var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

        var data = (1 in arguments) ?
          this.attr(attrName, value) :
          this.attr(attrName)

        return data !== null ? deserializeValue(data) : undefined
      },
      /**
       * 适合表单元素读写
       * 写： 写入每个元素   element.value
       * 读： 读第一个元素
       * @param value  值/函数
       * @returns {*}
       */
      val: function(value) {
        if (0 in arguments) {
          if (value == null) value = ""
          return this.each(function(idx) {
            this.value = funcArg(this, value, idx, this.value)
          })
        } else {
          return this[0] && (this[0].multiple ?
            $(this[0]).find('option').filter(function() { return this.selected }).pluck('value') :
            this[0].value)
        }
      },
      /**
       * 读/写坐标  距离文档document的偏移值
       * 原理： 读 getBoundingClientRect视窗坐标-页面偏移   写：坐标-父元素坐标
       * @param coordinates
       * @returns {*}
       */
      offset: function(coordinates) {
        //写入坐标
        if (coordinates) return this.each(function(index) {
          var $this = $(this),
            //如果coordinates是函数，执行函数，
            coords = funcArg(this, coordinates, index, $this.offset()),
            //取父元素坐标
            parentOffset = $this.offsetParent().offset(),
            //计算出合理的坐标
            props = {
              top: coords.top - parentOffset.top,
              left: coords.left - parentOffset.left
            }
          //修正postin  static-relative
          if ($this.css('position') == 'static') props['position'] = 'relative'
          //写入样式
          $this.css(props)
        })
        //读取坐标 取第一个元素的坐标
        if (!this.length) return null
        //如果父元素是document
        if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
          return { top: 0, left: 0 }
        //读取到元素相对于页面视窗的位置
        var obj = this[0].getBoundingClientRect()
        //window.pageYOffset就是类似Math.max(document.documentElement.scrollTop||document.body.scrollTop)
        return {
          left: obj.left + window.pageXOffset,
          top: obj.top + window.pageYOffset,
          width: Math.round(obj.width),
          height: Math.round(obj.height)
        }
      },
      /**
       * 读写样式   写：内联样式  读：计算样式
       *   原理 读：elment[style]/getComputedStyle， 写 this.style.cssText 行内样式设值
       * @param property   String/Array/Fun
       * @param value
       * @returns {*}
       */
      css: function(property, value) {
        if (arguments.length < 2) {
          var element = this[0]
          if (typeof property == 'string') {
            if (!element) return
            return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
          } else if (isArray(property)) {
            if (!element) return
            var props = {}
            var computedStyle = getComputedStyle(element, '')
            $.each(property, function(_, prop) {
              props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
            })
            return props
          }
        }

        var css = ''
        if (type(property) == 'string') {
          if (!value && value !== 0)
            this.each(function() { this.style.removeProperty(dasherize(property)) })
          else
            css = dasherize(property) + ":" + maybeAddPx(property, value)
        } else {
          for (key in property)
            if (!property[key] && property[key] !== 0)
              this.each(function() { this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
        }

        return this.each(function() { this.style.cssText += ';' + css })
      },
      index: function(element) {
        return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
      },
      /**
       * 是否含有指定的类样式
       * @param name
       * @returns {boolean}
       */
      hasClass: function(name) {
        if (!name) return false
        return emptyArray.some.call(this, function(el) {
          return this.test(className(el))
        }, classRE(name))
      },
       /**
       * 增加一个或多个类名
       * @param name  类名/空格分隔的类名/函数
       * @returns {*}
       */
      addClass: function(name) {
        if (!name) return this
        return this.each(function(idx) {
          if (!('className' in this)) return
          classList = []
          var cls = className(this),
            newName = funcArg(this, name, idx, cls) //修正类名，处理name是函数，SVG动画兼容的情况
          //多个类，空格分隔为数组
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass)) classList.push(klass)
          }, this)
          //设值
          classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
        })
      },
      /**
       *删除一个或多个类名 同addClass
       * 原理： className.repalce 替换撒谎年初
       * @param name 类名/空格分隔的类名/函数
       * @returns {*}
       */
      removeClass: function(name) {
        return this.each(function(idx) {
          if (!('className' in this)) return
          if (name === undefined) return className(this, '')
          classList = className(this)
          funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
            //替换删除
            classList = classList.replace(classRE(klass), " ")
          })
          className(this, classList.trim())
        })
      },
      /**
       *切换类的添加或移除
       * 原理 如果存在，即removeClass移除，不存在，即addClass添加
       * @param name   类名/空格分隔的类名/函数
       * @param when
       * @returns {*}
       */
      toggleClass: function(name, when) {
        if (!name) return this
        return this.each(function(idx) {
          var $this = $(this),
            names = funcArg(this, name, idx, className(this))
          names.split(/\s+/g).forEach(function(klass) {
            (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass): $this.removeClass(klass)
          })
        })
      },
      /**
       * 读写元素 滚动条的垂直偏移
       * 读： 第一个元素  scrollTop 或 pageYOffset
       * 写：所有元素     scrollTop
       * 如果设置的偏移值，滚动做不到，可能不生效，不会取滚动最大值
       * @param value
       * @returns {*}
       */
      scrollTop: function(value) {
        if (!this.length) return
        var hasScrollTop = 'scrollTop' in this[0]
        if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset //取scrollTop 或 pageYOffset(Sarifri老版只有它）
        return this.each(hasScrollTop ?
          function() { this.scrollTop = value } : //支持scrollTop，直接赋值
          function() { this.scrollTo(this.scrollX, value) }) //滚到指定坐标
      },
      /**
       * 读写元素 滚动条的垂直偏移
       * 读： 第一个元素  scrollLeft 或 pageXOffset
       * 写：所有元素     scrollLeft
       * @param value
       * @returns {*}
       */
      scrollLeft: function(value) {
        if (!this.length) return
        var hasScrollLeft = 'scrollLeft' in this[0]
        if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
        return this.each(hasScrollLeft ?
          function() { this.scrollLeft = value } :
          function() { this.scrollTo(value, this.scrollY) })
      },
      /**
       * 获取相对父元素的坐标  当前元素的外边框magin到最近父元素内边框的距离
       * @returns {{top: number, left: number}}
       */
      position: function() {
        if (!this.length) return

        var elem = this[0],
          //读到父元素
          offsetParent = this.offsetParent(),
          //读到坐标
          offset = this.offset(),
          //读到父元素的坐标
          parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

        //坐标减去外边框
        offset.top -= parseFloat($(elem).css('margin-top')) || 0
        offset.left -= parseFloat($(elem).css('margin-left')) || 0

        //加上父元素的border
        parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
        parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

        return {
          top: offset.top - parentOffset.top,
          left: offset.left - parentOffset.left
        }
      },
      /**
       * 返回第一个匹配元素用于定位的祖先元素
       * 原理：读取父元素中第一个其position设为relative或absolute的可见元素
       * @returns {*|HTMLElement}
       */
      offsetParent: function() {
        //map遍历$集，在回调函数里读出最近的定位祖先元素 ，再返回包含这些定位元素的$对象
        return this.map(function() {
          //读取定位父元素，没有，则body
          var parent = this.offsetParent || document.body
          //如果找到的定位元素  position=‘static’继续往上找，直到body/Html
          while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
            parent = parent.offsetParent
          return parent
        })
      }
    }

    // for now
    $.fn.detach = $.fn.remove

    ;
    /*
     * width height 模板方法  读写width/height
     */
    ['width', 'height'].forEach(function(dimension) {
      //将width,hegiht转成Width,Height，用于document获取
      var dimensionProperty =
        dimension.replace(/./, function(m) { return m[0].toUpperCase() })

      $.fn[dimension] = function(value) {
        var offset, el = this[0]
        //读时，是window 用innerWidth,innerHeight获取
        if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
          //是document，用scrollWidth,scrollHeight获取
          isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
          (offset = this.offset()) && offset[dimension]
        else return this.each(function(idx) {
          el = $(this)
          //设值，支持value为函数
          el.css(dimension, funcArg(this, value, idx, el[dimension]()))
        })
      }
    })

    function traverseNode(node, fun) {
      fun(node)
      for (var i = 0, len = node.childNodes.length; i < len; i++)
        traverseNode(node.childNodes[i], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function(operator, operatorIndex) {
      var inside = operatorIndex % 2 //=> prepend, append

      $.fn[operator] = function() {
        // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
        var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
        if (nodes.length < 1) return this

        return this.each(function(_, target) {
          parent = inside ? target : target.parentNode

          // convert all methods to a "before" operation
          target = operatorIndex == 0 ? target.nextSibling :
            operatorIndex == 1 ? target.firstChild :
            operatorIndex == 2 ? target :
            null

          var parentInDocument = $.contains(document.documentElement, parent)

          nodes.forEach(function(node) {
            if (copyByClone) node = node.cloneNode(true)
            else if (!parent) return $(node).remove()

            parent.insertBefore(node, target)
            if (parentInDocument) traverseNode(node, function(el) {
              if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                (!el.type || el.type === 'text/javascript') && !el.src) {
                var target = el.ownerDocument ? el.ownerDocument.defaultView : window
                target['eval'].call(target, el.innerHTML)
              }
            })
          })
        })
      }

      // after    => insertAfter
      // prepend  => prependTo
      // before   => insertBefore
      // append   => appendTo
      $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html) {
        $(html)[operator](this)
        return this
      }
    })

    zepto.Z.prototype = Z.prototype = $.fn

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq
    zepto.deserializeValue = deserializeValue
    $.zepto = zepto

    return $
  })()

  window.Zepto = Zepto
  window.$ === undefined && (window.$ = Zepto)

  ;
  (function($) {
    var _zid = 1,
      undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj) { return typeof obj == 'string' },
      handlers = {},
      specialEvents = {},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid(element) {
      return element._zid || (element._zid = _zid++)
    }

    function findHandlers(element, event, fn, selector) {
      event = parse(event)
      if (event.ns) var matcher = matcherFor(event.ns)
      return (handlers[zid(element)] || []).filter(function(handler) {
        return handler &&
          (!event.e || handler.e == event.e) &&
          (!event.ns || matcher.test(handler.ns)) &&
          (!fn || zid(handler.fn) === zid(fn)) &&
          (!selector || handler.sel == selector)
      })
    }

    function parse(event) {
      var parts = ('' + event).split('.')
      return { e: parts[0], ns: parts.slice(1).sort().join(' ') }
    }

    function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture(handler, captureSetting) {
      return handler.del &&
        (!focusinSupported && (handler.e in focus)) ||
        !!captureSetting
    }

    function realEvent(type) {
      return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add(element, events, fn, data, selector, delegator, capture) {
      var id = zid(element),
        set = (handlers[id] || (handlers[id] = []))
      events.split(/\s/).forEach(function(event) {
        if (event == 'ready') return $(document).ready(fn)
        var handler = parse(event)
        handler.fn = fn
        handler.sel = selector
        // emulate mouseenter, mouseleave
        if (handler.e in hover) fn = function(e) {
          var related = e.relatedTarget
          if (!related || (related !== this && !$.contains(this, related)))
            return handler.fn.apply(this, arguments)
        }
        handler.del = delegator
        var callback = delegator || fn
        handler.proxy = function(e) {
          e = compatible(e)
          if (e.isImmediatePropagationStopped()) return
          e.data = data
          var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
          if (result === false) e.preventDefault(), e.stopPropagation()
          return result
        }
        handler.i = set.length
        set.push(handler)
        if ('addEventListener' in element)
          element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    }

    function remove(element, events, fn, selector, capture) {
      var id = zid(element);
      (events || '').split(/\s/).forEach(function(event) {
        findHandlers(element, event, fn, selector).forEach(function(handler) {
          delete handlers[id][handler.i]
          if ('removeEventListener' in element)
            element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        })
      })
    }

    $.event = { add: add, remove: remove }

    $.proxy = function(fn, context) {
      var args = (2 in arguments) && slice.call(arguments, 2)
      if (isFunction(fn)) {
        var proxyFn = function() { return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
        proxyFn._zid = zid(fn)
        return proxyFn
      } else if (isString(context)) {
        if (args) {
          args.unshift(fn[context], fn)
          return $.proxy.apply(null, args)
        } else {
          return $.proxy(fn[context], fn)
        }
      } else {
        throw new TypeError("expected function")
      }
    }

    $.fn.bind = function(event, data, callback) {
      return this.on(event, data, callback)
    }
    $.fn.unbind = function(event, callback) {
      return this.off(event, callback)
    }
    $.fn.one = function(event, selector, data, callback) {
      return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function() { return true },
      returnFalse = function() { return false },
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

    function compatible(event, source) {
      if (source || !event.isDefaultPrevented) {
        source || (source = event)

        $.each(eventMethods, function(name, predicate) {
          var sourceMethod = source[name]
          event[name] = function() {
            this[predicate] = returnTrue
            return sourceMethod && sourceMethod.apply(source, arguments)
          }
          event[predicate] = returnFalse
        })

        event.timeStamp || (event.timeStamp = Date.now())

        if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
          event.isDefaultPrevented = returnTrue
      }
      return event
    }

    function createProxy(event) {
      var key, proxy = { originalEvent: event }
      for (key in event)
        if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

      return compatible(proxy, event)
    }

    $.fn.delegate = function(selector, event, callback) {
      return this.on(event, selector, callback)
    }
    $.fn.undelegate = function(selector, event, callback) {
      return this.off(event, selector, callback)
    }

    $.fn.live = function(event, callback) {
      $(document.body).delegate(this.selector, event, callback)
      return this
    }
    $.fn.die = function(event, callback) {
      $(document.body).undelegate(this.selector, event, callback)
      return this
    }

    $.fn.on = function(event, selector, data, callback, one) {
      var autoRemove, delegator, $this = this
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.on(type, selector, data, fn, one)
        })
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        callback = data, data = selector, selector = undefined
      if (callback === undefined || data === false)
        callback = data, data = undefined

      if (callback === false) callback = returnFalse

      return $this.each(function(_, element) {
        if (one) autoRemove = function(e) {
          remove(element, e.type, callback)
          return callback.apply(this, arguments)
        }

        if (selector) delegator = function(e) {
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match && match !== element) {
            evt = $.extend(createProxy(e), { currentTarget: match, liveFired: element })
            return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
          }
        }

        add(element, event, callback, data, selector, delegator || autoRemove)
      })
    }
    $.fn.off = function(event, selector, callback) {
      var $this = this
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.off(type, selector, fn)
        })
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        callback = selector, selector = undefined

      if (callback === false) callback = returnFalse

      return $this.each(function() {
        remove(this, event, callback, selector)
      })
    }

    $.fn.trigger = function(event, args) {
      event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
      event._args = args
      return this.each(function() {
        // handle focus(), blur() by calling them directly
        if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
        // items in the collection might not be DOM elements
        else if ('dispatchEvent' in this) this.dispatchEvent(event)
        else $(this).triggerHandler(event, args)
      })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function(event, args) {
      var e, result
      this.each(function(i, element) {
        e = createProxy(isString(event) ? $.Event(event) : event)
        e._args = args
        e.target = element
        $.each(findHandlers(element, event.type || event), function(i, handler) {
          result = handler.proxy(e)
          if (e.isImmediatePropagationStopped()) return false
        })
      })
      return result
    }

    // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout focus blur load resize scroll unload click dblclick ' +
      'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
      'change select keydown keypress keyup error').split(' ').forEach(function(event) {
      $.fn[event] = function(callback) {
        return (0 in arguments) ?
          this.bind(event, callback) :
          this.trigger(event)
      }
    })

    $.Event = function(type, props) {
      if (!isString(type)) props = type, type = props.type
      var event = document.createEvent(specialEvents[type] || 'Events'),
        bubbles = true
      if (props)
        for (var name in props)(name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
      event.initEvent(type, bubbles, true)
      return compatible(event)
    }

  })(Zepto)

  ;
  (function($) {
    var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

    originAnchor.href = window.location.href

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
      var event = $.Event(eventName)
      $(context).trigger(event, data)
      return !event.isDefaultPrevented()
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
      if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart(settings) {
      if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
      if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
      var context = settings.context
      if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
        return false

      triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings, deferred) {
      var context = settings.context,
        status = 'success'
      settings.success.call(context, data, status, xhr)
      if (deferred) deferred.resolveWith(context, [data, status, xhr])
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
      ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings, deferred) {
      var context = settings.context
      settings.error.call(context, xhr, type, error)
      if (deferred) deferred.rejectWith(context, [xhr, type, error])
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
      ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
      var context = settings.context
      settings.complete.call(context, xhr, status)
      triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
      ajaxStop(settings)
    }

    function ajaxDataFilter(data, type, settings) {
      if (settings.dataFilter == empty) return data
      var context = settings.context
      return settings.dataFilter.call(context, data, type)
    }

    // Empty function, used as default callback
    function empty() {}

    $.ajaxJSONP = function(options, deferred) {
      if (!('type' in options)) return $.ajax(options)

      var _callbackName = options.jsonpCallback,
        callbackName = ($.isFunction(_callbackName) ?
          _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
        script = document.createElement('script'),
        originalCallback = window[callbackName],
        responseData,
        abort = function(errorType) {
          $(script).triggerHandler('error', errorType || 'abort')
        },
        xhr = { abort: abort },
        abortTimeout

      if (deferred) deferred.promise(xhr)

      $(script).on('load error', function(e, errorType) {
        clearTimeout(abortTimeout)
        $(script).off().remove()

        if (e.type == 'error' || !responseData) {
          ajaxError(null, errorType || 'error', xhr, options, deferred)
        } else {
          ajaxSuccess(responseData[0], xhr, options, deferred)
        }

        window[callbackName] = originalCallback
        if (responseData && $.isFunction(originalCallback))
          originalCallback(responseData[0])

        originalCallback = responseData = undefined
      })

      if (ajaxBeforeSend(xhr, options) === false) {
        abort('abort')
        return xhr
      }

      window[callbackName] = function() {
        responseData = arguments
      }

      script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
      document.head.appendChild(script)

      if (options.timeout > 0) abortTimeout = setTimeout(function() {
        abort('timeout')
      }, options.timeout)

      return xhr
    }

    $.ajaxSettings = {
      // Default type of request
      type: 'GET',
      // Callback that is executed before request
      beforeSend: empty,
      // Callback that is executed if the request succeeds
      success: empty,
      // Callback that is executed the the server drops error
      error: empty,
      // Callback that is executed on request complete (both: error and success)
      complete: empty,
      // The context for the callbacks
      context: null,
      // Whether to trigger "global" Ajax events
      global: true,
      // Transport
      xhr: function() {
        return new window.XMLHttpRequest()
      },
      // MIME types mapping
      // IIS returns Javascript as "application/x-javascript"
      accepts: {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
      },
      // Whether the request is to another domain
      crossDomain: false,
      // Default timeout
      timeout: 0,
      // Whether data should be serialized to string
      processData: true,
      // Whether the browser should be allowed to cache GET responses
      cache: true,
      //Used to handle the raw response data of XMLHttpRequest.
      //This is a pre-filtering function to sanitize the response.
      //The sanitized response should be returned
      dataFilter: empty
    }

    function mimeToDataType(mime) {
      if (mime) mime = mime.split(';', 2)[0]
      return mime && (mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
        xmlTypeRE.test(mime) && 'xml') || 'text'
    }

    function appendQuery(url, query) {
      if (query == '') return url
      return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
      if (options.processData && options.data && $.type(options.data) != "string")
        options.data = $.param(options.data, options.traditional)
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
        options.url = appendQuery(options.url, options.data), options.data = undefined
    }

    $.ajax = function(options) {
      var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
      for (key in $.ajaxSettings)
        if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

      ajaxStart(settings)

      if (!settings.crossDomain) {
        urlAnchor = document.createElement('a')
        urlAnchor.href = settings.url
        // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
        urlAnchor.href = urlAnchor.href
        settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
      }

      if (!settings.url) settings.url = window.location.toString()
      if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
      serializeData(settings)

      var dataType = settings.dataType,
        hasPlaceholder = /\?.+=\?/.test(settings.url)
      if (hasPlaceholder) dataType = 'jsonp'

      if (settings.cache === false || (
          (!options || options.cache !== true) &&
          ('script' == dataType || 'jsonp' == dataType)
        ))
        settings.url = appendQuery(settings.url, '_=' + Date.now())

      if ('jsonp' == dataType) {
        if (!hasPlaceholder)
          settings.url = appendQuery(settings.url,
            settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
        return $.ajaxJSONP(settings, deferred)
      }

      var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

      if (deferred) deferred.promise(xhr)

      if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
      setHeader('Accept', mime || '*/*')
      if (mime = settings.mimeType || mime) {
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
      }
      if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

      if (settings.headers)
        for (name in settings.headers) setHeader(name, settings.headers[name])
      xhr.setRequestHeader = setHeader

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty
          clearTimeout(abortTimeout)
          var result, error = false
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
            dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

            if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
              result = xhr.response
            else {
              result = xhr.responseText

              try {
                // http://perfectionkills.com/global-eval-what-are-the-options/
                // sanitize response accordingly if data filter callback provided
                result = ajaxDataFilter(result, dataType, settings)
                if (dataType == 'script')(1, eval)(result)
                else if (dataType == 'xml') result = xhr.responseXML
                else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
              } catch (e) { error = e }

              if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
            }

            ajaxSuccess(result, xhr, settings, deferred)
          } else {
            ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
          }
        }
      }

      if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort()
        ajaxError(null, 'abort', xhr, settings, deferred)
        return xhr
      }

      var async = 'async' in settings ? settings.async : true
      xhr.open(settings.type, settings.url, async, settings.username, settings.password)

      if (settings.xhrFields)
        for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

      for (name in headers) nativeSetHeader.apply(xhr, headers[name])

      if (settings.timeout > 0) abortTimeout = setTimeout(function() {
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

      // avoid sending empty string (#319)
      xhr.send(settings.data ? settings.data : null)
      return xhr
    }

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
      if ($.isFunction(data)) dataType = success, success = data, data = undefined
      if (!$.isFunction(success)) dataType = success, success = undefined
      return {
        url: url,
        data: data,
        success: success,
        dataType: dataType
      }
    }

    $.get = function( /* url, data, success, dataType */ ) {
      return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function( /* url, data, success, dataType */ ) {
      var options = parseArguments.apply(null, arguments)
      options.type = 'POST'
      return $.ajax(options)
    }

    $.getJSON = function( /* url, data, success */ ) {
      var options = parseArguments.apply(null, arguments)
      options.dataType = 'json'
      return $.ajax(options)
    }

    $.fn.load = function(url, data, success) {
      if (!this.length) return this
      var self = this,
        parts = url.split(/\s/),
        selector,
        options = parseArguments(url, data, success),
        callback = options.success
      if (parts.length > 1) options.url = parts[0], selector = parts[1]
      options.success = function(response) {
        self.html(selector ?
          $('<div>').html(response.replace(rscript, "")).find(selector) :
          response)
        callback && callback.apply(self, arguments)
      }
      $.ajax(options)
      return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
      var type, array = $.isArray(obj),
        hash = $.isPlainObject(obj)
      $.each(obj, function(key, value) {
        type = $.type(value)
        if (scope) key = traditional ? scope :
          scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
        // handle data in serializeArray() format
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        else if (type == "array" || (!traditional && type == "object"))
          serialize(params, value, traditional, key)
        else params.add(key, value)
      })
    }

    $.param = function(obj, traditional) {
      var params = []
      params.add = function(key, value) {
        if ($.isFunction(value)) value = value()
        if (value == null) value = ""
        this.push(escape(key) + '=' + escape(value))
      }
      serialize(params, obj, traditional)
      return params.join('&').replace(/%20/g, '+')
    }
  })(Zepto)

  ;
  (function($) {
    $.fn.serializeArray = function() {
      var name, type, result = [],
        add = function(value) {
          if (value.forEach) return value.forEach(add)
          result.push({ name: name, value: value })
        }
      if (this[0]) $.each(this[0].elements, function(_, field) {
        type = field.type, name = field.name
        if (name && field.nodeName.toLowerCase() != 'fieldset' &&
          !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
          ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
      })
      return result
    }

    $.fn.serialize = function() {
      var result = []
      this.serializeArray().forEach(function(elm) {
        result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
      })
      return result.join('&')
    }

    $.fn.submit = function(callback) {
      if (0 in arguments) this.bind('submit', callback)
      else if (this.length) {
        var event = $.Event('submit')
        this.eq(0).trigger(event)
        if (!event.isDefaultPrevented()) this.get(0).submit()
      }
      return this
    }

  })(Zepto)

  ;
  (function() {
    // getComputedStyle shouldn't freak out when called
    // without a valid element as argument
    try {
      getComputedStyle(undefined)
    } catch (e) {
      var nativeGetComputedStyle = getComputedStyle
      window.getComputedStyle = function(element, pseudoElement) {
        try {
          return nativeGetComputedStyle(element, pseudoElement)
        } catch (e) {
          return null
        }
      }
    }
  })()
  return Zepto
}))