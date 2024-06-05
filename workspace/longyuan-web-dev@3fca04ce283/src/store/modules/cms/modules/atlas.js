export default {
  namespaced: true,
  state: {
    refreshTime: 3, // 图谱刷新时间
    globalFigurePrecision: 2, // 总貌图小数点位数
  },
  mutations: {
    saveRefreshTime(state, time) {
      if (!time && time !== 0) {
        time = 3;
      }
      state.refreshTime = time;
    },
    saveGlobalFigurePrecision(state, precision) {
      if (!precision && precision !== 0) {
        precision = 2;
      }
      state.globalFigurePrecision = precision;
    },
  },
};
