import { mapState } from 'vuex';
import debounce from 'lodash/debounce';

export default {
  data() {
    return {
      windowResize: false,
    };
  },
  computed: {
    ...mapState('system/layout', ['asideCollapse']),
    ...mapState('cms/pass', ['passCollapse']),
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize, false);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.onWindowResize = () => {};
  },
  watch: {
    asideCollapse() {
      this.onWindowResize();
    },
    passCollapse() {
      this.onWindowResize();
    },
  },
  methods: {
    onWindowResize: debounce(
      function onWindowResize() {
        this.windowResize = !this.windowResize;
      },
      300,
      { leading: false, trailing: true }
    ),
    replaceParam(requestParamArr, searchParam) {
      let idx = null;
      requestParamArr.every((r, index) => {
        if (r.sensorId === searchParam.sensorId) {
          idx = index;
          return false;
        }
        return true;
      });
      if (idx !== null) {
        requestParamArr.splice(idx, 1, searchParam);
      }
    },
    computedScreenNumber(str) {
      const o = {
        0: 5, // 最多5个请求参数
        1: 1,
        '2-hor': 2,
        '2-ver': 2,
        4: 4,
      };
      return o[str];
    },
    // 图谱请求参数处理
    handleInputParams(searchParam, screenNumber, arr) {
      // 过滤掉无用参数或默认参数
      let requestParamArr = arr.filter((item) => item.sensorId && item.dataType);
      if (!searchParam || !searchParam.sensorId) {
        return requestParamArr;
      }
      // 如果参数列表为空，则直接添加
      if (requestParamArr.length === 0) {
        requestParamArr.push(searchParam);
        return requestParamArr;
      }
      // 最新参数是否包含在现有参数列表中
      const noSameParam = !requestParamArr.some((i) => i.sensorId === searchParam.sensorId);
      // 计算屏幕分屏数
      const number = this.computedScreenNumber(screenNumber);
      // 如果请求参数列表长度大于分屏数，则裁剪
      if (requestParamArr.length > number) {
        requestParamArr = requestParamArr.splice(requestParamArr.length - number);
        const currentParam = requestParamArr.find((i) => i.sensorId === searchParam.sensorId);
        if (!currentParam) {
          requestParamArr.shift();
          requestParamArr.unshift(searchParam);
        }
      }
      if (noSameParam) {
        // 最新请求参数与当前参数列表里的元素均不相同时
        if (requestParamArr.length === number) {
          // 弹出栈首参数
          requestParamArr.shift();
        }
        // 栈尾压入最新参数
        requestParamArr.push(searchParam);
      } else {
        // 替换最新参数
        this.replaceParam(requestParamArr, searchParam);
      }
      return requestParamArr;
    },
  },
};
