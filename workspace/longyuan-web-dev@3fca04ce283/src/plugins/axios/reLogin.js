import store from '@/store/index';
import router from '@/router/index';
import {
  decodeToken
} from '@/util/commonService';
import {
  getUser
} from '@/api/modules/cms/user';

export function reLogin(token) {
  return new Promise((resolve) => {
    const decodeTokenValue = decodeToken(token);
    const subjectId = decodeTokenValue && decodeTokenValue.subjectId;
    const userInfo = store.state.system.account.info;

    if (!subjectId || !userInfo || !userInfo.id) {
      router.replace('/login');
      return resolve(true);
    }

    if (subjectId === userInfo.id) {
      return resolve(false);
    }

    store.commit('system/account/saveInfo', {
      ...userInfo,
      id: subjectId
    });

    // 查询最新用户信息
    getUser(subjectId)
      .then((res) => {
        if (!res || !res.id) {
          router.replace('/login');
          return;
        }
        store.commit('system/account/saveInfo', {
          name: res.name,
          id: res.id
        });
        router.replace(router.app.$route.query.redirect || '/');
      })
      .catch((err) => {
        console.log(`===> relogin error:${err}`);
        router.replace('/login');
      })
      .finally(() => {
        resolve(true);
      });
  });
}
