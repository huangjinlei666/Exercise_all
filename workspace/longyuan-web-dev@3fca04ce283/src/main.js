/** flexible layout */
// import 'lib-flexible/flexible';

/** compatible */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

/** main dependencies */
import Vue from 'vue';
import VueLazyLoad from 'vue-lazyload';

/** plugin */
import modal from '@/plugins/modal/index';
import msg from '@/plugins/msg/index';
import api from '@/api/index';
import dateFormat from '@/plugins/dateFormat';

/** i18n */
import i18n from '@/i18n';

/** UI */
import ElementUI from 'element-ui';
import App from '@/App.vue';
// import menuAside from '@/menu/aside';
// 引用json-editor
import CodeEditor from 'bin-code-editor';
// import 'bin-code-editor/lib/style/index.css';

/** vuex */
import store from '@/store';

/** router */
import router from '@/router';

/** style */
import '@/assets/element-ui/theme/index.css';
import 'font-awesome/css/font-awesome.css';
import '@/assets/styles/animate.css';
import '@/assets/styles/element-overwrite.less';
import '@/assets/styles/index.less';

// 引用json-editor
Vue.use(CodeEditor);
Vue.use(VueLazyLoad, {
  loading: require('./assets/images/default.png'),
});
// 核心插件
const locale = i18n.messages[i18n.locale];
Vue.use(ElementUI, { locale });

// 自定义插件
Vue.use(api);
Vue.use(modal, { i18n, store, router });
Vue.use(msg);
Vue.use(dateFormat);

// 当前版本
Vue.prototype.$version = process.env.VUE_APP_VERSION;

Vue.prototype.$baseUrl = `${window.location.protocol}//${window.location.host}`;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
  created() {
    // this.$store.commit('system/menu/aside', menuAside);
  },
}).$mount('#app');
