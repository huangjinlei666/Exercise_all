export default {
  namespaced: true,
  state: {
    source: {},
  },
  mutations: {
    saveSource(state, src) {
      if (!src) return;
      const { key, cancel } = src;
      if (!key || !cancel) return;
      state.source[key] = cancel;
    },
    clearSource(state) {
      state.source = {};
    },
  },
};
