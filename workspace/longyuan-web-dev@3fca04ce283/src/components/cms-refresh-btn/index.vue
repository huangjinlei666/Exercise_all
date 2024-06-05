<template>
  <div id="cms-refresh-btn" @click="handleBtnClick">
    <i class="el-icon-refresh-right refresh-i"></i>
  </div>
</template>
<script>
export default {
  name: 'refreshBtn',
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
  methods: {
    handleBtnClick() {
      this.$emit('handleBtnClick');
    },
  },
};
</script>
<style lang="less">
#cms-refresh-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  .refresh-i {
    color: rgba(0, 0, 0, 0.45);
  }
  &:hover {
    border: 1px solid #1890ff;
    i {
      color: rgba(0, 0, 0, 0.8);
    }
  }
}
</style>
