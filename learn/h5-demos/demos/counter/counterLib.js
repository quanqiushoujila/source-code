
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD环境中
    define(function () {
      return factory(global);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    // CMD环境中
    module.exports = factory(global);
  } else {
    // 浏览器环境，添加到global中
    global.getDateInstance = factory(global);
  }
}(typeof window !== 'undefined' ? window : this, function(window) {
  //  没有考虑市区差值

  // 实例化返回值
  var getDateInstance = null;

  var options = {
    'data' : '2017-01-12 18:50:54',
    'msg' : '距离开始时间',
    'el':'class',
  }
  function GetDate(opt) {
    this.data = opt.data;
    this.msg = opt.msg;
    this.el = opt.el;
    this.conversionTime();
    this.txtMsg();
  }
  GetDate.prototype.conversionTime = function() {
    // 接受传递过来的参数
    var future = new Date(this.data);
    // console.log(future.getTime());
    var now = new Date();
    var dur = Math.round((future.getTime() - now.getTime()) / 1000) ;
    // console.log(dur);

    var pms = {
      sec: '00',
      mini: '00',
      hour: '00',
      day: '00',
      month: '00',
      year: '0',
    };
    if (dur > 0) {
      // 秒数
      pms.sec = this.checkTime(dur % 60);
      // 分钟数
      pms.mini = Math.floor((dur / 60)) > 0 ? this.checkTime(Math.floor((dur / 60)) % 60) : '00';
      // 时间数
      pms.hour = Math.floor((dur / 3600)) > 0 ? this.checkTime(Math.floor((dur / 3600)) % 24) : '00';
      // 日期说
      pms.day = Math.floor((dur / 86400)) > 0 ? this.checkTime(Math.floor((dur / 86400)) % 30) : '00';
      // 月份，以实际平均每月秒数计算
      pms.month = Math.floor((dur / 2629744)) > 0 ? this.checkTime(Math.floor((dur / 2629744)) % 12) : '00';
      // 年份，按按回归年365天5时48分46秒算
      pms.year = Math.floor((dur / 31556926)) > 0 ? Math.floor((dur / 31556926)) : '0';
    } else {
      window.clearTimeout();
    }
    this.conversionMsg(pms);

    setTimeout(function () {
      var self = this;
      self.conversionTime();
      // self.conversionMsg(pms);
    }.bind(this), 1000);
  }
  GetDate.prototype.checkTime = function (e) {
    var n = parseInt(e, 10);
    if (n > 0) {
      if (n <= 9) {
        n = '0' + n;
      }
      return String(n);
    } else {
      return '00';
    }
  }
  GetDate.prototype.conversionMsg = function(e) {
    // console.log(e);
    var year = typeof (e.year) !== 'undefined' ? '<span>' + e.year + '</span><i>年</i>' : 0;
    var month = typeof (e.month) !== 'undefined' ? '<span>' + e.month + '</span><i>月</i>' : 0;
    var day = typeof (e.day) !== 'undefined' ? '<span>' + e.day + '</span><i>日</i>' : 0;
    var hour = typeof (e.hour) !== 'undefined' ? '<span>' + e.hour + '</span><i>时</i>' : 0;
    var mini = typeof (e.mini) !== 'undefined' ? '<span>' + e.mini + '</span><i>分</i>' : 0;
    var sec = typeof (e.sec) !== 'undefined' ? '<span>' + e.sec + '</span>' : 0;
    document.getElementById('counterId').innerHTML= (year + month + day + hour + mini + sec);
  }

  GetDate.prototype.txtMsg = function () {
    document.getElementById('TxtId').innerHTML = this.msg;
  };

  if (!getDateInstance) {
    getDateInstance = new GetDate(options);
    return getDateInstance;
  }
}))
