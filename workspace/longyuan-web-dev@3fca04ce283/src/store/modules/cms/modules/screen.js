export default {
  namespaced: true,
  state: {
    // 返回上一级的query
    farmQuery: null,
    screenMachine: {}, // 当前机组对象
  },
  mutations: {
    saveParentQuery(state, action) {
      switch (action.type) {
        case 'MACHINE':
          state.farmQuery = action.data;
          break;
        default:
          break;
      }
    },
    clearParentQuery(state) {
      state.farmQuery = null;
    },
    saveScreenMachine(state, action) {
      state.screenMachine = action.screenMachine;
    },
  },
};
