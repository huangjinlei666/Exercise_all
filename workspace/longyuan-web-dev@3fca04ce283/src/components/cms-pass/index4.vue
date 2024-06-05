<template>
  <div id="cms-pass4">
    <img class="cms-pass--title-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
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
      <div class="pass-title inline-block">
        <img src="../../assets/images/screen/icon-title.png" alt />
        <span class="pass-title-text">{{ $t('pass.passInfo') }}</span>
      </div>
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
import passAddModal from '@/views/cms/projectSet/passAddModal';
import { newFormatGroupSelectOptions } from '@/util/commonService';
import d2Container from '../d2-container/index';

export default {
  name: 'cmsPass4',
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
      passSensorList: [], // 点击机组后请求回来的传感器原始数据列表
      passSensorTreeData: [], // 处理以后的传感器树形结构
      selectList: {},
    };
  },
  computed: {
    ...mapState('cms/pass', [
      'passLoading',
      'passList',
      'passRootId',
      'hierarchy',
      'reverseHierarchy',
      'passSensor',
      'machineHierarchies',
    ]),
  },
  mounted() {
    if (this.hierarchy && this.hierarchy.id && this.passList && this.passList.length) {
      this.selectedNodeKey = this.hierarchy.id;
      console.log(this.selectedNodeKey);
      this.resetSelectedNodeKey(this.passList, this.selectedNodeKey);
      this.defaultExpandedKeys.push(this.hierarchy.id);
      return;
    }
    this.selectedNodeKey = this.passList[0].id;
    this.resetSelectedNodeKey(this.passList, this.selectedNodeKey);
  },
  beforeDestroy() {
    this.savePassSensor({ passSensor: {} });
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
    passSensorList: {
      handler(val) {
        if (this.hierarchy.type !== 'MACHINE') {
          return;
        }
        let curPassSensor;
        if (this.passSensor && this.passSensor.id) {
          curPassSensor = val.filter((i) => i.id === this.passSensor.id)[0];
        } else {
          curPassSensor = val[0];
        }
        if (!curPassSensor || !curPassSensor.name) {
          return;
        }
        const curPassSensorNameArr = curPassSensor.name.split('_');
        if (!curPassSensorNameArr || curPassSensorNameArr.length === 0) {
          return;
        }
        curPassSensorNameArr.forEach((c, i) => {
          if (i !== curPassSensorNameArr.length - 1) {
            this.defaultExpandedKeys.push(c);
          }
        });
        this.$nextTick(() => {
          this.selectedNodeKey = curPassSensor.id;
          this.$refs.tree.setCurrentKey(this.selectedNodeKey);
          const nameArr = curPassSensor.name.split('_');
          let name;
          if (nameArr.length <= 1) {
            name = curPassSensor.name;
          } else {
            name = nameArr.slice(2).join('_');
          }
          this.savePassSensor({
            passSensor: { ...curPassSensor, isLeaf: true, originName: curPassSensor.name, name, type: 'SENSOR' },
          });
        });
      },
    },
  },
  methods: {
    ...mapMutations('cms/pass', [
      'saveBreadCrumb',
      'saveHierarchy',
      'savePassSensor',
      'saveMachineHierarchies',
      'saveSelectedNodes',
    ]),
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
        const workshopId = node.parent.data.id;
        const machineId = node.data.id;
        this.passSensorList = [];
        this.passSensorTreeData = [];
        this.$api.overview
          .getSensorCount(machineId, workshopId)
          .then((res) => {
            if (!res || !res.sensorDTOList || res.sensorDTOList.length === 0) {
              return resolve([]);
            }
            this.passSensorList = res.sensorDTOList;
            const data = res.sensorDTOList.map((i) => ({
              originName: i.name || '',
              name: i.name || '',
              id: i.id || '',
              additionalInfo: i.additionalInfo || '',
              alarmLevel: i.alarmLevel || 'OK',
              machineId: i.machineId || null,
              machineName: i.machineName || null,
              variates: i.variates || [],
              networkStatus: 'ONLINE',
            }));
            const result = newFormatGroupSelectOptions(data);
            this.passSensorTreeData = result;
            return resolve(result);
          })
          .catch(() => resolve([]));
      }
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
    // 图谱页面获取风机下面的异步加载的数据层级
    getSensorMachineNode(node) {
      if (node.data && node.data.type !== 'MACHINE') {
        return this.getSensorMachineNode(node.parent);
      }
      return node;
    },
    mapMachineHierarchies(node) {
      return [node].map((n1) => {
        if (!n1) return n1;
        if (n1.childNodes && n1.childNodes.length > 0) {
          n1.hierarchies = n1.childNodes.map((n2) => {
            if (n2.childNodes && n2.childNodes.length > 0) {
              n2.hierarchies = n2.childNodes.map((n3) => {
                if (n3.childNodes && n3.childNodes.length > 0) {
                  n3.hierarchies = n3.childNodes.map((n4) => ({
                    ...n4.data,
                    hierarchies: [],
                  }));
                }
                return {
                  ...n3.data,
                  hierarchies: n3.hierarchies,
                };
              });
            }
            return {
              ...n2.data,
              hierarchies: n2.hierarchies,
            };
          });
        }
        return {
          ...n1.data,
          hierarchies: n1.hierarchies,
        };
      });
    },
    // getSelectNode(node) {
    //   let result = [];
    //   if (node && node.data && node.data.type) {
    //     result.push(node.data.id);
    //     if (node.parent) {
    //       result = [...result, ...this.getSelectNode(node.parent)];
    //     }
    //   }
    //   return result;
    // },
    getSelectNode(node) {
      if (node && node.data && node.data.type) {
        if (node.data.type === 'SENSOR') {
          this.selectList[node.data.type].push(node.data.id);
        } else {
          this.selectList[node.data.type] = node.data;
        }
        if (node.parent) {
          this.getSelectNode(node.parent);
        }
      }
    },
    handleSensorNodeClick(data, node) {
      if (node) {
        this.selectList = {
          SENSOR: [],
        };
        this.getSelectNode(node);
        this.saveSelectedNodes({ selectedNodes: this.selectList });
      }
      if (data.type !== 'SENSOR') {
        if (data.type === 'MACHINE') {
          if (node && node.childNodes && node.childNodes.length > 0) {
            const machineHierarchies = this.mapMachineHierarchies(node);
            this.saveMachineHierarchies({ machineHierarchies });
          }
        }
        this.selectedNodeKey = data.id;
        this.saveHierarchy({ hierarchy: data });
        // 存储当前被点击的node形成的面包屑
        const label = this.extractBreadCrumb(this.passList, data.id);
        this.saveBreadCrumb({ breadCrumb: label });
        return;
      }
      if (node) {
        const machineNode = this.getSensorMachineNode(node);
        const machineHierarchies = this.mapMachineHierarchies(machineNode);
        this.saveMachineHierarchies({ machineHierarchies });
      }
      // 存储当前点击的sensor节点
      if (data.isLeaf) {
        this.savePassSensor({ passSensor: data });
        const nodeData = this.getSensorMachine(node);
        // 存储挂载当前sensor节点的风机节点
        this.saveHierarchy({ hierarchy: nodeData });
      }
      // 选中文件夹的时候不触发
      if (data.id) {
        this.selectedNodeKey = data.id;
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
#cms-pass4 {
  position: relative;
  height: calc(100% - 96px) !important;
  overflow: auto;
  padding: 10px;
  user-select: none;
  background-color: #07172d;
  color: rgba(255, 255, 255, 0.85);
  .cms-pass--title-img {
    width: 100%;
    height: 2px;
    position: absolute;
    top: 0;
    left: 0;
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
      height: 20px;
      margin-bottom: 10px;
      .pass-title-text {
        font-size: 16px;
        line-height: 20px;
        font-weight: bold;
        text-align: left;
        vertical-align: top;
      }
    }
  }
}
#cms-pass4 {
  .el-tree {
    background-color: #07172d;
    color: rgba(255, 255, 255, 0.85);
  }
  .el-tree-node__content {
    &:hover {
      background-color: #0a283f;
    }
  }
  .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #0a283f;
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
