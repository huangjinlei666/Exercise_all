<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
import CookieService from '@/util/CookieService';
import { getMetaContent } from '@/util/commonService';

export default {
  name: 'app',
  watch: {
    '$i18n.locale': 'i18nHandle',
  },
  created() {
    this.i18nHandle(this.$i18n.locale);
  },
  methods: {
    i18nHandle(val, oldVal) {
      CookieService.setCookie('Fregata-Lang', val);
      document.querySelector('html').setAttribute('lang', val);
    },
    changeFavicon() {
      const mode = getMetaContent('logo-mode');
      const link = `/${mode === 'official' ? 'official.png' : 'favicon.ico'}`;
      const icon1 = document.querySelector('link[rel="shortcut icon"]');
      const icon2 = document.querySelector('link[rel="icon"]');
      icon1 && (icon1.href = link);
      icon2 && (icon2.href = link);
    },
  },
  mounted() {
    this.changeFavicon();
    // 找到加载动画的id，并删除
    const $loadingEl = document.getElementById('cms-main__loading');
    if ($loadingEl) {
      document.body.removeChild($loadingEl);
    }
  },
};
</script>
<style lang="less">
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
