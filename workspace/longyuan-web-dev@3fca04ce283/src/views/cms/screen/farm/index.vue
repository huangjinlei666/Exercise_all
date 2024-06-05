<template>
  <div class="screen-farm">
    <div class="item1 mr-10">
      <div class="item-pie mb-10">
        <DeviceInfo :windowResize="windowResize" />
      </div>
      <div class="item-pie mb-10">
        <DataDeviceInfo :windowResize="windowResize" />
      </div>
      <div class="item mb-10">
        <DeviceStatus :windowResize="windowResize" />
      </div>
      <div class="item mb-10">
        <ComponentStatisticsArtificial :windowResize="windowResize" />
      </div>
      <div class="item mb-10">
        <ComponentStatisticsWarning :windowResize="windowResize" />
      </div>
      <div class="item-trend mb-10">
        <DeviceAlatmTrend :windowResize="windowResize" />
      </div>
    </div>
    <div class="item2">
      <Map />
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import Map from '../components/map.vue';
import DeviceStatus from '../components/deviceStatus.vue';
import DeviceInfo from '../components/deviceInfo.vue';
import ComponentStatisticsWarning from '../components/componentStatisticsWarning.vue';
import ComponentStatisticsArtificial from '../components/componentStatisticsArtificial.vue';
import DeviceAlatmTrend from '../components/deviceAlarmTrend.vue';
import DataDeviceInfo from '../components/dataDeviceInfo.vue';

export default {
  name: 'ScreenFarm',
  components: {
    Map,
    DeviceStatus,
    DeviceAlatmTrend,
    DeviceInfo,
    ComponentStatisticsArtificial,
    ComponentStatisticsWarning,
    DataDeviceInfo,
  },
  data() {
    return {
      windowResize: false,
    };
  },
  mounted() {
    this.clearParentQuery();
    window.addEventListener('resize', this.onWindowResize, false);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.onWindowResize = () => false;
  },
  methods: {
    ...mapMutations('cms/screen', ['clearParentQuery']),
    onWindowResize: debounce(
      function onWindowResize() {
        this.windowResize = !this.windowResize;
      },
      300,
      { leading: false, trailing: true }
    ),
  },
};
</script>
<style lang="less" scoped>
.screen-farm {
  width: 100%;
  height: 100%;
  min-height: 800px;
  display: flex;
  position: relative;
  box-sizing: border-box;
  font-size: 0;
  padding: 10px;
  background-color: #060d1d;
  .item1 {
    min-width: 500px;
    width: 27%;
    height: 100%;
    .item {
      height: 15%;
      width: 100%;
    }
    .item-pie {
      height: 14%;
      width: 100%;
    }
    .item-trend {
      height: 18%;
      width: 100%;
    }
  }
  .item2 {
    width: calc(73% - 10px);
    min-width: 700px;
    height: 96.5%;
  }
}
</style>
