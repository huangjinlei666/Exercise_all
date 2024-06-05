<template>
  <div id="cms-pass2">
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
        :check-on-click-node="true"
        :indent="10"
        :load="loadNode"
        :default-expanded-keys="defaultExpandedKeys"
        show-checkbox
        lazy
        icon-class="el-icon-arrow-right"
        @check="nodeCheck"
      >
        <span slot-scope="{ data }">
          <span v-if="data.type !== 'SENSOR'">
            <i :class="['node-' + (data.networkStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE'), 'node-circle']"></i>
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
          </span>
          <span class="node-label">{{ data.name }}</span>
        </span>
        <!-- <span slot-scope="{ node, data }">
          <span v-if="data.type !== 'SENSOR'">
            <el-checkbox
              v-if="data.type === 'WORKSHOP'"
              :value="workshopSelectedList.includes(data.id)"
              :disabled="workshopSelectedList.length > 0 && !workshopSelectedList.includes(data.id)"
              @change="(f) => handleWorkshopChange(f, data)"
            ></el-checkbox>
            <el-checkbox
              v-if="data.type === 'MACHINE'"
              :value="machineSelectedList.includes(data.id)"
              :disabled="workshopSelectedList.length > 0 && workshopSelectedList[0] !== getWorkshopData(node).id"
              @change="(f) => handleMachineChange(f, data, node)"
            ></el-checkbox>
            <i
              :class="[
                'node-' +
                  (data.type !== 'MACHINE'
                    ? data.alarmLevel
                    : data.networkStatus === 'ONLINE'
                    ? data.alarmLevel
                    : 'OFFLINE'),
                'node-circle',
              ]"
            ></i>
            <span class="node-label" :title="data.name">{{ data.name }}</span>
          </span>
          <span v-else>
            <el-checkbox
              v-if="data.isLeaf && !data.isSpeed"
              :value="sensorSelectedList.includes(data.id)"
              :disabled="workshopSelectedList.length > 0 && workshopSelectedList[0] !== getWorkshopData(node).id"
              @change="(f) => handleSensorChange(f, data, node)"
            ></el-checkbox>
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
        </span> -->
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
import { newFormatGroupSelectOptions } from '@/util/commonService';
import d2Container from '../d2-container/index';

