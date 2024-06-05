<template>
  <div class="fe-aside-logo">
    <!-- <img
      v-if="asideCollapse"
      src="/images/logo_white2.png"
      alt="logo"
      class="fe-aside-logo-img animated fadeInRight"
    /> -->
    <img v-if="logoSrc" :src="logoSrc" alt="logo" class="fe-aside-logo--img animated fadeInLeft" />
    <span v-if="!logoSrc" class="fe-aside-logo--title">{{ $t('title') }}</span>
  </div>
</template>

<script>
// import { mapState } from 'vuex';
import { getMetaContent } from '@/util/commonService';

export default {
  name: 'header-logo',
  computed: {
    // ...mapState('system/layout', ['asideCollapse']),
    logoSrc() {
      const mode = getMetaContent('logo-mode');
      if (mode === 'official') {
        return `${this.$baseUrl}/images/logo.png`;
      }
      // 演示展示西人马logo
      if (mode === 'exhibition') {
        return `${this.$baseUrl}/images/logo0.png`;
      }
      // 其他情况不展示logo
      return null;
    },
  },
};
</script>
<style lang="less" scoped>
.fe-aside-logo {
  float: left;
  padding: 5px 15px 5px 20px;
  height: 60px;
  background-color: #fff;
  box-sizing: border-box;
  transition: all 0.3s;
  font-size: 0;
  .fe-aside-logo--img {
    height: 50px;
    vertical-align: middle;
  }
  .fe-aside-logo--title {
    font-size: 22px;
    line-height: 50px;
    font-weight: bold;
    color: @color-text-main;
    vertical-align: middle;
  }
}
</style>
