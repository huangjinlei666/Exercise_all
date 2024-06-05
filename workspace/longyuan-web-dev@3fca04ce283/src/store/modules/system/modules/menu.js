export default {
  namespaced: true,
  state: {
    aside: [],
    pathArr: [],
  },
  mutations: {
    saveAside(state, aside) {
      state.aside = aside;
    },
    savePathArr(state, pathArr) {
      state.pathArr = pathArr;
    },
  },
};
