<template>
  <div id="cms-pass3">
    <!-- 树形结构 -->
    <d2-container better-scroll v-loading="passLoading">
      <el-tree
        id="sensor-tree"
        ref="tree"
        :data="passList"
        :props="defaultProps"
        node-key="id"
        @node-click="handleSensorNodeClick"
        :default-expand-all="false"
        :expand-on-click-node="false"
        :highlight-current="true"
        :indent="10"
        :load="loadNode"
        :default-expanded-keys="defaultExpandedKeys"
        lazy
        icon-class="el-icon-arrow-right"
      >
        <span slot-scope="{ data }">
          <span v-if="data.type !== 'SENSOR'">
            <i :class="['node-' + (data.networkStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'), 'node-circle']"></i>
            <span class="node-label" :title="data.name">{{ data.name }}</span>
          </span>
          <span v-else>
            <i
              v-if="!data.isLeaf"
              class="fa fa-folder-open font-10 vertical-middle"
              :class="'color-' + data.alarmLevel"
              aria-hidden="true"
            />
            <i
              v-if="data.isLeaf"
              class="fa fa-thumb-tack isLeaf font-10 vertical-middle"
              :class="'color-' + data.alarmLevel"
              aria-hidden="true"
            />
            <span class="node-label isLeaf" :title="data.name">{{ data.name }}</span>
          </span>
        </span>
      </el-tree>
    </d2-container>
    <!-- 头部元素 -->
    <div class="clearfix pass-top">
      <!-- 标题 -->
      <div class="pass-title inline-block">{{ $t('pass.passInfo') }}</div>
      <div class="pull-right" v-if="this.passRootId" @click="handlePassAdd">
        <el-tooltip effect="dark" :content="$t('projectSet.addProject')" placement="top" :open-delay="500">
          <i class="el-icon-plus cursor d2-mt-5"></i>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import passAddModal from '@/views/cms/projectSet/passAddModal';
import d2Container from '../d2-container/index';

