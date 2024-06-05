<template>
  <div id="cms-pass-tree">
    <!-- 树形结构 -->
    <d2-container better-scroll v-loading="passLoading">
      <el-tree
        id="sensor-tree"
        ref="tree"
        :data="passSensorTreeData"
        :props="defaultProps"
        node-key="id"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :highlight-current="true"
        :indent="10"
        @check="nodeCheck"
        icon-class="el-icon-arrow-right"
        show-checkbox
      >
        <span slot-scope="{ data }">
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
          <span class="node-label">{{ data.name }}</span>
        </span>
      </el-tree>
    </d2-container>
    <!-- 头部元素 -->
    <div class="clearfix pass-top">
      <!-- 标题 -->
      <div class="pass-title inline-block">{{ $t('pass.selectPass') }}</div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { newFormatGroupSelectOptions } from '@/util/commonService';
import d2Container from '@/components/d2-container/index';

export default {
  name: 'passTree',
  components: { d2Container },
  data() {
    return {
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
        isLeaf: 'isLeaf',
      },
      passSensorTreeData: [], // 处理以后的传感器树形结构
      machineId: '',
      sensorList: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passLoading', 'passList', 'hierarchy']),
  },
  mounted() {
    this.loadNode();
  },
  methods: {
    loadNode() {
      const workshopId = this.passList[0].id;
      const machineId = this.hierarchy.id;
      this.passSensorTreeData = [
        {
          alarmLevel: this.hierarchy.alarmLevel || null,
          createdAt: this.hierarchy.createdAt || null,
          deviceId: this.hierarchy.deviceId || '',
          deviceNumber: this.hierarchy.deviceNumber || '',
          id: this.hierarchy.id || '',
          name: this.hierarchy.name || '',
          networkStatus: this.hierarchy.networkStatus || '',
          regionCode: this.hierarchy.regionCode || null,
          type: this.hierarchy.type || '',
          updatedAt: this.hierarchy.updatedAt || null,
          hierarchies: [],
        },
      ];
      this.$api.overview
        .getSensorCount(machineId, workshopId)
        .then((res) => {
          this.machineId = machineId;
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
          this.passSensorTreeData[0].hierarchies = result;
          console.log(this.passSensorTreeData);
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    nodeCheck(data) {
      this.getSensorId(data);
    },
    // 获取传感器的id
    getSensorId(data) {
      if (data.hierarchies && data.hierarchies.length > 0) {
        const arr = data.hierarchies;
        arr.map((item) => {
          this.getSensorId(item);
          return item;
        });
        return;
      }
      if (this.sensorList.indexOf(data.id) !== -1) {
        const ind = this.sensorList.indexOf(data.id);
        this.sensorList.splice(ind, 1);
      } else {
        this.sensorList.push(data.id);
      }
      this.$emit('sensorList', this.sensorList);
    },
  },
};
</script>
<style lang="less">
#cms-pass-tree {
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
    top: 7px;
    left: 0;
    font-weight: bold;
    .pass-title {
      font-size: 16px;
      text-align: left;
      margin-bottom: 10px;
    }
  }
  .popover-pass-title {
    font-size: 16px;
  }
}
#cms-pass-tree {
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
