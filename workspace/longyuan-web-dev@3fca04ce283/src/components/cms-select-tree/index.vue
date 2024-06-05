<template>
  <el-select :class="widthClass" :placeholder="placeholder" v-model="id" @visible-change="visibleChange">
    <el-option id="select-tree" :value="id" :label="name" style="height: auto">
      <el-tree
        ref="selectTree"
        id="cms-select-tree"
        :data="list"
        node-key="value"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :highlight-current="true"
        :indent="10"
        @node-click="handleNodeClick"
        icon-class="el-icon-arrow-right"
      >
        <span slot-scope="{ data }">
          <span>
            <i v-if="!data.isLeaf" class="fa fa-folder color-warn vertical-middle" aria-hidden="true"></i>
            <i v-if="data.isLeaf" class="fa fa-thumb-tack isLeaf vertical-middle" aria-hidden="true"></i>
            <span class="node-label">{{ data.label }}</span>
          </span>
        </span>
      </el-tree>
    </el-option>
  </el-select>
</template>
<script>
import { getBrowserType } from '@/util/commonService';

export default {
  name: 'CmsSelectTree',
  props: {
    widthClass: {
      type: String,
      default: 'width-163',
    },
    list: {
      type: Array,
      default: () => [],
    },
    displayId: {
      type: String,
      default: '',
    },
    displayName: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      id: '',
      name: '',
    };
  },
  watch: {
    displayId(val) {
      this.id = val;
      this.$refs.selectTree.setCurrentKey(val);
    },
    displayName(val) {
      this.name = val;
    },
  },
  methods: {
    visibleChange(isVisible) {
      const isEdge = getBrowserType().type;
      if (isEdge === 'Edge' && !isVisible) {
        document.querySelectorAll('body > .el-select-dropdown.el-popper').forEach((it) => it.remove());
      }
    },
    handleNodeClick(data) {
      if (!data.value) return;
      this.id = data.value;
      this.name = data.name;
      this.$emit('selectChange', this.id, this.name);
    },
  },
};
</script>
<style lang="less">
#cms-select-tree {
  .node-label {
    font-size: 12px;
    vertical-align: middle;
    display: inline-block;
    max-width: 115px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: normal;
  }
  &.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    .isLeaf {
      color: #1890ff !important;
    }
    .isLeaf + .node-label {
      background-color: #e6f7ff !important;
      color: #1890ff !important;
    }
  }
}
#select-tree {
  padding: 0;
  background-color: #fff;
}
</style>
