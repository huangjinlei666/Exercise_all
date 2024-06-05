<template>
  <div class="layout-main">
    <!-- 图谱选择区域 -->
    <div class="mb-10">
      <AtlasButton
        style="margin-right: 10px"
        v-for="chart in compareChartTypes"
        :key="chart.value"
        :isSelect="componentNameList.includes(chart.value)"
        @click="addComponent(chart.value)"
      >
        {{ $t(chart.label) }}
      </AtlasButton>
      <span class="split-line"></span>
      <AtlasButton style="margin-left: 10px" :isSelect="chartType === 'Waterfall'" @click="addComponent('Waterfall')">
        {{ $t('routineAtlas.selectTypes.waterfall') }}
      </AtlasButton>
      <div class="pull-right">
        <div v-if="hierarchy.type === 'WORKSHOP'">
          <AtlasButton style="margin-left: 10px" @click="openWindFarmList()">
            {{ $t('routineAtlas.selectTypes.reportWindFarmList') }}
          </AtlasButton>
          <AtlasButton style="margin-left: 10px" @click="createWindFarm()">
            {{ $t('routineAtlas.selectTypes.reportWindFarm') }}
          </AtlasButton>
        </div>
        <div v-else>
          <AtlasButton @click="openFanRecordList()">
            {{ $t('routineAtlas.selectTypes.reportFanList') }}
          </AtlasButton>
          <AtlasButton class="pull-right" style="margin-left: 10px" @click="exprotData">
            {{ $t('routineAtlas.selectTypes.exportData') }}
          </AtlasButton>
          <AtlasButton style="margin-left: 10px" @click="createFanRecord()">
            {{ $t('routineAtlas.selectTypes.reportFan') }}
          </AtlasButton>
        </div>
      </div>
    </div>
    <!-- 趋势图-固定 -->
    <div class="atlas-item mb-10" v-show="chartType === 'Trend' && !isLongOriginalData">
      <Trend
        key="trend"
        sid="trend"
        :requestParam="requestParam"
        :windowResize="windowResize"
        @trendParamsChange="handleTrendParamsChange"
      />
    </div>
    <!-- 瀑布图固定 -->
    <div class="atlas-waterfall-item mb-10" v-if="chartType === 'Waterfall'">
      <div class="atlas-params-box">
        <span class="mr-10">
          <el-radio-group v-model="waterfallRequestParam.xAxisUnit" @change="handleXAxisUnitChange">
            <el-radio v-for="a in abscissaTypes" :key="a.value" :label="a.value">{{ $t(a.label) }}</el-radio>
          </el-radio-group>
        </span>
      </div>
      <Waterfall key="waterfall" sid="waterfall" :requestParam="waterfallRequestParam" :windowResize="windowResize" />
    </div>
    <!-- 动态可添加和删除的图谱 -->
    <template v-if="componentList.length > 0">
      <div class="component-list-wrapper">
        <better-scroll ref="wrapper" :data="componentList" :scrollbarFade="false" :scrollbarInteractive="true">
          <ul>
            <li v-for="item in componentList" :key="item.component" class="atlas-item mb-10">
              <i class="el-icon-circle-close font-16 atlas-item--close" @click="delComponent(item.component)"></i>
              <div class="atlas-params-box">
                <span class="mr-10" v-show="['Spectrum', 'Envelope'].includes(item.component)">
                  <el-radio-group
                    v-model="item.requestParam.xAxisUnit"
                    @change="(e) => handleParamChange(e, 'xAxisUnit', item)"
                  >
                    <el-radio
                      v-for="a in item.component === 'Envelope' ? abscissaTypes : abscissaTypes2"
                      :key="a.value"
                      :label="a.value"
                      >{{ $t(a.label) }}</el-radio
                    >
                  </el-radio-group>
                </span>
                <span class="split-line" v-show="['Spectrum', 'Envelope'].includes(item.component)"></span>
                <span class="ml-10">
                  <el-radio-group
                    v-model="item.requestParam.extensionType"
                    @change="(e) => handleParamChange(e, 'extensionType', item)"
                  >
                    <el-radio v-for="e in extensionTypes" :key="e.value" :label="e.value">{{ $t(e.label) }}</el-radio>
                  </el-radio-group>
                </span>
              </div>
              <component
                :key="item.component"
                :sid="item.component"
                :is="item.component"
                :requestParam="item.requestParam"
                :windowResize="windowResize"
              ></component>
            </li>
          </ul>
        </better-scroll>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import BetterScroll from '@/components/better-scroll/index.vue';
import { abscissaTypes, extensionTypes, compareChartTypes } from '@/util/selectTypes';
import * as FileSaver from 'file-saver';
import screenfull from 'screenfull';
import mixin1 from './mixin1';
import AtlasButton from './components/atlas-button.vue';
import Trend from './atlas/trend.vue';
import Waveform from './atlas/waveform.vue';
import Spectrum from './atlas/spectrum.vue';
import Envelope from './atlas/envelope.vue';
import CepstrumSpectrum from './atlas/cepstrumspectrum.vue';
import Waterfall from './atlas/waterfall.vue';
import FanReportModal from './components/fanReportModal.vue';
import ReportListModal from './components/reportListModal.vue';
import WindFarmReportListModal from './components/windFarmReportListModal.vue';
import exportDataModal from './components/exportDataModal.vue';

