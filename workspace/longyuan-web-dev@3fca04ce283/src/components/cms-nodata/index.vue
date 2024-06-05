<template>
  <div id="cms-nodata">
    <img src="./nodata.svg" alt />
    <span class="message d2-ml-20">{{ message || initialMag }}</span>
  </div>
</template>
<script>
export default {
  name: 'cmsNodata',
  props: {
    message: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      initialMag: this.$t('common.nodata'),
    };
  },
};
</script>
<style lang="less" scoped>
#cms-nodata {
  height: 152px;
  text-align: center;
  img {
    height: 100px;
    vertical-align: middle;
  }
  .message {
    line-height: 152px;
    color: #909399;
  }
}
</style>