export default {
  name: 'cmsPass2',
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
      machineId: '',
      workshopData: null,
      machineData: null,
      allCheckedId: [], // 所有选中的节点
      dealPassList: [],
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
      'workshopHierarchy',
      'workshopSelectedList',
      'machineSelectedList',
      'sensorSelectedList',
      'template',
      'selectedNodes',
    ]),
  },
  mounted() {
    this.saveWorkshopHierarchy({ workshopHierarchy: null });
    this.dealPassList = cloneDeep(this.passList);
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
    this.savePassSensor({ passSensor: {} });
    this.saveWorkshopHierarchy({ workshopHierarchy: null });
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
        // if (this.hierarchy.type !== 'MACHINE') {
        //   return;
        // }
        if (this.machineSelectedList.includes(this.machineId)) {
          val
            .filter((v) => {
              let info;
              try {
                info = JSON.parse(v.additionalInfo);
              } catch (error) {
                info = {};
              }
              if (info && info.deviceType && info.deviceType[0]) {
                if (info.deviceType[0] === 'speed') {
                  return false;
                }
              }
              return true;
            })
            .forEach((v) => {
              this.handleWorkshopHierarchy('SENSOR', true, v, this.workshopData, this.machineData);
            });
        }
        // 设置风机下的传感器树形全部展开
        val
          .map((i) => i.name)
          .forEach((name) => {
            const nameArr = name.split('_');
            nameArr.pop();
            if (nameArr && nameArr.length > 0) {
              nameArr.forEach((n) => {
                // this.defaultExpandedKeys.push(n);
              });
            }
          });
        let curPassSensor;
        if (this.passSensor && this.passSensor.id) {
          curPassSensor = val.filter((i) => i.id === this.passSensor.id)[0];
        } else {
          curPassSensor = val[0];
        }
        if (!curPassSensor || !curPassSensor.name) {
          return;
        }
        // const curPassSensorNameArr = curPassSensor.name.split('_');
        // if (!curPassSensorNameArr || curPassSensorNameArr.length === 0) {
        //   return;
        // }
        // curPassSensorNameArr.forEach((c, i) => {
        //   if (i !== curPassSensorNameArr.length - 1) {
        //     this.defaultExpandedKeys.push(c);
        //   }
        // });
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
    /**
     * 选中的所有节点
     */
    allCheckedId: {
      handler(val) {
        // 从原始的树形数据中拿到该区域的树形结果
        const workShopTreeData = this.passList[0];
        const checkIds = val.map((item) => item.id);

        // 每次点击都重置往后台传输的数据
        this.saveWorkshopHierarchy({ workshopHierarchy: null });
        /**
         * 存在选中的风场 则组织往后台传输的数据
         */
        if (workShopTreeData) {
          const params = this.createParams(this.dealPassList, checkIds);
          /**
           * 保存到vuex中 使数据持久化
           */
          this.saveWorkshopHierarchy({ workshopHierarchy: params });
        }
      },
    },
    /**
     * 监听模板信息
     */
    template: {
      handler(val) {
        if (!val || !val[0] || !val[0].content) {
          return;
        }
        this.defaultExpandedKeys = val[0].content.halfCheckedNodes;
        setTimeout(() => {
          this.$refs.tree.setCheckedKeys(val[0].content.checkedNodes);
          const params = this.createParams(this.dealPassList, val[0].content.allCheckedIds);
          this.saveWorkshopHierarchy({ workshopHierarchy: params });
        }, 1000);
      },
    },
    /**
     * 监听模板信息
     */
    selectedNodes: {
      handler(val) {
        if (!val) {
          return;
        }
        this.defaultExpandedKeys = val.slice(1);
        setTimeout(() => {
          this.$refs.tree.setCheckedKeys([val[0]]);
          const params = this.createParams(this.dealPassList, val);
          this.saveWorkshopHierarchy({ workshopHierarchy: params });
        }, 1000);
      },
    },
  },
  methods: {
    ...mapMutations('cms/pass', ['saveBreadCrumb', 'saveHierarchy', 'savePassSensor', 'saveWorkshopHierarchy']),
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
            this.machineId = machineId;
            this.machineData = node.data;
            this.workshopData = node.parent.data;
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
              type: 'SENSOR',
            }));
            const result = newFormatGroupSelectOptions(data);
            this.passSensorTreeData = result;
            this.dealPassList[0].hierarchies.map((pVal) => {
              if (pVal.id === machineId) {
                if (!pVal.hierarchies || pVal.hierarchies.length < 1) {
                  pVal.hierarchies = data;
                }
              }
              return pVal;
            });
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
    getWorkshopData(node) {
      if (node.data && node.data.type !== 'WORKSHOP') {
        return this.getWorkshopData(node.parent);
      }
      return node.data;
    },
    handleSensorNodeClick(data, node) {
      console.log(node);
      if (data.type !== 'SENSOR') {
        this.selectedNodeKey = data.id;
        this.saveHierarchy({ hierarchy: data });
        // 存储当前被点击的node形成的面包屑
        const label = this.extractBreadCrumb(this.passList, data.id);
        this.saveBreadCrumb({ breadCrumb: label });
        return;
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
    handleWorkshopChange(f, data) {
      this.handleWorkshopHierarchy('WORKSHOP', f, data);
    },
    handleMachineChange(f, data, node) {
      const workshopData = this.getWorkshopData(node);
      const machineData = data;
      this.handleWorkshopHierarchy('MACHINE', f, data, workshopData);
      if (f) {
        this.defaultExpandedKeys.push(data.id);
        if (node.childNodes.length > 0) {
          this.mapChildNodes(node.childNodes, workshopData, machineData);
        }
      }
    },
    handleSensorChange(f, data, node) {
      const workshopData = this.getWorkshopData(node);
      const machineData = this.getSensorMachine(node);
      this.handleWorkshopHierarchy('SENSOR', f, data, workshopData, machineData);
    },
    handleWorkshopHierarchy(typeStr, f, data, workshopData, machineData) {
      if (typeStr === 'WORKSHOP') {
        if (!f) {
          // 移除风场
          this.saveWorkshopHierarchy({ workshopHierarchy: null });
        } else {
          // 添加风场
          const h = {
            workshopId: data.id,
            workshopName: data.name,
            machineList: [],
          };
          this.saveWorkshopHierarchy({ workshopHierarchy: h });
        }
      }
      if (typeStr === 'MACHINE') {
        if (!f) {
          // 移除风机
          const cloneH = cloneDeep(this.workshopHierarchy);
          if (cloneH && cloneH.machineList && cloneH.machineList.length > 0) {
            cloneH.machineList = cloneH.machineList.filter((m) => m.machineId !== data.id);
            this.saveWorkshopHierarchy({ workshopHierarchy: cloneH });
          }
        }
        if (f) {
          // 添加风机
          if (!this.workshopHierarchy) {
            this.handleWorkshopHierarchy('WORKSHOP', true, workshopData);
          }
          const cloneH = cloneDeep(this.workshopHierarchy);
          if (!cloneH.machineList) {
            cloneH.machineList = [];
          }
          if (!cloneH.machineList.find((m) => m.machineId === data.id)) {
            cloneH.machineList.push({
              machineId: data.id,
              machineName: data.name,
              sensorIdList: [],
            });
            this.saveWorkshopHierarchy({ workshopHierarchy: cloneH });
          }
        }
      }
      if (typeStr === 'SENSOR') {
        if (!f) {
          // 移除传感器
          const cloneH = cloneDeep(this.workshopHierarchy);
          if (cloneH && cloneH.machineList && cloneH.machineList.length > 0) {
            cloneH.machineList.forEach((m) => {
              if (m.machineId === machineData.id) {
                if (m && m.sensorIdList && m.sensorIdList.length > 0) {
                  m.sensorIdList = m.sensorIdList.filter((s) => s !== data.id);
                }
              }
            });
            this.saveWorkshopHierarchy({ workshopHierarchy: cloneH });
          }
        }
        if (f) {
          // 添加传感器
          this.handleWorkshopHierarchy('MACHINE', true, machineData, workshopData);
          const cloneH = cloneDeep(this.workshopHierarchy);
          cloneH.machineList.forEach((m) => {
            if (m.machineId === machineData.id) {
              if (!m.sensorIdList) {
                m.sensorIdList = [];
              }
              if (!m.sensorIdList.find((s) => s === data.id)) {
                m.sensorIdList.push(data.id);
              }
            }
          });
          this.saveWorkshopHierarchy({ workshopHierarchy: cloneH });
        }
      }
    },
    mapChildNodes(nodeArray, workshopData, machineData) {
      nodeArray.forEach((node) => {
        if (node.isLeaf) {
          const data = {
            ...node.data,
            name: node.data.originName,
          };
          this.handleWorkshopHierarchy('SENSOR', true, data, workshopData, machineData);
        }
        if (node.childNodes && node.childNodes.length > 0) {
          this.mapChildNodes(node.childNodes, workshopData, machineData);
        }
      });
    },
    /**
     * 复选框 选中、取消触发动作
     */
    nodeCheck(data, node) {
      this.checkedId = node.checkedKeys;
      const checkedNodes = this.getCheckedNodes(node.checkedNodes);
      const newArr = checkedNodes.concat(node.halfCheckedNodes);
      /** 选中赋值 */
      this.allCheckedId = newArr;
    },

    /*
     * 遍历选中的节点
     */
    getCheckedNodes(checkedNodes) {
      let obj = [];
      if (!checkedNodes || checkedNodes.length < 1) {
        return obj;
      }
      checkedNodes.forEach((val) => {
        if (!isNaN(val.id)) {
          obj.push(val);
        }
        if (val.hierarchies && val.hierarchies.length > 0) {
          obj = obj.concat(this.getCheckedNodes(val.hierarchies));
        }
      });
      return obj;
    },

    /**
     * 组织向后台传输的数据
     */
    createParams(treeData, checkedId) {
      const result = [];
      if (!treeData) {
        return result;
      }
      treeData.forEach((val) => {
        const obj = {};
        // 如果类型是风场
        if (val.type === 'WORKSHOP') {
          obj.workshopId = val.id;
          obj.workshopName = val.name;
          obj.machineList = this.createParams(val.hierarchies, checkedId);
          result.push(obj);
        }
        // 如果类型是风机
        if (val.type === 'MACHINE' && checkedId.includes(val.id)) {
          obj.machineId = val.id;
          obj.machineName = val.name;
          if (val.hierarchies && val.hierarchies.length > 0) {
            obj.sensorIdList = this.createParams(val.hierarchies, checkedId);
          } else {
            obj.sensorIdList = [];
          }
          result.push(obj);
        }
        // 如果类型是传感器
        if (val.type === 'SENSOR' && checkedId.includes(val.id)) {
          result.push(val.id);
        }
      });
      return result;
    },
  },
};
</script>
<style lang="less">
#cms-pass2 {
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
#cms-pass2 {
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
