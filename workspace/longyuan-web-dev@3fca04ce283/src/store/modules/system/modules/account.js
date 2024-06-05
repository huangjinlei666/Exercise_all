import { AccountLogin, getUserRoles } from '@/api/system/account';
import CookieService from '@/util/CookieService';
import { extractPermission, filterAside, extractTitle, extractPath, getBrowserType } from '@/util/commonService';
import router from '@/router/index';
import menuAside from '@/menu/aside';
import { extraAllowPathArr } from '@/router/routes';

export default {
  namespaced: true,
  state: {
    info: {},
    pwdModifyTip: false,
  },
  actions: {
    login({ commit }, { username = '', password = '', timeStr = '', code = '' } = {}) {
      return new Promise((resolve, reject) => {
        // 登录
        AccountLogin({
          account: username,
          credential: password,
          randomStr: timeStr,
          code,
        })
          .then((res) => {
            const { accessToken, user } = res;
            const browserType = getBrowserType().type;
            let expireTime = 0;
            if (browserType === 'IE') {
              expireTime = 365 * 5;
            }
            CookieService.setCookie('Fregata-Token', accessToken, expireTime);
            commit('saveInfo', {
              name: user.name,
              id: user.id,
              roleName: user.roleName,
            });
            if (user.passwordUpdatedAt) {
              const timeDiff = new Date().getTime() - user.passwordUpdatedAt;
              const dayDiff = timeDiff / 1000 / 60 / 60 / 24;
              if (dayDiff >= 85) {
                commit('savePwdModifyTip', true);
              } else {
                commit('savePwdModifyTip', false);
              }
            }
            resolve(user);
          })
          .catch((err) => {
            console.log('err: ', err);
            reject(err);
          });
      });
    },
    fetchAsideInfo({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        // 获取用户权限
        getUserRoles()
          .then((res) => {
            if (!res || !res.id) {
              reject(new Error('Failed to get user permission.'));
              return;
            }
            const { permission } = res;
            if (!permission || !permission.permissions || permission.permissions.length === 0) {
              reject(new Error('Failed to get user permission.'));
              return;
            }
            const permissionArr = [];
            extractPermission(permission.permissions, permissionArr);
            if (permissionArr.toString() !== rootState.system.permission.permissionArr.toString()) {
              // 保存权限数组
              commit('system/permission/savePermissionArr', permissionArr, { root: true });
            }

            const menuAsideNew = filterAside(menuAside, permissionArr);
            const titleArrNew = [];
            extractTitle(menuAsideNew, titleArrNew);
            const menuAsideOld = rootState.system.menu.aside;
            const titleArrOld = [];
            extractTitle(menuAsideOld, titleArrOld);
            if (titleArrNew.toString() !== titleArrOld.toString()) {
              // 保存左侧菜单
              commit('system/menu/saveAside', menuAsideNew, { root: true });
            }
            let pathArr = [];
            extractPath(menuAsideNew, pathArr);
            // 组合frameOut里的允许访问url
            pathArr = pathArr.concat(extraAllowPathArr);
            if (pathArr.toString() !== rootState.system.menu.pathArr.toString()) {
              commit('system/menu/savePathArr', pathArr, { root: true });
            }
            resolve(true);
          })
          .catch((err) => {
            console.log('err: ', err);
            reject(err);
          });
      });
    },
  },
  mutations: {
    saveInfo(state, info) {
      state.info = info;
    },
    logout(state) {
      CookieService.clearLoginCookie();
      state.info = {};
      router.replace('/login');
    },
    savePwdModifyTip(state, tip) {
      state.pwdModifyTip = tip;
    },
  },
};
