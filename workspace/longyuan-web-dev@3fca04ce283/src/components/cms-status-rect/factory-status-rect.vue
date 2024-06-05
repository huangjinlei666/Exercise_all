<template>
  <div id="factory-status-rect" :class="alarmLevel" @click="handleFactoryRectClick">
    <el-tooltip effect="dark" :content="statusForm.name" placement="top-start" :open-delay="500">
      <div class="status-title d2-mb-5">{{ statusForm.name || '--' }}</div>
    </el-tooltip>
    <div class="status-img">
      <span>
        <img class="img" v-if="alarmLevel === 'ATTENTION'" src="/images/map/icon_factory_attention.png" />
        <img class="img" v-if="alarmLevel === 'WARN'" src="/images/map/icon_factory_error.png" />
        <img class="img" v-if="alarmLevel === 'ERROR'" src="/images/map/icon_factory_error.png" />
        <img class="img" v-if="alarmLevel === 'EMERGENCY'" src="/images/map/icon_factory_error.png" />
        <img class="img" v-if="alarmLevel === 'OK'" src="/images/map/icon_factory_ok.png" />
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'factoryStatusCard',
  props: {
    statusForm: {
      type: Object,
      default: () => ({
        name: '',
        id: '',
        alarmLevel: '',
      }),
    },
  },
  computed: {
    alarmLevel() {
      return this.statusForm.alarmLevel || 'OK';
    },
  },
  methods: {
    handleFactoryRectClick(e) {
      const item = {
        ...this.statusForm,
        type: 'FACTORY',
      };
      this.$emit('handleFactoryRectClick', item);
    },
  },
};
</script>
<style lang="less">
#factory-status-rect {
  display: inline-block;
  width: calc(25% - 20px);
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;
  font-size: 14px;
  padding: 5px 10px 15px;
  margin: 10px 10px;
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
  .status-img {
    text-align: center;
    .img {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
