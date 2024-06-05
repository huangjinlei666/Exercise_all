<template>
  <div id="expert-analysis-list">
    <div class="bg"></div>
    <span class="sensorName textSty">{{ item.sensorName }}</span>
    <span class="featureName textSty">{{ item.featureName }}</span>
    <span class="alarmLevel textSty">
      <span v-if="item.level === 'OK'" class="status-circle bg-color-ok"></span>
      <span v-if="item.level === 'ATTENTION'" class="status-circle bg-color-attention"></span>
      <span v-if="item.level === 'WARN'" class="status-circle bg-color-error"></span>
      <span v-if="item.level === 'ERROR'" class="status-circle bg-color-error"></span>
      <span v-if="item.level === 'EMERGENCY'" class="status-circle bg-color-error"></span>
      <span class="d2-ml-5">{{ item.levelText }}</span>
    </span>
    <span class="occurTime textSty">{{ item.occurTime }}</span>
  </div>
</template>
<script>
export default {
  name: 'expertReportList',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      tableData: [],
    };
  },
};
</script>
<style lang="less" scoped>
#expert-analysis-list {
  width: 100%;
  height: 36px;
  font-size: 0;
  border: none;
  border-radius: 3px;
  margin-bottom: 10px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.65);
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 3px;
  }
  &:hover {
    .bg {
      background-color: rgba(0, 0, 255, 0.1);
    }
  }
  .textSty {
    padding: 0 12px;
    font-size: 12px;
    line-height: 36px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sensorName {
    width: calc(28% - 24px);
  }
  .featureName {
    width: calc(22% - 24px);
  }
  .alarmLevel {
    width: calc(20% - 24px);
  }
  .occurTime {
    width: calc(30% - 24px);
  }

  .status-circle {
    display: inline-block;
    vertical-align: middle;
    width: 10px;
    height: 10px;
    border: none;
    border-radius: 50%;
    background-color: #abe530;
    padding: 0 !important;
    margin-right: 2px;
  }
  .status-error {
    background-color: #ff5b5b;
  }
  .status-warn {
    background-color: #ffc71c;
  }
}
</style>
