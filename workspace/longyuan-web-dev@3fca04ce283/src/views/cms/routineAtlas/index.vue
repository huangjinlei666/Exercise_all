<template>
  <div class="routine-atlas-layout">
    <div class="header-box clearfix">
      <div class="logo-box">
        <img v-if="logoSrc" class="cms-logo" :src="logoSrc" />
        <span v-if="!logoSrc" class="cms-logo-title">{{ $t('title') }}</span>
      </div>
      <span class="exit-text pull-right mr-20" @click="signOut">
        <i class="fa fa-sign-out"></i>
        {{ $t('common.exit') }}
      </span>
    </div>
    <div class="atlas-box clearfix">
      <div class="atlas-box--block atlas-box--left">
        <CmsPass />
        <LayoutIdentifierList :requestParam="searchParam" />
      </div>
      <div class="atlas-box--block atlas-box--main">
        <LayoutMain :requestParam="searchParam" :chartType="chartType" @chartTypeChange="handleChartTypeChange" />
      </div>
      <div class="atlas-box--block atlas-box--right">
        <LayoutParamsContainer
          :chartType="chartType"
          :sensorList="sensorList"
          :orderSensorList="orderSensorList"
          :vibrationSensorList="vibrationSensorList"
          :machineId="hierarchy.id"
          @paramsChange="handleParamsChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import screenfull from 'screenfull';
import { getMetaContent, extractWorkshopId } from '@/util/commonService';
import CmsPass from '@/components/cms-pass/routineAtlas-index.vue';
import LayoutIdentifierList from './layout-identifier-list.vue';
import LayoutMain from './layout-main.vue';
import LayoutParamsContainer from './layout-params-container.vue';

export default {
  name: 'RoutineAtlasLayout',
  components: { CmsPass, LayoutIdentifierList, LayoutMain, LayoutParamsContainer },
  data() {
    return {
      searchParam: null,
      chartType: 'Trend',
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/pass', ['hierarchy', 'passList']),
    ...mapState('cms/chart', ['sensorListLoading', 'sensorList', 'vibrationSensorList', 'orderSensorList']),
    logoSrc() {
      const mode = getMetaContent('logo-mode');
      if (mode === 'official') {
        return `${this.$baseUrl}/images/logo-white.png`;
      }
      return null;
    },
  },
  created() {
    this.saveChartInit();
  },
  mounted() {
    const { hierarchyId } = this.$route.params;
    if (hierarchyId) {
      this.$nextTick(() => {
        this.saveReverseHierarchy({ machineId: hierarchyId });
      });
    }

    if (!screenfull.isFullscreen) {
      screenfull.request();
    }
  },
  beforeDestroy() {
    this.saveChartInit();
    this.saveFrequencyBand('');
  },
  watch: {
    hierarchy: {
      // 机组发生变化时，请求
      handler(value, oldValue) {
        if (value && oldValue && value.id === oldValue.id) {
          return;
        }
        this.initData(value);
      },
    },
  },
  methods: {
    ...mapMutations('cms/pass', ['saveReverseHierarchy']),
    ...mapMutations('cms/chart', [
      'saveChartInit',
      'saveSensorListLoading',
      'saveSensorList',
      'saveVibrationList',
      'saveOrderSensorList',
      'saveFrequencyBand',
    ]),
    initData(value) {
      if (!value || !value.id || value.type !== 'MACHINE') {
        this.saveSensorList([]);
        this.saveVibrationList([]);
        this.saveOrderSensorList([]);
        return;
      }
      this.initFetch(value.id);
    },
    initFetch(machineId) {
      const workshopId = extractWorkshopId(this.passList, machineId);
      // 全部传感器
      const params = { hierarchyId: machineId, workshopId };
      // 筛选左侧震动传感器, 'TrendDoubling', 'Waveform', 'Spectrum', 'CepstrumSpectrum', 'Envelope', 'Waterfall'
      // const params1 = { hierarchyId: machineId, workshopId, deviceType: 'vibration' };
      // 筛选转速传感器, 'Spectrum', 'Envelope', 'Waterfall'
      // const params2 = { hierarchyId: machineId, workshopId, deviceType: 'speed' };

      let sensorList = [];
      let vibrationSensorList = [];
      let orderSensorList = [];

      this.saveSensorListLoading(true);
      this.$api.projectSet
        .getSensorUnderHierarchy(params)
        .then((sensors) => {
          if (!sensors || sensors.length === 0) {
            sensorList = [];
          } else {
            sensorList = sensors;
          }
          sensorList.forEach((i) => {
            let info;
            try {
              info = JSON.parse(i.additionalInfo);
            } catch (error) {
              info = {};
            }
            if (info && info.deviceType && info.deviceType[0]) {
              if (info.deviceType[0] === 'vibration') {
                vibrationSensorList.push(i);
              }
              if (info.deviceType[0] === 'speed') {
                orderSensorList.push(i);
              }
            }
          });
        })
        .catch((err) => {
          sensorList = [];
          vibrationSensorList = [];
          orderSensorList = [];
        })
        .finally(() => {
          this.saveSensorListLoading(false);
          this.saveSensorList(sensorList);
          this.saveVibrationList(vibrationSensorList);
          this.saveOrderSensorList(orderSensorList);
        });
    },
    handleParamsChange(param) {
      this.searchParam = { ...param, dataType: 'HISTORY' };
    },
    handleChartTypeChange(chartType) {
      this.chartType = chartType;
    },
    signOut() {
      this.$router.push({
        name: 'general',
        params: {
          hierarchyId: this.hierarchy.id,
        },
      });
      if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.routine-atlas-layout {
  width: 100%;
  height: 100%;
  min-height: 690px;
  background-color: #060d1d;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  .header-box {
    width: 100%;
    height: 60px;
    background-color: #071830;
    .logo-box {
      float: left;
      margin-left: 20px;
      height: 60px;
      box-sizing: border-box;
    }
    .cms-logo {
      height: 50px !important;
      vertical-align: middle;
    }
    .cms-logo-title {
      font-size: 20px;
      font-weight: 500;
      color: #ffffff;
      line-height: 60px;
      letter-spacing: 1px;
    }
    .exit-text {
      display: inline-block;
      height: 60px;
      color: #ffffff;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .atlas-box {
    position: relative;
    width: 100%;
    height: calc(100% - 60px);
    padding: 10px;
    box-sizing: border-box;
    background-color: #060d1d;
    color: #333;
    font-size: 0;
    .atlas-box--block {
      display: inline-block;
      height: 100%;
      font-size: 14px;
      position: relative;
      vertical-align: top;
    }
    .atlas-box--left {
      width: 220px;
    }
    .atlas-box--main {
      width: calc(100% - 520px);
      margin: 0 10px;
      background-color: #07172d;
    }
    .atlas-box--right {
      width: 280px;
      background-color: #07172d;
    }
  }
}
</style>
