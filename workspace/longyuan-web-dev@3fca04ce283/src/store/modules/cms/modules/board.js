export default {
  namespaced: true,
  state: {
    machine: {}, // 当前机组对象
  },
  mutations: {
    saveMachine(state, action) {
      state.machine = action.machine;
    },
  },
};
