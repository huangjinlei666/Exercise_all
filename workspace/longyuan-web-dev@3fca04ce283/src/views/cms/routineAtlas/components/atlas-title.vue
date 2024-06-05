<template>
  <div class="atlas-title">
    <img src="../../../../assets/images/screen/icon-title.png" alt />
    <span class="title-text">{{ title }}</span>
  </div>
</template>

<script>
export default {
  name: 'AtlasTitle',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>
.atlas-title {
  height: 20px;
  margin-bottom: 10px;
  .title-text {
    font-size: 16px;
    line-height: 20px;
    font-weight: bold;
    text-align: left;
    vertical-align: top;
    color: rgba(255, 255, 255, 0.85);
  }
}
</style>
