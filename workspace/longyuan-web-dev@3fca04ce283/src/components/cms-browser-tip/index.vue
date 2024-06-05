<template>
  <div class="browser-tip-tag">
    <el-tag class="tag-item mb-5" v-if="show" type="warning" closable @close="handleClose()">{{
      $t('common.browserNotSupportTip')
    }}</el-tag>
    <el-tag
      class="tag-item"
      v-if="info && info.id && pwdModifyTip"
      type="warning"
      closable
      @close="handlePwdTagClose()"
    >
      {{ $t('common.pwdModifyTip') }}
    </el-tag>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { getBrowserType } from '@/util/commonService';

export default {
  name: 'browserTip',
  data() {
    return {
      show: false,
    };
  },
  computed: {
    ...mapState('cms/browser', ['browserTip']),
    ...mapState('system/account', ['pwdModifyTip', 'info']),
  },
  mounted() {
    this.judgeShow(this.browserTip);
  },
  watch: {
    browserTip: {
      handler(value) {
        this.judgeShow(value);
      },
    },
  },
  methods: {
    ...mapMutations({
      saveBrowserTip: 'cms/browser/saveBrowserTip',
    }),
    ...mapMutations('system/account', ['savePwdModifyTip']),
    judgeShow(browserTip) {
      const { type: browserType, version: browserVersion } = getBrowserType();
      let showTag = false;
      if (browserType === 'Chrome' && browserVersion < 63) {
        showTag = true;
      }
      if (browserType === 'Firefox' && browserVersion < 47) {
        showTag = true;
      }
      if (browserType === 'IE' && browserVersion < 11) {
        showTag = true;
      }
      if (browserTip && showTag) {
        this.show = true;
      } else {
        this.show = false;
      }
    },
    handleClose() {
      this.saveBrowserTip(false);
    },
    handlePwdTagClose() {
      this.savePwdModifyTip(false);
    },
  },
};
</script>
<style lang="less" scoped>
.browser-tip-tag {
  width: calc(100% - 20px);
  position: absolute;
  top: 5px;
  left: 10px;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  z-index: 100000;
  .tag-item {
    display: block;
  }
}
</style>
