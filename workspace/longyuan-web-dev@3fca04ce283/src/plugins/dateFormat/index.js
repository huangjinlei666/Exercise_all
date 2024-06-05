export default {
  install(Vue) {
    Vue.prototype.$dateFormat = {
      lang: Vue.prototype._i18n.locale,
      formatLocalDateTime(value, type) {
        if (!value) {
          return '--';
        }
        if (!/^\d+$/.test(value)) {
          value = parseInt(value, 10);
        }
        let timestamp = value;
        if (`${timestamp}`.length === 10) {
          timestamp = value * 1000;
        }
        let result = '';
        if (this.lang === 'zh-CN') {
          result = this.formatZhDateTime(timestamp, type);
        } else if (this.lang === 'en') {
          result = this.formatEnDateTime(timestamp, type);
        }
        return result;
      },
      formatZhDateTime(timestamp, type) {
        let suffix = '';
        const timeStr = `${timestamp}`;
        if (timeStr.length > 10) {
          timestamp = parseInt(timeStr.slice(0, 10), 10) * 1000;
          suffix = timeStr.slice(10);
        }
        let res = '';
        const dateTime = new Date(timestamp);
        const year = dateTime.getFullYear();
        const month = this.formatSingleNumber(dateTime.getMonth() + 1);
        const day = this.formatSingleNumber(dateTime.getDate());
        const hour = this.formatSingleNumber(dateTime.getHours());
        const minute = this.formatSingleNumber(dateTime.getMinutes());
        const second = this.formatSingleNumber(dateTime.getSeconds());
        if (type === 'date') {
          res = `${year}-${month}-${day}`;
        } else if (type === 'time') {
          res = `${hour}:${minute}:${second}`;
        } else if (type === 'datetime') {
          res = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        } else if (type === 'datetime\n') {
          res = `${hour}:${minute}:${second}\n${year}-${month}-${day}`;
        } else if (type === 'full') {
          res = `${year}-${month}-${day} ${hour}:${minute}:${second} ${this.getZoneSuffix(dateTime)}`;
        } else if (type === 'ms') {
          res = `${year}-${month}-${day} ${hour}:${minute}:${second}${suffix ? `.${suffix}` : ''}`;
        } else if (type === 'ms\n') {
          res = `${hour}:${minute}:${second}${suffix ? `.${suffix}` : ''}\n${year}-${month}-${day}`;
        } else {
          res = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        }
        return res;
      },
      formatEnDateTime(timestamp, type) {
        let suffix = '';
        const timeStr = `${timestamp}`;
        if (timeStr.length > 10) {
          timestamp = parseInt(timeStr.slice(0, 10), 10) * 1000;
          suffix = timeStr.slice(10);
        }
        let res = '';
        const monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Spt', 'Oct', 'Nov', 'Dec'];
        const dateTime = new Date(timestamp);
        const year = dateTime.getFullYear();
        const month = monthArr[dateTime.getMonth()];
        const day = this.formatSingleNumber(dateTime.getDate());
        const hour = this.formatSingleNumber(dateTime.getHours());
        const minute = this.formatSingleNumber(dateTime.getMinutes());
        const second = this.formatSingleNumber(dateTime.getSeconds());
        if (type === 'date') {
          res = `${month} ${day}, ${year}`;
        } else if (type === 'time') {
          res = `${hour}:${minute}:${second}`;
        } else if (type === 'datetime') {
          res = `${month} ${day}, ${year} ${hour}:${minute}:${second}`;
        } else if (type === 'datetime\n') {
          res = `${hour}:${minute}:${second}\n${month} ${day}, ${year}`;
        } else if (type === 'full') {
          res = `${month} ${day}, ${year} ${hour}:${minute}:${second} ${this.getZoneSuffix(dateTime)}`;
        } else if (type === 'ms') {
          res = `${month} ${day}, ${year} ${hour}:${minute}:${second}${suffix ? `.${suffix}` : ''}`;
        } else if (type === 'ms\n') {
          res = `${hour}:${minute}:${second}${suffix ? `.${suffix}` : ''}\n${month} ${day}, ${year}`;
        } else {
          res = `${month} ${day}, ${year} ${hour}:${minute}:${second}`;
        }
        return res;
      },
      formatSingleNumber(value) {
        return value < 10 ? `0${value}` : value;
      },
      getZoneSuffix(dateTime) {
        const offset = -(dateTime.getTimezoneOffset() / 60);
        const symbol = offset >= 0 ? '+' : '-';
        const timeOffset = this.formatSingleNumber(offset);
        return `GMT${symbol}${timeOffset}:00`;
      },
    };
  },
};
