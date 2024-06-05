<template>
  <span class="atlas-button" :class="{ disabled: disabled, select: isSelect }" @click="handleClick">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'AtlasButton',
  props: {
    isSelect: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      if (this.disabled) return;
      this.$emit('click');
    },
  },
};
</script>

<style lang="less" scoped>
.atlas-button {
  display: inline-block;
  cursor: pointer;
  background-color: #0d334b;
  border: 1px solid rgba(71, 218, 255, 0.2);
  color: #fff;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  padding: 6px 15px;
  font-size: 12px;
  line-height: 14px;
  border-radius: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  &:hover {
    background-color: #00d1ea;
    border-color: #00d1ea;
  }
}
.select {
  background-color: #00d1ea;
  border-color: #00d1ea;
}
.disabled {
  background-color: #999a9a !important;
  border-color: #999a9a !important;
  &:hover {
    cursor: not-allowed !important;
  }
}
</style>
