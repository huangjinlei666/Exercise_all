<template>
  <el-tooltip effect="dark" :content="$t('common.viewBoard')" placement="bottom" :open-delay="500">
    <el-button class="fe-layout-fullscreen-button" type="text" @click="bigScreen">
      <i class="fa fa-bar-chart-o" style="font-size: 16px"></i>
    </el-button>
  </el-tooltip>
</template>

<script>
import { mapState } from 'vuex';
import screenfull from 'screenfull';

export default {
  name: 'header-fullscreen',
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  methods: {
    bigScreen() {
      if (this.passList[0].type !== 'WORKSHOP') {
        this.$router.push({ name: 'index' });
        return;
      }
      this.$router.push({
        name: 'farm',
        query: {
          hierarchyId: this.passList[0].id,
          title: this.passList[0].name,
        },
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