export default {
  name: 'cmsPass3',
  components: { d2Container },
  data() {
    return {
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
        isLeaf: 'isLeaf',
      },
      selectedNodeKey: '', // 选中的节点
      defaultExpandedKeys: [], // 默认展开的节点
      passThresholdList: [], // 点击机组后请求回来的传感器原始数据列表
      passThresholdTreeData: [], // 处理以后的传感器树形结构
    };
  },
  computed: {
    ...mapState('cms/pass', [
      'passLoading',
      'passList',
      'passRootId',
      'hierarchy',
      'reverseHierarchy',
      'passThreshold',
    ]),
  },
  mounted() {
    if (this.hierarchy && this.hierarchy.id && this.passList && this.passList.length) {
      this.selectedNodeKey = this.hierarchy.id;
      this.resetSelectedNodeKey(this.passList, this.selectedNodeKey);
      this.defaultExpandedKeys.push(this.hierarchy.id);
      return;
    }
    this.selectedNodeKey = this.passList[0].id;
    this.resetSelectedNodeKey(this.passList, this.selectedNodeKey);
  },
  beforeDestroy() {
    this.savePassThreshold({ passThreshold: {} });
  },
  watch: {
    passList: {
      handler(val) {
        // 通道列表刷新时，如果刷新前的key还存在，则需要重新设置选中的key
        if (!val || val.length === 0) {
          this.selectedNodeKey = '';
          this.defaultExpandedKeys = [];
          return;
        }
        this.defaultExpandedKeys = this.getDefaultExpandedKeys(val);
        this.resetSelectedNodeKey(val, this.selectedNodeKey);
      },
      immediate: true,
    },
    '$route.path': {
      handler(val) {
        if (this.hierarchy && this.hierarchy.id && this.passList && this.passList.length) {
          this.resetSelectedNodeKey(this.passList, this.hierarchy.id);
          this.defaultExpandedKeys.push(this.hierarchy.id);
        }
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
    passThresholdList: {
      handler(val) {
        if (this.hierarchy.type !== 'MACHINE') {
          return;
        }
        let curPassThreshold;
        if (this.passThreshold && this.passThreshold.id) {
          curPassThreshold = val.filter((i) => i.id === this.passThreshold.id)[0];
        } else {
          curPassThreshold = val[0];
        }
        if (!curPassThreshold || !curPassThreshold.name) {
          return;
        }
        this.defaultExpandedKeys.push(curPassThreshold.id);
        this.$nextTick(() => {
          this.selectedNodeKey = curPassThreshold.id;
          this.$refs.tree.setCurrentKey(this.selectedNodeKey);
          this.savePassThreshold({
            passThreshold: curPassThreshold,
          });
        });
      },
    },
  },
  methods: {
    ...mapMutations('cms/pass', ['saveBreadCrumb', 'saveHierarchy', 'savePassThreshold']),
    // 打开默认返回的数据
    getDefaultExpandedKeys(arr) {
      let result = [];
      arr.forEach((i) => {
        result.push(i.id);
        // if (i.hierarchies.length > 0 && (i.type === 'PROJECT' || i.type === 'FACTORY')) {
        if (i.hierarchies.length > 0 && i.type !== 'WORKSHOP') {
          const childResult = this.getDefaultExpandedKeys(i.hierarchies);
          result = [...result, ...childResult];
        }
      });
      return result;
    },
    loadNode(node, resolve) {
      if (Object.prototype.toString.call(node.data) === '[object Array]') {
        return resolve(node.data);
      }
      if (Object.prototype.toString.call(node.data) === '[object Object]') {
        if (node.data.type !== 'MACHINE') {
          return resolve(node.data.hierarchies);
        }
        const machineId = node.data.id;
        this.passThresholdList = [];
        this.passThresholdTreeData = [];
        this.$api.overview
          .getMachineChildren(machineId)
          .then((res) => {
            if (!res || !res.length) {
              return resolve([]);
            }
            this.passThresholdList = cloneDeep(res);
            this.mapMachineChildren(res);
            this.passThresholdTreeData = res;
            resolve(res);
          })
          .catch(() => resolve([]));
      }
    },
    mapMachineChildren(res) {
      res.forEach((r) => {
        const name = r.deviceName;
        const nameArr = name.split('_');
        r.name = nameArr[nameArr.length - 1];
        r.id = r.deviceId;
        r.type = 'SENSOR';
        if (r.childNodes && r.childNodes.length > 0) {
          r.hierarchies = r.childNodes;
          this.mapMachineChildren(r.childNodes);
        } else {
          r.isLeaf = true;
        }
      });
    },
    resetSelectedNodeKey(val, selectedNodeKey) {
      if (!selectedNodeKey) {
        return;
      }
      const keyData = this.extractCurrentNodeData(val, selectedNodeKey);
      if (keyData) {
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(selectedNodeKey);
          this.handleSensorNodeClick(keyData);
        });
      } else {
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(val[0].id);
          this.handleSensorNodeClick(val[0]);
        });
      }
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
    // 递归拿到当前点击的sensor父节点
    getSensorMachine(node) {
      if (node.data && node.data.type !== 'MACHINE') {
        return this.getSensorMachine(node.parent);
      }
      return node.data;
    },
    handleSensorNodeClick(data, node) {
      if (data.id) {
        this.selectedNodeKey = data.id;
      }
      if (data.type !== 'SENSOR') {
        this.saveHierarchy({ hierarchy: data });
        // 存储当前被点击的node形成的面包屑
        const label = this.extractBreadCrumb(this.passList, data.id);
        this.saveBreadCrumb({ breadCrumb: label });
      }
      if (data.type === 'SENSOR') {
        // 存储当前点击的阈值节点
        this.savePassThreshold({ passThreshold: data });
        const nodeData = this.getSensorMachine(node);
        // 存储挂载当前sensor节点的风机节点
        this.saveHierarchy({ hierarchy: nodeData });
      }
      if (data.type === 'MACHINE') {
        // 存储当前点击的阈值节点
        this.savePassThreshold({ passThreshold: data });
      }
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
      this.handleSensorNodeClick(currentNodeData);
      this.defaultExpandedKeys.push(machineId);
    },
    extractCurrentNodeData(arr, tid) {
      let nodeData = this.hierarchy || null;
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
#cms-pass3 {
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
#cms-pass3 {
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
  .color-OFFLINE {
    color: @color-info;
  }
  .color-OK {
    color: @color-ok;
  }
  .color-ATTENTION {
    color: @color-attention;
  }
  .color-ERROR {
    color: @color-error;
  }
  .color-WARN {
    color: @color-warn;
  }
  .color-EMERGENCY {
    color: @color-emergency;
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
#sensor-tree {
  &.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    .isLeaf {
      &.node-label {
        color: #606266 !important;
      }
      & + .isLeaf {
        color: #1890ff !important;
      }
    }
  }
}
</style>
