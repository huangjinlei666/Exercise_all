<template>
  <div class="fan-information sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.deviceInfo') }}</span>
    </div>
    <div class="content">
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.bearingManufacturerModel') }}</p>
        </div>
        <p class="fanName" :title="fanEquipment.bearingModel">{{ fanEquipment.bearingModel }}</p>
      </div>
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.gearboxManufacturerModel') }}</p>
        </div>
        <p class="fanName" :title="fanEquipment.gearboxModel">{{ fanEquipment.gearboxModel }}</p>
      </div>
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.generatorManufacturerModel') }}</p>
        </div>
        <p :title="fanEquipment.alternatorManufactureModel" class="fanName">
          {{ fanEquipment.alternatorManufactureModel }}
        </p>
      </div>
      <div class="point"></div>
    </div>
    <div class="content">
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.statusInfo') }}</p>
          <div class="tip-box">
            <div class="tip-box-item" v-for="tipBox in tipBoxList" :key="tipBox.text">
              <span :class="tipBox.class" style="width: 4px; height: 4px"></span>
              <span style="display: inline-block; vertical-align: middle">{{ tipBox.text }}</span>
            </div>
          </div>
        </div>
        <div class="info-list">
          <template v-for="(item, index) in machineDeviceStaus">
            <el-tooltip
              :key="index"
              effect="light"
              :content="getDeviceNo(item.deviceNo) + ' ' + item.deviceName"
              placement="top-start"
            >
              <span
                class="status-circle"
                :class="
                  item.alarmLevel === 'ok'
                    ? 'bg-color-ok'
                    : item.alarmLevel === 'ERROR'
                    ? 'bg-color-error'
                    : item.alarmLevel === 'ATTENTION'
                    ? 'bg-color-attention'
                    : 'bg-color-ok'
                "
              >
                {{ item.showName === '转' ? '转' : '振' }}
              </span>
            </el-tooltip>
          </template>
        </div>
      </div>
    </div>
    <!-- <div class="content">
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.speedRatio') }}</p>
        </div>
        <p class="fanName" :title="speedRatio">{{ speedRatio }}</p>
      </div>
      <div class="list-box" style="width: 60%">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.dataAcquisitionTime') }}</p>
        </div>
        <p class="fanName" :title="sysTime">{{ sysTime }}</p>
      </div>
      <div class="point"></div>
    </div>
    <div class="content">
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.dataAcquisitionNo') }}</p>
        </div>
        <p class="fanName" :title="deviceNo">{{ deviceNo }}</p>
      </div>
      <div class="list-box" style="width: 60%">
        <div class="title-box display_flex align-items_center">
          <p class="title">{{ $t('screen.timeDifference') }}</p>
        </div>
        <p class="fanName" :style="timeDiffWarn == 1 ? 'color:red' : ''" :title="diffTimeStr">{{ diffTimeStr }}</p>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'FanInformation',
  props: {
    fanEquipment: {
      type: Object,
      default: () => {},
    },
    machineDeviceStaus: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      data: {},
      tipBoxList: [
        { class: 'status-circle bg-color-ok', text: this.$t('common.OK') },
        { class: 'status-circle bg-color-attention', text: this.$t('common.ATTENTION') },
        { class: 'status-circle bg-color-error', text: this.$t('common.ERROR') },
      ],
    };
  },
  mounted() {
    // const { hierarchyId } = this.$route.query;
    // this.fetchTimeDiffer(hierarchyId);
    // this.fetchMachineDevice(hierarchyId);
  },
  methods: {
    getDeviceNo(deviceNo) {
      const deviceNoArr = deviceNo.split('_');
      return deviceNoArr.slice(1, 3).join('-');
    },
  },
};
</script>

<style lang="less" scoped>
.fan-information {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  .content {
    width: 100%;
    display: flex;
    // padding: 10px 0;
    height: 40%;
    position: relative;
    .list-box {
      width: 100%;
      margin-left: 20px;
      .title-box {
        justify-content: flex-start;
        .tip-box {
          width: 25%;
          position: absolute;
          right: 0px;
          top: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          line-height: 12px;
          white-space: nowrap;
          .tip-box-item {
            display: inline-block;
            margin-right: 10px;
          }
        }
      }
      .info-list {
        margin-top: 6px;
        background: #202e42;
        display: flex;
        flex-wrap: wrap;
        padding: 6px;
        span {
          width: 22px;
          height: 22px;
          line-height: 22px;
          text-align: center;
          margin: 3px;
          color: #ffffff;
          font-weight: bold;
          font-size: 12px;
        }
      }
    }
    .point {
      position: absolute;
      left: 5%;
      bottom: 0;
      width: 90%;
      height: 1px;
      background: rgba(71, 218, 255, 0.1);
    }
    .title {
      font-size: 14px;
      font-weight: 400;
      color: #45e6f0;
      margin-top: 10px;
    }
    .fanName {
      font-size: 16px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      // margin-left: 17px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-top: 8px;
    }
  }
}
</style>
