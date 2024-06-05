<template>
  <div class="screen-machine">
    <div class="item1">
      <div class="item4 mb-10">
        <FanInformation :fanEquipment="fanEquipment" />
      </div>
      <div class="item5 mb-10">
        <DeviceInformation :fanEquipment="fanEquipment" :machineDeviceStaus="machineDeviceStaus" />
      </div>
      <div class="item5 mb-10">
        <MonitroDeviceInfo
          :fanEquipment="fanEquipment"
          :machineDeviceStaus="machineDeviceStaus"
          @fanChange="fanChange"
        />
      </div>
      <!-- <div class="item mb-10">
        <AlarmList />
      </div> -->
      <div class="item3 mb-10">
        <EquipmentFeatures @update="updateChart" />
      </div>
    </div>

    <div class="item2">
      <div class="buttons">
        <div v-if="$route.name === 'machine'" class="btn mr-10" @click="showPicture">
          {{ $t('screen.devicePhoto') }}
        </div>
        <div v-if="$route.name === 'machine'" class="btn mr-10" @click="showHistory">
          {{ $t('screen.deviceHistory') }}
        </div>
        <div v-if="$route.name === 'machine'" class="btn" @click="goDiaglosis">
          {{ $t('screen.diaglosis') }}
        </div>
      </div>
      <GeneralChart />
      <div class="bg-screen-img">
        <p class="bg-screen-title">{{ title }}</p>
      </div>
      <div class="screen-back" @click="backTo">{{ $t('common.backToPrev') }}</div>
    </div>
    <fan-history ref="fanHistory" :hierarchyId="$route.query.hierarchyId" />
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import devicePhotoModal from '@/views/cms/screen/devicePhotoModal.vue';
import GeneralChart from '@/components/general/index.vue';
import FanInformation from '../components/fanInformation.vue';
import DeviceInformation from '../components/deviceInformation.vue';
import EquipmentFeatures from '../components/equipmentFeatures.vue';
import MonitroDeviceInfo from '../components/monitorDeviceInfo.vue';
import FanHistory from '../components/fanHistory.vue';

export default {
  name: 'ScreenMachine',
  components: { FanInformation, DeviceInformation, GeneralChart, EquipmentFeatures, MonitroDeviceInfo, FanHistory },
  computed: {
    ...mapState('cms/pass', ['passList']),
    ...mapState('cms/screen', ['farmQuery']),
  },
  data() {
    return {
      fanEquipment: {},
      machineDeviceStaus: [],
      title: '',
      isGotFanData: false,
      isGotSensorData: false,
      data: {
        brand: '--',
        equipmentModel: '--',
        watt: '--',
        bearingModel: '--',
        gearboxModel: '--',
        alternatorManufactureModel: '--',
        fanData: {},
        sensorData: '',
        photoList: null,
      },
    };
  },
  mounted() {
    this.initData();
    const { type, parentQuery } = this.$route.params;
    const { hierarchyId, title } = this.$route.query;
    this.title = title;
    if (type === 'MACHINE') {
      this.saveParentQuery({
        type,
        data: parentQuery,
      });
      const machine = this.extractCurrentNodeData(this.passList, hierarchyId);
      this.saveScreenMachine({ screenMachine: machine });
    }
  },
  beforeDestroy() {
    this.saveScreenMachine({ screenMachine: {} });
  },
  methods: {
    ...mapMutations('cms/screen', ['saveParentQuery', 'saveScreenMachine']),
    backTo() {
      this.$router.push({
        name: 'farm',
        query: this.farmQuery,
      });
    },
    initData() {
      const { hierarchyId } = this.$route.query;
      this.fetchFanEquipment(hierarchyId);
      this.fetchMachineDeviceStatus(hierarchyId);
    },
    fetchFanEquipment(id) {
      if (!id) {
        return;
      }
      this.$api.screen
        .getFanEquipment(id)
        .then((res) => {
          if (!res) {
            this.fanEquipment = this.data;
            return;
          }
          this.fanEquipment = res;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {});
    },
    extractCurrentNodeData(arr, tid) {
      let nodeData = null;
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
    // 获取风机下所有通道状态
    fetchMachineDeviceStatus(id) {
      this.$api.screen
        .getMachineDeviceStatus(id)
        .then((res) => {
          if (!res) {
            this.machineDeviceStaus = [];
            return;
          }
          this.machineDeviceStaus = res.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {});
    },
    updateChart(sensorData) {
      this.sensorData = sensorData;
      this.isGotSensorData = true;
    },
    fanChange(fanData) {
      this.fanData = fanData;
      this.isGotFanData = true;
    },
    photoChange(list) {
      this.photoList = list;
    },
    showPicture() {
      const { hierarchyId } = this.$route.query;
      this.photoList = this.photoList || this.fanData?.fileIds?.split(',') || [];
      const modalData = {
        hierarchyId,
        photoList: this.photoList,
        parent: this,
      };
      this.$modal.show(this.$t('screen.devicePhoto'), devicePhotoModal, modalData, '900px');
    },
    showHistory() {
      this.$refs.fanHistory.drawer();
    },
    goDiaglosis() {
      this.$router.push({
        name: 'routineAtlas',
      });
    },
  },
};
</script>
<style lang="less" scoped>
.screen-machine {
  width: 100%;
  height: 100%;
  min-height: 800px;
  position: relative;
  box-sizing: border-box;
  font-size: 0;
  padding: 10px;
  display: flex;
  justify-content: space-between;

  .item1 {
    width: 27%;
    height: 100%;
    min-width: 486px;

    .item {
      height: 18.5%;
      width: 100%;
    }
    .item4 {
      height: 11.5%;
      width: 100%;
    }
    .item5 {
      height: 22%;
      width: 100%;
    }
    .item3 {
      height: calc(40% - 20px);
      width: 100%;
    }
  }
  .item2 {
    width: calc(100% - 480px);
    height: calc(100% - 18px);
    min-width: 1406px;
    position: relative;
    .buttons {
      position: absolute;
      z-index: 999;
      top: 15px;
      right: 100px;
      display: flex;
      .btn {
        width: 72px;
        height: 38px;
        font-size: 12px;
        line-height: 38px;
        text-align: center;
        color: hsla(0, 0%, 100%, 0.85);
        cursor: pointer;
        padding: 0 10px;
        background: url(/images/screen/button.png) no-repeat;
        background-size: cover;
        &:hover {
          box-shadow: 0 0 12px 1px #489df1;
        }
      }
    }
    .bg-screen-img {
      width: 314px;
      height: 44px;
      position: absolute;
      left: 38%;
      top: 20px;
      z-index: 100;
      background: url(/images/map/bg-title.png);
      .bg-screen-title {
        font-size: 18px;
        font-weight: 500;
        color: #ffffff;
        text-align: center;
        line-height: 44px;
      }
    }
  }
}
</style>
