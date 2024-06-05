<template>
  <div
    :class="
      statusForm.alarmLevel +
      ' status-rect' +
      (!statusForm.hasOwnProperty('identifier') && !statusForm.hasOwnProperty('machineId') ? ' fan' : '')
    "
    @click="handleRectClick"
    :style="{ cursor: !statusForm.hasOwnProperty('identifier') ? 'pointer' : 'auto' }"
  >
    <el-tooltip effect="dark" :content="statusForm.name" placement="top-start" :open-delay="500">
      <div class="status-title d2-mb-5">{{ statusForm.name || '--' }}</div>
    </el-tooltip>
    <div class="status-img">
      <span v-if="statusForm.hasOwnProperty('identifier')">
        <img class="img" v-if="statusForm.alarmLevel === 'ATTENTION'" src="./images/icon_variable_attention.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'WARN'" src="./images/icon_variable_error.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'ERROR'" src="./images/icon_variable_error.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'EMERGENCY'" src="./images/icon_variable_error.png" />
        <img
          class="img"
          v-if="!statusForm.alarmLevel || statusForm.alarmLevel === 'OK'"
          src="./images/icon_variable_ok.png"
        />
      </span>
      <span v-if="statusForm.hasOwnProperty('machineId')">
        <img class="img" v-if="statusForm.alarmLevel === 'ATTENTION'" src="./images/icon_sensor_attention.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'WARN'" src="./images/icon_sensor_error.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'ERROR'" src="./images/icon_sensor_error.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'EMERGENCY'" src="./images/icon_sensor_error.png" />
        <img
          class="img"
          v-if="!statusForm.alarmLevel || statusForm.alarmLevel === 'OK'"
          src="./images/icon_sensor_ok.png"
        />
      </span>
      <span v-if="!statusForm.hasOwnProperty('identifier') && !statusForm.hasOwnProperty('machineId')">
        <img class="img" v-if="statusForm.alarmLevel === 'ATTENTION'" src="./images/icon_fan_attention.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'WARN'" src="./images/icon_fan_danger.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'ERROR'" src="./images/icon_fan_danger.png" />
        <img class="img" v-if="statusForm.alarmLevel === 'EMERGENCY'" src="./images/icon_fan_danger.png" />
        <img
          class="img"
          v-if="!statusForm.alarmLevel || statusForm.alarmLevel === 'OK'"
          src="./images/icon_fan_ok.png"
        />
        <img
          class="img fault"
          v-if="statusForm.faultLevel && statusForm.faultLevel === 'FAULT'"
          src="./images/icon_fault.png"
        />
      </span>
    </div>
    <div class="status-value mt-5" v-if="statusForm.hasOwnProperty('identifier')">
      {{ valueUnit }}
    </div>
  </div>
</template>
<script>
import { isValueExist } from '@/util/commonService';

export default {
  name: 'cmsStatusRect',
  props: {
    statusForm: {
      type: Object,
      default: () => ({
        name: '',
        id: '',
        status: '',
      }),
    },
  },
  computed: {
    valueUnit() {
      let value = '--';
      let unit = '';
      if (this.statusForm.value && isValueExist(this.statusForm.value)) {
        value = this.statusForm.value;
      }
      if (this.statusForm.metadata && this.statusForm.metadata.unit && isValueExist(this.statusForm.metadata.unit)) {
        unit = this.statusForm.metadata.unit;
      }
      return `${value} ${unit}`;
    },
  },
  methods: {
    handleRectClick(e) {
      let type = 'MACHINE';
      if (this.statusForm.hasOwnProperty('machineId')) {
        type = 'SENSOR';
      }
      const item = {
        ...this.statusForm,
        type,
      };
      this.$emit('handleRectClick', item);
    },
  },
};
</script>
<style lang="less">
.status-rect {
  // cursor: pointer;
  display: inline-block;
  width: calc(25%- 20px);
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;
  font-size: 14px;
  padding: 5px 10px 15px;
  margin: 10px;
  &.fan {
    width: 13.6%;
    height: 50px;
    padding: 5px;
    margin: 10px 0.6% 0 0;
    &::before {
      width: 2px;
    }
    .status-title {
      font-size: 12px;
      line-height: 14px;
    }
    .status-img {
      text-align: left;
      .img {
        width: 19px;
        height: 16px;
      }
    }
  }
  &:hover {
    border-color: #1890ff;
  }
  &::before {
    content: '';
    width: 3px;
    height: calc(100% + 2px);
    display: block;
    position: absolute;
    left: -2px;
    top: -1px;
    background-color: @color-ok;
  }
  &.OK::before {
    background-color: @color-ok;
  }
  &.ATTENTION::before {
    background-color: @color-attention;
  }
  &.WARN::before {
    background-color: @color-warn;
  }
  &.ERROR::before {
    background-color: @color-error;
  }
  &.EMERGENCY::before {
    background-color: @color-emergency;
  }
  .status-title {
    font-size: 14px;
    line-height: 19px;
    color: #999;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status-value {
    font-size: 14px;
    line-height: 19px;
    color: #666;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
  .status-img {
    text-align: center;
    .img {
      width: 50px;
      height: 50px;
      &.fault {
        width: 16px;
        height: 16px;
        position: absolute;
        right: 10px;
        top: calc(50%-8px);
      }
    }
  }
}
</style>
