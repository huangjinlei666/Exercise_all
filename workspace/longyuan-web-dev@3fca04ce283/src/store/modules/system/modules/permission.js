export default {
  namespaced: true,
  state: {
    permissionArr: [], // 权限数组
  },
  mutations: {
    savePermissionArr(state, permissionArr) {
      state.permissionArr = permissionArr;
    },
  },
};
