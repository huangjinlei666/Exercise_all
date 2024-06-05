<template>
  <div id="board">
    <div class="header-box clearfix">
      <div class="logo-box">
        <img v-if="logoSrc" class="cms-logo" :src="logoSrc" />
        <span v-if="!logoSrc" class="cms-logo-title">{{ $t('title') }}</span>
      </div>
      <span class="exit-text pull-right d2-mr-10" @click="handleToggle">
        <i class="fa fa-sign-out"></i>
        {{ $t('common.exit') }}
      </span>
      <span class="user-text pull-right d2-mr-20">
        <i class="fa fa-user-circle-o"></i>
        {{ info.name ? `${info.name}` : $t('common.unlogin') }}
      </span>
    </div>
    <div class="border-box clearfix">
      <div class="general">
        <GeneralChart />
      </div>
      <div class="itembox alarmList">
        <alarm-list></alarm-list>
      </div>
      <div class="itembox speedTrend">
        <speed-trend :sensorList="speedSensorList"></speed-trend>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import screenfull from 'screenfull';
import { extractWorkshopId, processConfig, getMetaContent } from '@/util/commonService';
import GeneralChart from '@/components/general/index.vue';
import AlarmList from './alarmList.vue';
import SpeedTrend from './speTrend.vue';

export default {
  name: 'board',
  components: {
    AlarmList,
    GeneralChart,
    SpeedTrend,
  },
  data() {
    return {
      sensorList: [],
      configParam: [],
      timeInterval: null,
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/board', ['machine']),
    ...mapState('cms/atlas', ['refreshTime']),
    ...mapState('cms/pass', ['passList']),
    speedSensorList() {
      if (!this.sensorList || !this.sensorList.length) {
        return [];
      }
      return this.sensorList.filter(
        (i) => i.additionalInfo && JSON.parse(i.additionalInfo).deviceType.includes('speed')
      );
    },
    logoSrc() {
      const mode = getMetaContent('logo-mode');
      if (mode === 'official') {
        return `${this.$baseUrl}/images/logo-white.png`;
      }
      // return `${this.$baseUrl}/images/logo_white.png`;
      return null;
    },
  },
  beforeDestroy() {
    if (this.$route.path.includes('index') || this.$route.path.includes('board')) {
      this.saveHierarchy({ hierarchy: this.machine });
    }
    this.saveMachine({ machine: {} });
    // 清除定时器
    this.timeInterval && clearInterval(this.timeInterval);
    this.timeInterval = null;
    // window.removeEventListener('resize', this.keyUpEvent, false);
  },
  mounted() {
    // window.addEventListener('resize', this.keyUpEvent, false);
  },
  watch: {
    machine: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        if (value.type !== 'MACHINE') {
          this.sensorList = [];
          this.saveConfig([]);
          return;
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
  methods: {
    ...mapMutations({
      saveConfig: 'cms/general/saveConfig',
      saveMachine: 'cms/board/saveMachine',
      saveHierarchy: 'cms/pass/saveHierarchy',
    }),
    keyUpEvent: debounce(
      function keyUpEvent() {
        if (!screenfull.isFullscreen) {
          this.$router.push({ name: 'index' });
        }
      },
      300,
      { leading: true, trailing: false }
    ),
    handleToggle() {
      this.$router.push({ name: 'index' });
      if (screenfull.isFullscreen) {
        screenfull.exit();
      }
    },
    initFetch(machineId) {
      const workshopId = extractWorkshopId(this.passList, machineId);
      Promise.all([
        this.$api.projectSet.getSensorUnderHierarchy({ hierarchyId: machineId, workshopId }),
        this.$api.projectSet.getGeneralMapConfig(machineId),
      ])
        .then(([sensors, generals]) => {
          if (!sensors || sensors.length === 0) {
            this.sensorList = [];
          } else {
            this.sensorList = sensors;
          }
          if (!generals || generals.length === 0) {
            this.configParam = [];
          } else {
            this.configParam = generals;
          }
        })
        .catch((err) => {
          this.$msg.error(err);
          this.sensorList = [];
          this.configParam = [];
        })
        .finally(() => {
          this.processConfigInfo(this.configParam, this.sensorList);
        });
    },
    processConfigInfo(configParamArr, sensorArr) {
      const config = processConfig(configParamArr, sensorArr);
      this.saveConfig(config);
    },
  },
};
</script>
<style lang="less">
#board {
  width: 100%;
  height: 100%;
  background-color: #141930;
  overflow: hidden;
  .header-box {
    width: 100%;
    height: 60px;
    background-color: #07172d;
    .logo-box {
      float: left;
      padding: 5px 15px;
      height: 60px;
      box-sizing: border-box;
    }
    .cms-logo {
      height: 50px !important;
      vertical-align: middle;
    }
    .cms-logo-title {
      font-size: 22px;
      line-height: 50px;
      font-weight: bold;
      vertical-align: middle;
      color: #ffffff;
    }
    .user-text {
      display: inline-block;
      height: 60px;
      color: #ffffff;
      line-height: 60px;
    }
    .exit-text {
      display: inline-block;
      height: 60px;
      color: #ffffff;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .border-box {
    width: 100%;
    height: calc(100% - 60px);
    box-sizing: border-box;
    position: relative;
    font-size: 0;
    .general {
      width: 100%;
      height: 100%;
    }
    .itembox {
      width: 30%;
      height: 47%;
      position: absolute;
      right: 2%;
      background-color: rgba(24, 144, 255, 0.08);
      color: rgba(255, 255, 255, 0.35);
    }
    .alarmList {
      bottom: 51%;
    }
    .speedTrend {
      bottom: 2%;
    }
  }
}
</style>
