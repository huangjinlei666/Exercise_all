<template>
  <div v-if="show" class="d2-source" :class="{ 'd2-source--active': isActive }" @click="handleClick">
    <i class="fa fa-code" />本页源码
  </div>
</template>

<script>
import last from 'lodash/last';
import get from 'lodash/get';

export default {
  name: 'd2Source',
  data() {
    return {
      isActive: false,
      path: '',
    };
  },
  computed: {
    show() {
      return process.env.VUE_APP_SCOURCE_LINK === 'TRUE';
    },
  },
  watch: {
    $route: {
      handler(to) {
        this.path = get(last(to.matched), 'components.default.__source');
      },
      immediate: true,
    },
  },
  mounted() {
    // 一秒后显示按钮
    setTimeout(() => {
      this.isActive = true;
    }, 500);
  },
  methods: {
    // 点击按钮的时候跳转到源代码
    handleClick() {
      this.$open(`${process.env.VUE_APP_REPO}/blob/master/${this.path}`);
    },
  },
};
</script>

<style lang="less" scoped>
.d2-source {
  @borderRadius: 4px;
  @paddingLR: 15px;
  @paddingTB: 7px;
  @fontSize: 12px;
  @rightOuter: @paddingLR / 2;
  opacity: 0;
  position: fixed;
  z-index: 9999;
  right: -@borderRadius - @rightOuter;
  bottom: 20px;
  font-size: @fontSize;
  line-height: @fontSize;
  font-weight: bold;
  border-radius: @borderRadius;
  padding: @paddingTB @paddingLR;
  padding-right: @borderRadius + @paddingLR;
  background-color: rgba(#000, 0.7);
  border: 1px solid #000;
  color: #fff;
  transition: all 0.3s;
  user-select: none;
  cursor: pointer;
  &.d2-source--active {
    opacity: 1;
  }
  &:hover {
    right: -@borderRadius;
    background-color: rgba(#000, 0.9);
  }
}
</style>
