<template>
  <div class="atlas-identifier-element-container">
    <el-row>
      <el-col :span="14" class="text col-ellipsis">{{ name }} </el-col>
      <el-col :span="10" class="text col-ellipsis">{{ `${value} ${unit}` }} </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'AtlasIdentifierElement',
  props: {
    name: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
  },
};
</script>
<style lang="less" scoped>
.atlas-identifier-element-container {
  padding: 5px 0;
  color: rgba(0, 0, 0, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.85);
  &:last-child {
    border: none;
  }
  &.focusing {
    outline: none;
  }
  .text {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    margin: 0;
    padding: 0;
  }
}
</style>
