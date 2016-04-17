'use strict'
angular.module('LPfilters', [])
  .filter('lpTimeSpan', [function () {
    var ONE_SECOND = 1000,
      ONE_MINUTE = 60 * ONE_SECOND,
      ONE_HOUR = 60 * ONE_MINUTE,
      ONE_DAY = 24 * ONE_HOUR,
      ONE_WEEK = 7 * ONE_DAY;

    return function (num, ignores, format) {
      if (isNaN(num)) return 'Timespan must be a number.';
      var left = parseInt(num),
        vArr = {
          'week': { span: ONE_WEEK, value: undefined },
          'day': { span: ONE_DAY, value: undefined },
          'hour': { span: ONE_HOUR, value: undefined },
          'minute': { span: ONE_MINUTE, value: undefined },
          'second': { span: ONE_SECOND, value: undefined }
        }, type;
      format = format || '{week},{day},{hour},{minute},{second}'
      for (type in vArr) {
        if (_.indexOf(ignores, type) >= 0) {
          format = format.replace('{' + type + '}', '');
          continue;
        }
        vArr[type].value = Math.floor(left / vArr[type].span);
        left -= (vArr[type].value * vArr[type].span);
        format = format.replace('{' + type + '}', vArr[type].value);
      }
      return format;
    }
  }])
  ;