export default {
  name: 'LayoutMain',
  mixins: [mixin1],
  components: {
    BetterScroll,
    AtlasButton,
    Trend,
    Waveform,
    Spectrum,
    Envelope,
    CepstrumSpectrum,
    Waterfall,
  },
  props: {
    // 右侧查询条件
    requestParam: {
      type: Object,
      default: () => {},
    },
    chartType: {
      type: String,
      default: 'Trend',
    },
  },
  data() {
    return {
      abscissaTypes,
      extensionTypes,
      compareChartTypes,
      componentList: [
        {
          component: 'Waveform',
          requestParam: {
            xAxisUnit: 'Hz',
            extensionType: 'accelerated',
          },
        },
      ],
      trendParam: {},
      waterfallRequestParam: {},
      windFarmId: '',
      isLongOriginalData: false,
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList', 'hierarchy', 'machineHierarchies', 'selectedNodes']),
    ...mapState('cms/chart', ['sensorList']),
    componentNameList() {
      return this.componentList.map((i) => i.component);
    },
    abscissaTypes2() {
      return this.abscissaTypes.concat([{ value: 'STFT', label: 'routineAtlas.STFT' }]);
    },
  },
  watch: {
    chartType(val) {
      if (val === 'Waterfall') {
        this.componentList = [];
        this.trendParam = {};
      }
    },
    requestParam(val) {
      const xAxisUnit = this.waterfallRequestParam.xAxisUnit;
      this.waterfallRequestParam = {
        ...cloneDeep(val),
        xAxisUnit: xAxisUnit || 'Hz',
      };
      if (this.chartType !== 'Waterfall') {
        if (val.identifierOriginalDataType === 'longOriginalData') {
          this.isLongOriginalData = true;
          this.componentList.forEach((item) => {
            item.requestParam = cloneDeep(val);
          });
          // 如果是长波形，就将趋势图传递的参数覆盖
          this.trendParam = cloneDeep(val);
          // 如果是长波形，吧component-list-wrapper高度做修改
          document.querySelector('.component-list-wrapper').style.height = 'calc(100% - 30px)';
          return;
        }
        // 如果不是长波形，吧component-list-wrapper高度做修改
        document.querySelector('.component-list-wrapper').style.height = 'calc(100% - 354px)';
        this.isLongOriginalData = false;
      }
    },
  },
  mounted() {
    if (this.passList && this.passList.length > 0) {
      const obj = this.passList[0];
      if (obj.type === 'WORKSHOP') this.windFarmId = obj.id;
    }
  },
  methods: {
    handleTrendParamsChange(trendParam) {
      this.trendParam = trendParam;
      this.componentList.forEach((item) => {
        item.requestParam = {
          ...trendParam,
          xAxisUnit: item.requestParam.xAxisUnit,
          extensionType: item.requestParam.extensionType,
        };
      });
    },
    handleXAxisUnitChange() {
      this.waterfallRequestParam = { ...this.waterfallRequestParam };
    },
    addComponent(component) {
      const type = component === 'Waterfall' ? 'Waterfall' : 'Trend';
      this.$emit('chartTypeChange', type);
      if (component === 'Waterfall') return;
      const idx = this.componentList.findIndex((item) => item.component === component);
      if (idx > -1) {
        return;
      }
      this.componentList.push({
        component,
        requestParam: {
          ...this.trendParam,
          xAxisUnit: 'Hz',
          extensionType: 'accelerated',
        },
      });
    },
    delComponent(component) {
      const idx = this.componentList.findIndex((item) => item.component === component);
      if (idx === -1) {
        return;
      }
      this.componentList.splice(idx, 1);
    },
    handleParamChange(e, property, item) {
      item.requestParam = {
        ...item.requestParam,
        [property]: e,
      };
    },
    // 生成风机记录报告
    createFanRecord() {
      if (this.hierarchy.type === 'WORKSHOP') {
        return this.$msg.error(this.$t('routineAtlas.selectSensor'));
      }
      const winData = {};
      this.$modal.show(this.$t('routineAtlas.selectTypes.exportRecord'), FanReportModal, winData, '850px');
    },
    // 打开风机记录报告列表
    openFanRecordList() {
      const winData = {};
      this.$modal.show(this.$t('routineAtlas.recordList'), ReportListModal, winData, '800px');
    },
    // 生成风场记录报告
    createWindFarm() {
      this.$api.projectSet
        .createWindFarmReport()
        .then((res) => {
          if (!res || !res.success) return false;
          this.$msg.success(this.$t('routineAtlas.createWindSuccess'));
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // 打开风场记录报告列表
    openWindFarmList() {
      const winData = {};
      this.$modal.show(this.$t('routineAtlas.recordList'), WindFarmReportListModal, winData, '800px');
    },
    // 导出数据，跳转到历史数据
    exprotData() {
      const winData = this.selectedNodes;
      this.$modal.show(this.$t('routineAtlas.selectTypes.exportData'), exportDataModal, winData, '500px');
    },
  },
};
</script>

<style lang="less" scoped>
.layout-main {
  position: relative;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  .split-line {
    display: inline-block;
    width: 1px;
    height: 16px;
    vertical-align: middle;
    background-color: rgba(255, 255, 255, 0.85);
  }
  .atlas-item {
    width: 100%;
    height: 306px;
    position: relative;
    background-color: #0a283f;
    .atlas-item--close {
      position: absolute;
      top: 10px;
      right: 10px;
      color: rgba(255, 255, 255, 0.85);
      z-index: 1000;
      cursor: pointer;
      &:hover {
        color: #46a6ff;
      }
    }
    .atlas-params-box {
      position: absolute;
      top: 10px;
      right: 70px;
      z-index: 1000;
    }
  }
  .atlas-waterfall-item {
    width: 100%;
    height: 600px;
    position: relative;
    background-color: #0a283f;
    .atlas-params-box {
      position: absolute;
      top: 10px;
      right: 100px;
      z-index: 1000;
    }
  }
  .component-list-wrapper {
    position: relative;
    width: 100%;
    height: calc(100% - 354px);
    ul {
      margin: 0;
      padding: 0;
    }
    li {
      list-style: none;
    }
  }
}
</style>
