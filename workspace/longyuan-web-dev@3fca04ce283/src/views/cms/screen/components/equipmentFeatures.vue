<template>
  <div class="equipment-features sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.equipmentValue') }}</span>
    </div>
    <div class="equipment-content mt-20">
      <template v-if="sensorNameArray && sensorNameArray.length > 0">
        <div class="main-baring" v-for="item in sensorNameArray" :key="item.location">
          <p class="bearing-title">{{ $t(item.name) }}</p>
          <div class="bearing-content">
            <FeatureValueTable :sensorList="item.sensorList" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FeatureValueTable from '@/components/feature-value-table/index.vue';
import { extractWorkshopId, processConfig } from '@/util/commonService';
import { directSensorNameList, nonDirectSensorNameList } from '@/util/selectTypes';

export default {
  name: 'EquipmentFeatures',
  components: { FeatureValueTable },
  data() {
    return {
      timeInterval: null,
      config: [],
      sensorNameList: nonDirectSensorNameList, // 默认非直驱
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
    ...mapState('cms/screen', ['screenMachine']),
    ...mapState('cms/atlas', ['refreshTime']),
    sensorNameArray() {
      const arr = [];
      const length = this.sensorNameList.length;
      this.sensorNameList.forEach((ele, index) => {
        const item = this.config.find((i) => i.location === ele.location) || {};
        arr.push({ ...item, ...ele, length });
      });
      return arr;
    },
  },
  watch: {
    screenMachine: {
      handler(value) {
        if (!value || !value.id) {
          return;
        }
        if (value.type !== 'MACHINE') {
          this.config = [];
          return;
        }
        const modelName = (value.additionalInfo && value.additionalInfo.modelName) || 'nonDirect';
        if (modelName === 'nonDirect') {
          this.sensorNameList = nonDirectSensorNameList;
        } else {
          this.sensorNameList = directSensorNameList;
        }
        // 清除定时器
        this.timeInterval && clearInterval(this.timeInterval);
        this.timeInterval = null;
        this.initFetch(value.id);
        // 设置定时器
        this.timeInterval = setInterval(() => {
          this.initFetch(value.id);
        }, this.refreshTime * 1000);
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    // 清除定时器
    this.timeInterval && clearInterval(this.timeInterval);
    this.timeInterval = null;
  },
  methods: {
    initFetch(machineId) {
      const workshopId = extractWorkshopId(this.passList, machineId);
      let sensorList = [];
      let configParam = [];
      Promise.all([
        this.$api.projectSet.getSensorUnderHierarchy({ hierarchyId: machineId, workshopId }),
        this.$api.projectSet.getGeneralMapConfig(machineId, workshopId),
      ])
        .then(([sensors, generals]) => {
          if (!sensors || sensors.length === 0) {
            sensorList = [];
          } else {
            sensorList = sensors;
          }
          if (!generals || generals.length === 0) {
            configParam = [];
          } else {
            configParam = generals;
          }
        })
        .catch((err) => {
          this.$msg.error(err);
          sensorList = [];
          configParam = [];
        })
        .finally(() => {
          this.processConfigInfo(configParam, sensorList);
        });
    },
    processConfigInfo(configParamArr, sensorArr) {
      const config = processConfig(configParamArr, sensorArr);
      this.config = config;
      this.$emit('update', this.sensorNameArray);
    },
  },
};
</script>

<style lang="less" scoped>
.equipment-features {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  .equipment-content {
    width: 100%;
    height: calc(100% - 40px);
    // display: flex;
    // justify-content: space-between;
    position: relative;
    .main-baring {
      width: 100%;
      height: calc(30% - 10px);
      margin-bottom: 20px;
      position: relative;
      .bearing-title {
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 10px;
      }
      .bearing-content {
        width: 100%;
        height: 83%;
      }
    }
  }
}
</style>
