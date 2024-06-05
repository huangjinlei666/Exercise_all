<template>
  <div id="compare-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="clearfix mb-10">
        <div class="pull-left">
          <!-- 图谱类型 -->
          <AtlasButton
            style="margin-right: 10px"
            v-for="type in compareChartTypes"
            :key="type.value"
            :isSelect="chartType === type.value"
            @click="handleChartTypeChange(type.value)"
          >
            {{ $t(type.label) }}
          </AtlasButton>
        </div>
        <div class="pull-right">
          <!-- 横坐标单位 -->
          <span class="mr-10" v-show="['Spectrum', 'Envelope'].includes(this.chartType)">
            <el-radio-group v-model="xAxisUnit" @change="handleXAxisUnitChange">
              <el-radio v-for="a in abscissaTypes" :key="a.value" :label="a.value">{{ $t(a.label) }}</el-radio>
            </el-radio-group>
          </span>
          <span class="split-line" v-show="['Spectrum', 'Envelope'].includes(this.chartType)"></span>
          <!-- 特征值类型 -->
          <span class="ml-10">
            <el-radio-group v-model="extensionType" @change="handleExtensionTypeChange">
              <el-radio v-for="e in extensionTypes" :key="e.value" :label="e.value">{{ $t(e.label) }}</el-radio>
            </el-radio-group>
          </span>
        </div>
      </div>
      <div class="chartContainer">
        <div class="echarts-container" v-if="echartShow1">
          <el-tag size="medium">{{ requestParam1.sensorName + ' / ' + requestParam1.identifierName }}</el-tag>
          <div class="echarts-item">
            <component
              key="chart1"
              sid="chart1"
              :is="curentComponent"
              :requestParam="requestParam1"
              :windowResize="windowResize"
              :isCompare="true"
            ></component>
          </div>
        </div>
        <div class="echarts-container" v-if="echartShow2">
          <el-tag size="medium">{{ requestParam2.sensorName + ' / ' + requestParam2.identifierName }}</el-tag>
          <div class="echarts-item">
            <component
              key="chart2"
              sid="chart2"
              :is="curentComponent"
              :requestParam="requestParam2"
              :windowResize="windowResize"
              :isCompare="true"
            ></component>
          </div>
        </div>
        <div class="echarts-container" v-if="echartShow3">
          <el-tag size="medium">{{ requestParam3.sensorName + ' / ' + requestParam3.identifierName }}</el-tag>
          <div class="echarts-item">
            <component
              key="chart3"
              sid="chart3"
              :is="curentComponent"
              :requestParam="requestParam3"
              :windowResize="windowResize"
              :isCompare="true"
            ></component>
          </div>
        </div>
        <div class="echarts-container" v-if="echartShow4">
          <el-tag size="medium">{{ requestParam4.sensorName + ' / ' + requestParam4.identifierName }}</el-tag>
          <div class="echarts-item">
            <component
              key="chart4"
              sid="chart4"
              :is="curentComponent"
              :requestParam="requestParam4"
              :windowResize="windowResize"
              :isCompare="true"
            ></component>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { compareChartTypes, extensionTypes, abscissaTypes } from '@/util/selectTypes';
import mixin1 from '../mixin1';
import AtlasButton from '../components/atlas-button.vue';
import Waveform from '../atlas/waveform.vue';
import Spectrum from '../atlas/spectrum.vue';
import Envelope from '../atlas/envelope.vue';
import CepstrumSpectrum from '../atlas/cepstrumspectrum.vue';

export default {
  mixins: [modalMixin, mixin1],
  name: 'CompareModal',
  components: {
    AtlasButton,
    Waveform,
    Spectrum,
    Envelope,
    CepstrumSpectrum,
  },
  data() {
    return {
      compareChartTypes,
      extensionTypes,
      abscissaTypes,
      chartType: '',
      curentComponent: '',
      requestParamList: [],
      requestParam1: null,
      requestParam2: null,
      requestParam3: null,
      requestParam4: null,
      echartShow1: false,
      echartShow2: false,
      echartShow3: false,
      echartShow4: false,
      xAxisUnit: '', // 横坐标单位（频谱图、包络分析图）
      extensionType: 'accelerated', // 默认加速度，可切换为速度
    };
  },
  mounted() {
    const { chartType, requestParamList } = this.options.winData;
    this.chartType = chartType;
    this.curentComponent = chartType;
    this.requestParamList = requestParamList;
    this.requestParamList.forEach((r, i) => {
      this[`echartShow${i + 1}`] = true;
      this[`requestParam${i + 1}`] = { ...r, extensionType: this.extensionType };
    });
    this.setSelectParams();
    this.setRequestParam();
  },
  methods: {
    handleChartTypeChange(type) {
      this.chartType = type;
      this.curentComponent = type;
      this.setSelectParams();
      this.setRequestParam();
    },
    setSelectParams() {
      if (['Envelope', 'Spectrum'].includes(this.chartType)) {
        !this.xAxisUnit && (this.xAxisUnit = 'Hz');
      } else {
        this.xAxisUnit = '';
      }
    },
    setRequestParam() {
      const newParam = {};
      if (this.xAxisUnit) {
        newParam.xAxisUnit = this.xAxisUnit;
      }
      this.$nextTick(() => {
        this.echartShow1 && (this.requestParam1 = { ...this.requestParam1, ...newParam });
        this.echartShow2 && (this.requestParam2 = { ...this.requestParam2, ...newParam });
        this.echartShow3 && (this.requestParam3 = { ...this.requestParam3, ...newParam });
        this.echartShow4 && (this.requestParam4 = { ...this.requestParam4, ...newParam });
      });
    },
    handleXAxisUnitChange(xAxisUnit) {
      const newParam = {
        xAxisUnit,
      };
      this.echartShow1 && (this.requestParam1 = { ...this.requestParam1, ...newParam });
      this.echartShow2 && (this.requestParam2 = { ...this.requestParam2, ...newParam });
      this.echartShow3 && (this.requestParam3 = { ...this.requestParam3, ...newParam });
      this.echartShow4 && (this.requestParam4 = { ...this.requestParam4, ...newParam });
    },
    handleExtensionTypeChange(extensionType) {
      this.echartShow1 && (this.requestParam1 = { ...this.requestParam1, extensionType });
      this.echartShow2 && (this.requestParam2 = { ...this.requestParam2, extensionType });
      this.echartShow3 && (this.requestParam3 = { ...this.requestParam3, extensionType });
      this.echartShow4 && (this.requestParam4 = { ...this.requestParam4, extensionType });
    },
  },
};
</script>
<style lang="less">
#compare-modal {
  .el-dialog__wrapper {
    .el-dialog {
      background-color: #07172d;
      .el-dialog__header {
        .el-dialog__title {
          color: rgba(255, 255, 255, 0.85);
        }
      }
      .el-dialog__body {
        max-height: 800px;
        overflow: auto;
      }
    }
  }
  .split-line {
    display: inline-block;
    width: 1px;
    height: 16px;
    vertical-align: middle;
    background-color: rgba(255, 255, 255, 0.85);
  }
  .chartContainer {
    position: relative;
    width: 100%;
    font-size: 0;
    .echarts-container {
      width: calc(50% - 4px);
      display: inline-block;
      margin: 0 2px 10px;
      box-sizing: border-box;
      padding: 10px;
      vertical-align: middle;
      background-color: #0a283f;
      .echarts-item {
        width: 100%;
        height: 306px;
        position: relative;
        margin-top: 5px;
      }
    }
  }
}
</style>
