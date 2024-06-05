<template>
  <div id="expert-analysis-header">
    <span class="sensorName textSty">{{ item.sensorName }}</span>
    <span class="featureName textSty">{{ item.featureName }}</span>
    <span class="alarmLevel textSty">{{ item.alarmLevel }}</span>
    <span class="occurTime textSty">{{ item.occurTime }}</span>
  </div>
</template>
<script>
export default {
  name: 'expertReportHeader',
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
#expert-analysis-header {
  width: 100%;
  height: 36px;
  font-size: 0;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.65);
  .textSty {
    padding: 0 12px;
    font-size: 14px;
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
}
</style>
