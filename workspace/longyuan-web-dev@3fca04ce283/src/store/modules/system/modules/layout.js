export default {
  namespaced: true,
  state: {
    asideCollapse: false,
  },
  mutations: {
    saveAsideCollapse(state, asideCollapse) {
      state.asideCollapse = asideCollapse;
    },
  },
};
