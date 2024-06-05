export default {
  namespaced: true,
  state: {
    browserTip: true, // 是否显示低版本浏览器提示
  },
  mutations: {
    saveBrowserTip(state, tip) {
      state.browserTip = tip;
    },
  },
};
