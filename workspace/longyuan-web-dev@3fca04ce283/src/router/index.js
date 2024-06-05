import Vue from 'vue';
import VueRouter from 'vue-router';

// 进度条
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import store from '@/store/index';
import CookieService from '@/util/CookieService';

import {
  reLogin
} from '@/plugins/axios/reLogin';
import routes, {
  needPassPathArr
} from './routes';

const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return VueRouterPush.call(this, location).catch((err) => err);
};

const VueRouterReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return VueRouterReplace.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'history',
});

/**
 * 路由拦截
 * 权限验证
 */
// router.beforeEach(async (to, from, next) => {
//   // 上一个页面未完成的请求，取消掉
//   const cancelO = store.state.system.axios.source;
//   Object.keys(cancelO).forEach((key) => {
//     cancelO[key] && cancelO[key]();
//   });
//   store.commit('system/axios/clearSource');

//   NProgress.start();

//   if (to.path !== '/login' && to.path !== '/editPwd') {
//     const token = CookieService.getCookie('Fregata-Token');
//     await reLogin(token);

//     if (token) {
//       // 左侧视图菜单
//       await store.dispatch('system/account/fetchAsideInfo').catch((error) => {
//         console.log(error);
//       });

//       let pathAllowList = store.state.system.menu.pathArr;
//       if (pathAllowList.length === 0) {
//         pathAllowList = ['/index'];
//       }
//       if (!pathAllowList.includes(to.path)) {
//         next({
//           name: 'index',
//         });
//       }

//       if (needPassPathArr.includes(to.path)) {
//         // 路由切换时，请求最新的通道列表
//         await store.dispatch('cms/pass/fetchPassInfo');
//       }
//     }
//   }

//   // 验证当前路由所有的匹配中是否需要有登录验证的
//   if (to.matched.some((r) => r.meta.auth)) {
//     // 这里暂时将cookie里是否存有token作为验证是否登录的条件
//     // 请根据自身业务需要修改
//     const token = CookieService.getCookie('Fregata-Token');
//     if (token && token !== 'undefined') {
//       next();
//     } else {
//       // 没有登录的时候跳转到登录界面
//       // 携带上登陆成功之后需要跳转的页面完整路径
//       next({
//         name: 'login',
//         query: {
//           redirect: to.fullPath,
//         },
//       });
//       NProgress.done();
//     }
//   } else {
//     // 不需要身份校验 直接通过
//     next();
//   }
// });

// router.afterEach((to) => {
//   // 进度条
//   NProgress.done();
// });

export default router;
