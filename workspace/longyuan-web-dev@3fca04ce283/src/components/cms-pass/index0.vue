<template>
  <div id="cms-pass0">
    <!-- 树形结构 -->
    <d2-container better-scroll v-show="!passCollapse" v-loading="passLoading">
      <el-tree
        ref="tree"
        :data="passList"
        :props="defaultProps"
        node-key="id"
        @node-click="handleNodeClick"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :highlight-current="true"
        :indent="10"
        icon-class="el-icon-arrow-right"
      >
        <span slot-scope="{ data }">
          <span>
            <i :class="['node-' + (data.networkStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'), 'node-circle']"></i>
            <span class="node-label" :title="data.name">{{ data.name }}</span>
          </span>
        </span>
      </el-tree>
    </d2-container>
    <!-- 头部元素 -->
    <div class="clearfix pass-top">
      <!-- 缩进切换按钮 -->
      <div class="toggle-aside-btn d2-pt-5 inline-block d2-mr-5" flex-box="0" @click="handleToggleIndent">
        <i v-if="passCollapse" class="el-icon-d-arrow-right cursor"></i>
        <i v-if="!passCollapse" class="el-icon-d-arrow-left cursor"></i>
      </div>
      <!-- 标题 -->
      <div v-if="!passCollapse" class="pass-title inline-block">{{ $t('pass.passInfo') }}</div>
      <div class="pull-right" v-if="!passCollapse && this.passRootId" @click="handlePassAdd">
        <el-tooltip effect="dark" :content="$t('projectSet.addProject')" placement="top" :open-delay="500">
          <i class="el-icon-plus cursor d2-mt-5"></i>
        </el-tooltip>
      </div>
      <div v-if="passCollapse && this.passRootId" @click="handlePassAdd">
        <el-tooltip effect="dark" :content="$t('projectSet.addProject')" placement="left" :open-delay="500">
          <i class="el-icon-plus cursor d2-mt-5"></i>
        </el-tooltip>
      </div>
      <!-- 缩进后的popover -->
      <el-popover
        v-if="passCollapse"
        placement="right-start"
        :title="$t('pass.passInfo')"
        width="200"
        trigger="hover"
        @after-enter="afterPopoverEnter"
        @hide="popoverHide"
      >
        <div id="popTree">
          <el-tree
            ref="tree0"
            :data="passList"
            :props="defaultProps"
            node-key="id"
            @node-click="handleNodeClick"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :highlight-current="true"
            :indent="10"
            icon-class="el-icon-arrow-right"
          >
            <span slot-scope="{ data }">
              <span>
                <i :class="['node-' + (data.networkStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'), 'node-circle']"></i>
                <span class="node-label" :title="data.name">{{ data.name }}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <div slot="reference" class="popover-pass-title cursor">{{ $t('pass.passInfo') }}</div>
      </el-popover>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import passAddModal from '@/views/cms/projectSet/passAddModal';
import d2Container from '../d2-container/index';

