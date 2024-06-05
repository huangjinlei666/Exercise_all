<template>
  <div id="big-screen">
    <div class="header-box clearfix">
      <div class="logo-box">
        <img v-if="logoSrc" class="cms-logo" :src="logoSrc" />
        <span v-if="!logoSrc" class="cms-logo-title">{{ $t('title') }}</span>
      </div>
      <span class="exit-text pull-right mr-20" @click="signOut">
        <i class="fa fa-sign-out"></i>
        {{ $t('common.exit') }}
      </span>
    </div>
    <div class="screen-box">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import screenfull from 'screenfull';
import { getMetaContent } from '@/util/commonService';

export default {
  name: 'big-screen',
  computed: {
    ...mapState('system/account', ['info']),
    logoSrc() {
      const mode = getMetaContent('logo-mode');
      if (mode === 'official') {
        return `${this.$baseUrl}/images/logo-white.png`;
      }
      return null;
    },
  },
  beforeDestroy() {
    this.clearParentQuery();
  },
  methods: {
    ...mapMutations('cms/screen', ['clearParentQuery']),
    signOut() {
      this.$router.push({ name: 'index' });
      if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    },
  },
};
</script>>
<style lang="less">
#big-screen {
  width: 100%;
  height: 100%;
  background-color: #060d1d;
  position: relative;
  .header-box {
    width: 100%;
    height: 60px;
    background-color: #071830;
    .logo-box {
      float: left;
      margin-left: 20px;
      height: 60px;
      box-sizing: border-box;
    }
    .cms-logo {
      height: 50px !important;
      vertical-align: middle;
    }
    .cms-logo-title {
      font-size: 20px;
      font-weight: 500;
      color: #ffffff;
      line-height: 60px;
      letter-spacing: 1px;
    }
    .exit-text {
      display: inline-block;
      height: 60px;
      color: #ffffff;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .screen-box {
    position: relative;
    width: 100%;
    height: calc(100% - 60px);
  }
}
</style>
