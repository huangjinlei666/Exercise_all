<template>
  <div id="pass-wrapper" class="cms-card">
    <component :is="com"></component>
    <div v-show="!passCollapse" class="pass-tips">
      <div v-for="tip in tipList" :key="tip" class="tips">
        <i :class="[`node-${tip}`, 'node-circle']"></i>
        <span class="node-label">{{ $t(`common.${tip}`) }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex';
import pass0 from './index0.vue';
import pass1 from './index1.vue';
import pass2 from './index2.vue';
import pass3 from './index3.vue';
import pass6 from './index6.vue';

export default {
  components: { pass0, pass1, pass2, pass3, pass6 },
  data() {
    return {
      com: 'pass0',
      tipList: ['OK', 'ATTENTION', 'ERROR', 'OFFLINE'],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passCollapse']),
  },
  mounted() {
    this.savePassInit();
  },
  beforeDestroy() {
    this.savePassInit();
  },
  watch: {
    '$route.path': {
      handler(val) {
        if (val === '/projectSet') {
          // 传感器异步加载
          this.com = 'pass1';
        } else if (val === '/history') {
          // 传感器异步加载，选择框
          this.com = 'pass2';
        } else if (val === '/strategySend') {
          // 设备信息（主控板、采集板、传感器）异步加载
          this.com = 'pass3';
        } else if (val === '/device') {
          // 生命周期
          this.com = 'pass6';
        } else {
          // 最原始的，没有传感器异步加载，没有设备信息异步加载，没有选择框，没有宽度变化
          this.com = 'pass0';
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations('cms/pass', ['savePassInit']),
  },
};
</script>

<style lang="less" scoped>
#pass-wrapper {
  position: relative;
  height: 100%;
  overflow: auto;
  padding: 0px;
  user-select: none;
  .pass-tips {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    box-sizing: border-box;
    height: 56px;
    padding: 10px 14px;
    overflow: hidden;
    background: #fafafa;
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
        color: rgba(0, 0, 0, 0.45);
        line-height: 18px;
      }
    }
  }
}
</style>