export default {
  name: 'cmsPass0',
  components: { d2Container },
  data() {
    return {
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
      },
      selectedNodeKey: '',
    };
  },
  computed: {
    ...mapState('cms/pass', ['passLoading', 'passList', 'passRootId', 'passCollapse', 'hierarchy', 'reverseHierarchy']),
  },
  mounted() {
    if (this.hierarchy && this.hierarchy.id && this.passList && this.passList.length) {
      this.selectedNodeKey = this.hierarchy.id;
      this.resetSelectedNodeKey(this.passList);
      return;
    }
    this.selectedNodeKey = this.passList[0].id;
    this.resetSelectedNodeKey(this.passList);
    this.saveMachine({ machine: {} });
  },
  beforeDestroy() {
    if (!this.$route.path.includes('index') && !this.$route.path.includes('board')) {
      this.saveMachine({ machine: {} });
    }
  },
  watch: {
    passList: {
      handler(val) {
        // 通道列表刷新时，如果刷新前的key还存在，则需要重新设置选中的key
        if (!val || val.length === 0) {
          this.selectedNodeKey = '';
          return;
        }
        this.resetSelectedNodeKey(val);
      },
    },
    reverseHierarchy: {
      handler(val) {
        if (!val || !val.machineId) {
          return;
        }
        const currentKey = this.$refs.tree.getCurrentKey();
        if (val.machineId === currentKey) {
          return;
        }
        this.processReverseHierarchy(val.machineId);
      },
    },
  },
  methods: {
    ...mapMutations({
      saveBreadCrumb: 'cms/pass/saveBreadCrumb',
      saveHierarchy: 'cms/pass/saveHierarchy',
      saveSensorRectClick: 'cms/pass/saveSensorRectClick',
      savePassCollapse: 'cms/pass/savePassCollapse',
      saveMachine: 'cms/board/saveMachine',
    }),
    resetSelectedNodeKey(val) {
      if (!this.selectedNodeKey) {
        return;
      }
      const keyData = this.extractCurrentNodeData(val, this.selectedNodeKey);
      if (keyData) {
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.selectedNodeKey);
          this.handleNodeClick(keyData);
        });
      } else {
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(val[0].id);
          this.handleNodeClick(val[0]);
        });
      }
    },
    handleToggleIndent() {
      this.savePassCollapse({
        passCollapse: !this.passCollapse,
      });
    },
    handlePassAdd() {
      if (!this.passRootId) {
        return;
      }
      const winData = {
        oper: 'create',
        type: 'PROJECT',
        id: this.passRootId,
      };
      this.$modal.show(this.$t('projectSet.addProject'), passAddModal, winData, '600px', this.getTreeList);
    },
    afterPopoverEnter() {
      // popover显示后要设置tree0选中的node
      if (!this.selectedNodeKey) {
        return;
      }
      const currentKey = this.$refs.tree0.getCurrentKey();
      if (this.selectedNodeKey === currentKey) {
        return;
      }
      this.$refs.tree0.setCurrentKey(this.selectedNodeKey);
    },
    popoverHide() {
      // popover隐藏后要设置tree选中的node
      if (!this.selectedNodeKey) {
        return;
      }
      const currentKey = this.$refs.tree.getCurrentKey();
      if (this.selectedNodeKey === currentKey) {
        return;
      }
      this.$refs.tree.setCurrentKey(this.selectedNodeKey);
    },
    handleNodeClick(data) {
      this.selectedNodeKey = data.id;
      // 通道node被点击后，首页机组卡片的点击属性要还原
      this.saveSensorRectClick({ sensorRectClick: false });
      // 存储当前被点击的node信息
      this.saveHierarchy({ hierarchy: data });
      this.saveMachine({ machine: data });
      // 存储当前被点击的node形成的面包屑
      const label = this.extractBreadCrumb(this.passList, data.id);
      this.saveBreadCrumb({ breadCrumb: label });
    },
    extractBreadCrumb(arr, tid) {
      let name = '';
      arr.every((ele) => {
        if (ele.id === tid) {
          name = ele.name;
          return false;
        }
        if (ele.hierarchies && ele.hierarchies.length > 0) {
          name = this.extractBreadCrumb(ele.hierarchies, tid);
          if (name) {
            name = `${ele.name} / ${name}`;
            return false;
          }
        }
        return true;
      });
      return name;
    },
    // 图谱标签反选参数事的处理逻辑
    processReverseHierarchy(machineId) {
      this.$refs.tree.setCurrentKey(machineId);
      const currentNodeData = this.extractCurrentNodeData(this.passList, machineId);
      this.handleNodeClick(currentNodeData);
    },
    extractCurrentNodeData(arr, tid) {
      let nodeData = null;
      arr.every((ele) => {
        if (ele.id === tid) {
          nodeData = ele;
          return false;
        }
        if (ele.hierarchies && ele.hierarchies.length > 0) {
          nodeData = this.extractCurrentNodeData(ele.hierarchies, tid);
          if (nodeData) {
            return false;
          }
        }
        return true;
      });
      return nodeData;
    },
  },
};
</script>
<style lang="less">
#cms-pass0 {
  position: relative;
  height: calc(100% - 96px) !important;
  overflow: auto;
  padding: 10px;
  user-select: none;
  .refresh-btn {
    &:hover {
      color: #1890ff;
    }
  }
  .container-component {
    .d2-container-full-bs {
      border: none !important;
      right: 0 !important;
      top: 34px !important;
      .d2-container-full-bs__body {
        .d2-container-full-bs__body-wrapper-inner {
          padding: 10px !important;
        }
      }
    }
  }
  .pass-top {
    position: absolute;
    width: calc(100% - 20px);
    top: 10px;
    left: 10px;
    .pass-title {
      font-size: 16px;
      font-weight: bold;
      text-align: left;
      margin-bottom: 10px;
    }
  }
  .popover-pass-title {
    font-size: 16px;
  }
}
#popTree {
  position: relative;
  overflow: auto;
  user-select: none;
}
#cms-pass0,
#popTree {
  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  .node-circle {
    display: inline-block;
    vertical-align: middle;
    width: 10px;
    height: 10px;
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
  }
  .node-block {
    display: inline-block;
  }
  .node-none {
    display: none;
  }
}
</style>
