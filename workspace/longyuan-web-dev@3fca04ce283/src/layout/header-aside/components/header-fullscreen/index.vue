<template>
  <el-tooltip effect="dark" :content="$t('common.viewBoard')" placement="bottom" :open-delay="500">
    <el-button class="fe-layout-fullscreen-button" type="text" @click="handleToogle">
      <i class="fa fa-arrows-alt" style="font-size: 16px"></i>
    </el-button>
  </el-tooltip>
</template>

<script>
import screenfull from 'screenfull';

export default {
  name: 'header-fullscreen',
  methods: {
    handleToogle() {
      this.$router.push({
        name: 'board',
      });
      if (!screenfull.isFullscreen) {
        screenfull.request();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.fe-layout-fullscreen-button {
  float: right;
  margin: 10px 20px;
  color: @color-text-normal;
  &:hover {
    color: @color-primary;
  }
}
</style>
