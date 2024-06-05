import axios from 'axios';
import CookieService from '@/util/CookieService';
import router from '@/router/index';
import store from '@/store';
import {
  reLogin
} from './reLogin';

const CancelToken = axios.CancelToken;

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 30 * 60 * 1000,
  headers: {
    'Content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-cache',
    Pragma: 'no-cache',
  },
});

// 请求拦截器
service.interceptors.request.use(
  // async (config) => {
  //     // 在store中保存该http请求的取消方法
  //     config.cancelToken = new CancelToken((cancel) => {
  //       const key = `${config.url}&${config.method}`;
  //       store.commit('system/axios/saveSource', {
  //         key,
  //         cancel
  //       });
  //     });

  //     if (config.url.indexOf('login') === -1 && config.url.indexOf('public/code') === -1 && config.url.indexOf('users/modify_credential') === -1) {
  //       // 在请求发送之前做一些处理
  //       const token = CookieService.getCookie('Fregata-Token');
  //       if (!token) {
  //         config.url = '';
  //         window.location.href = `${window.location.protocol}//${window.location.host}/login`;
  //       }
  //       await reLogin(token).then((flag) => {
  //         if (flag) {
  //           config.url = '';
  //         }
  //       });
  //       // 让每个请求携带token-- ['Authorization']为自定义key 请根据实际情况自行修改
  //       config.headers.Authorization = token;
  //     }
  //     if (
  //       config.url.includes('/reports/analysis') ||
  //       config.url.includes('/reports/machineReport/download') ||
  //       config.url.includes('/reports/farmReport/download')
  //     ) {
  //       config.headers['Content-type'] = 'application/x-download';
  //       config.responseType = 'blob';
  //     }
  //     return config;
  //   },
  //   (error) => {
  //     console.log(error);
  //     return Promise.reject(error);
  //   }
);

// 响应拦截器
// service.interceptors.response.use(
//   (response) => {
//     // 如果请求顺利返回了，则要清除store中保存的这个方法的取消方法
//     const key = `${response.config.url}&${response.config.method}`;
//     const cancelO = store.state.system.axios.source;
//     if (cancelO[key]) {
//       delete cancelO[key];
//     }

//     if (
//       response &&
//       response.config &&
//       response.config.url &&
//       (response.config.url.includes('/reports/analysis') ||
//         response.config.url.includes('/reports/machineReport/download') ||
//         response.config.url.includes('/reports/farmReport/download'))
//     ) {
//       return response;
//     }

//     // dataAxios 是 axios 返回数据中的 data
//     const dataAxios = response.data;

//     // 这个状态码是和后端约定的
//     const { code } = dataAxios;
//     // 根据 code 进行判断
//     if (code === undefined) {
//       return dataAxios;
//     }
//     switch (code) {
//       case 0:
//         return dataAxios.data;
//       case 'xxx':
//         console.log(`[ code: xxx ] ${dataAxios.msg}: ${response.config.url}`);
//         break;
//       default:
//         console.log(`${dataAxios.msg}: ${response.config.url}`);
//         break;
//     }
//   },
//   (error) => {
//     if (error && error.response) {
//       if (error.response.data) {
//         const { errorCode, errorMessage } = error.response.data;
//         if (errorCode === 1060109 || errorMessage === 'Invalid token') {
//           // token 无效，返回登录页面
//           router.replace('/login');
//         }
//         return Promise.reject(error.response.data);
//       }
//       switch (error.response.status) {
//         case 400:
//           error.message = '请求错误';
//           break;
//         case 401:
//           error.message = '未授权，请登录';
//           break;
//         case 403:
//           error.message = '拒绝访问';
//           break;
//         case 404:
//           error.message = `请求地址出错: ${error.response.config.url}`;
//           break;
//         case 408:
//           error.message = '请求超时';
//           break;
//         case 500:
//           error.message = '服务器内部错误';
//           break;
//         case 501:
//           error.message = '服务未实现';
//           break;
//         case 502:
//           error.message = '网关错误';
//           break;
//         case 503:
//           error.message = '服务不可用';
//           break;
//         case 504:
//           error.message = '网关超时';
//           break;
//         case 505:
//           error.message = 'HTTP版本不受支持';
//           break;
//         default:
//           break;
//       }
//       return Promise.reject(error);
//     }
//   }
// );

export default service;
