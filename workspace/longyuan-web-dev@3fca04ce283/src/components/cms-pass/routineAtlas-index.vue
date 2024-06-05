<template>
  <div id="pass-wrapper" class="cms-card">
    <Pass4 />
    <div class="pass-tips">
      <div v-for="tip in tipList" :key="tip" class="tips">
        <i :class="[`node-${tip}`, 'node-circle']"></i>
        <span class="node-label">{{ $t(`common.${tip}`) }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapMutations } from 'vuex';
import Pass4 from './index4.vue';

export default {
  components: { Pass4 },
  data() {
    return {
      tipList: ['OK', 'ATTENTION', 'ERROR', 'OFFLINE'],
    };
  },
  mounted() {
    this.savePassInit();
  },
  beforeDestroy() {
    this.savePassInit();
  },
  methods: {
    ...mapMutations('cms/pass', ['savePassInit']),
  },
};
</script>

<style lang="less" scoped>
#pass-wrapper {
  position: relative;
  height: calc(65% - 10px);
  overflow: auto;
  padding: 0px;
  user-select: none;
  background-color: #07172d;
  margin-bottom: 10px;
  .pass-tips {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    box-sizing: border-box;
    height: 56px;
    padding: 10px 14px;
    overflow: hidden;
    border-radius: 2px;
    z-index: 99;
    .tips {
      display: inline-block;
      text-align: center;
      width: 50%;
      .node-circle {
        display: inline-block;
        vertical-align: middle;
        width: 6px;
        height: 6px;
        border: none;
        border-radius: 50%;
        background-color: @color-ok;
        padding: 0 !important;
        margin-right: 2px;
      }
      .node-OFFLINE {
        background-color: @color-info;
      }
      .node-OK {
        background-color: @color-ok;
      }
      .node-ATTENTION {
        background-color: @color-attention;
      }
      .node-ERROR {
        background-color: @color-error;
      }
      .node-WARN {
        background-color: @color-warn;
      }
      .node-EMERGENCY {
        background-color: @color-emergency;
      }
      .node-label {
        font-size: 12px;
        vertical-align: middle;
        display: inline-block;
        max-width: 115px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.85);
        line-height: 18px;
      }
    }
  }
}
</style>
