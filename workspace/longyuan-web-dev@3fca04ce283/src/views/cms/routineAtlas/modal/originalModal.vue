<template>
  <div id="original-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="clearfix mb-10">
        <div class="mb-10">
          <el-radio-group v-model="extensionType" @change="handleExtensionTypeChange">
            <el-radio label="accelerated">{{ $t('routineAtlas.accelerationAxis') }}</el-radio>
            <el-radio label="speed">{{ $t('routineAtlas.speedAxis1') }}</el-radio>
          </el-radio-group>
        </div>
        <div class="pull-left">
          <!-- 图谱类型 -->
          <!-- <el-select
            size="mini"
            class="width-130"
            :value="chartType"
            :placeholder="$t('routineAtlas.selectTypes.chartType')"
            @change="handleChartTypeChange"
          >
            <el-option
              v-for="ch in originalChartTypes"
              :key="ch.value"
              :label="$t(ch.label)"
              :value="ch.value"
            ></el-option>
          </el-select> -->
          <cms-operate-btns
            :number="3"
            :btns="originalChartTypes"
            :current="chartType"
            @change="handleChartTypeChange"
          ></cms-operate-btns>
        </div>
        <div class="pull-right">
          <!-- 趋势图倍频 -->
          <span v-if="chartType === 'TrendDoubling'">
            <el-select
              size="mini"
              class="width-130"
              v-model="trendDoubling"
              :placeholder="$t('routineAtlas.placeholder.trendDoubling')"
              @change="handleDoublingChange"
            >
              <el-option
                v-for="item in trendDoublingTypes"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
              ></el-option>
            </el-select>
          </span>
          <!-- 横坐标单位 -->
          <span v-if="this.chartType === 'Envelope' || this.chartType === 'Spectrum'">
            <el-select
              size="mini"
              class="width-130"
              v-model="xAxisUnit"
              :placeholder="$t('routineAtlas.placeholder.xAxisUnit')"
              @change="handleXAxisUnitChange"
            >
              <el-option v-for="a in abscissaTypes" :key="a.value" :label="$t(a.label)" :value="a.value"></el-option>
            </el-select>
          </span>
          <!-- 数据类型 -->
          <el-select
            size="mini"
            class="width-130"
            v-model="dataType"
            :placeholder="$t('routineAtlas.placeholder.dataType')"
            @change="handleDataTypeChange"
          >
            <el-option v-for="d in dataTypes" :key="d.value" :label="$t(d.label)" :value="d.value"></el-option>
          </el-select>
        </div>
      </div>
      <div class="echarts-item">
        <div class="echarts-item-l">
          <template v-if="identifierList && identifierList.length > 0">
            <better-scroll ref="wrapper" :data="identifierList" :scrollX="true">
              <ul>
                <li>
                  <AtalsIdentifierElement
                    v-for="identifier in identifierList"
                    :key="identifier.id"
                    :name="identifier.name"
                    :value="identifier.value"
                    :unit="identifier.unit"
                  />
                </li>
              </ul>
            </better-scroll>
          </template>
        </div>
        <div class="echarts-item-r">
          <component
            key="chartOriginal"
            sid="chartOriginal"
            :is="curentComponent"
            :requestParam="requestParam"
            :windowResize="windowResize"
            @on-chart-item-add="handleChartItemAdd"
            @on-chart-item-remov="handleChartItemRemove"
          ></component>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { originalChartTypes, trendDoublingTypes, dataTypes, abscissaTypes } from '@/util/selectTypes';
import CmsOperateBtns from '@/components/cms-operate-btns/index.vue';
import BetterScroll from '@/components/better-scroll/index.vue';
import { identifierSort } from '@/util/commonService';
import mixin1 from '../mixin1';
import Waveform from '../atlas/waveform.vue';
import Spectrum from '../atlas/spectrum.vue';
import Envelope from '../atlas/envelope.vue';
import CepstrumSpectrum from '../atlas/cepstrumspectrum.vue';
import TrendDoubling from '../atlas/trenddoubling.vue';
import AtalsIdentifierElement from '../components/atlas-identifier-element.vue';

export default {
  mixins: [modalMixin, mixin1],
  name: 'OriginalModal',
  components: {
    CmsOperateBtns,
    Waveform,
    Spectrum,
    Envelope,
    CepstrumSpectrum,
    TrendDoubling,
    AtalsIdentifierElement,
    BetterScroll,
  },
  data() {
    return {
      originalChartTypes,
      trendDoublingTypes,
      dataTypes,
      abscissaTypes,
      chartType: 'Waveform',
      requestParam: null,
      curentComponent: 'Waveform',
      trendDoubling: '', // 趋势图倍频（趋势图倍频图）
      xAxisUnit: '', // 横坐标单位（频谱图、包络分析图）
      dataType: '', // 查询类型，历史数据/实时数据
      extensionType: 'accelerated', // 默认加速度，可切换为速度
      subChartItem: null, // 子组件对象---图谱
    };
  },
  computed: {
    identifierList() {
      if (!this.requestParam) {
        return [];
      }
      const { identifierList } = this.requestParam;
      if (!identifierList || identifierList.length === 0) {
        return [];
      }
      const ret = [];
      identifierList.forEach((i) => {
        const { identifier, name, value, metadata } = i;
        if (value !== undefined && value !== null && value !== '') {
          ret.push({
            id: identifier,
            name,
            value,
            unit: metadata && metadata.unit,
          });
        }
      });
      return identifierSort(ret);
    },
  },
  mounted() {
    const { requestParam } = this.options.winData;
    this.dataType = requestParam.dataType;
    this.$nextTick(() => {
      this.requestParam = { ...requestParam, extensionType: this.extensionType };
    });
  },
  methods: {
    handleCancel() {
      if (this.subChartItem) {
        this.subChartItem.toDestroy();
      }
      if (this.options.cancel) {
        this.options.cancel();
      }
      this.$modal.hide();
      this.visible = false;
    },
    handleChartItemAdd(item) {
      if (item) {
        this.subChartItem = item;
      }
    },
    handleChartItemRemove(item) {
      if (item && this.subChartItem === item) {
        this.subChartItem = null;
      }
    },
    handleChartTypeChange(type) {
      this.chartType = type;
      this.curentComponent = type;
      this.setSelectParams();
      this.setRequestParam();
    },
    setSelectParams() {
      if (this.chartType === 'TrendDoubling') {
        this.trendDoubling = '1';
      } else {
        this.trendDoubling = '';
      }
      if (this.chartType === 'Envelope' || this.chartType === 'Spectrum') {
        !this.xAxisUnit && (this.xAxisUnit = 'Hz');
      } else {
        this.xAxisUnit = '';
      }
    },
    setRequestParam() {
      const newParam = {
        dataType: this.dataType,
      };
      if (this.trendDoubling) {
        newParam.trendDoubling = this.trendDoubling;
      }
      if (this.xAxisUnit) {
        newParam.xAxisUnit = this.xAxisUnit;
        newParam.type = this.xAxisUnit;
      }
      this.$nextTick(() => {
        this.requestParam = { ...this.requestParam, ...newParam };
      });
    },
    handleDoublingChange(trendDoubling) {
      this.requestParam = { ...this.requestParam, trendDoubling };
    },
    handleXAxisUnitChange(xAxisUnit) {
      this.requestParam = { ...this.requestParam, xAxisUnit, type: xAxisUnit };
    },
    handleDataTypeChange(dataType) {
      this.requestParam = { ...this.requestParam, dataType };
    },
    handleExtensionTypeChange(extensionType) {
      this.requestParam = { ...this.requestParam, extensionType };
    },
  },
};
</script>
<style lang="less">
#original-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 800px;
      overflow: auto;
    }
  }
  .echarts-item {
    height: 620px;
    position: relative;
    font-size: 0;
    .echarts-item-l {
      position: relative;
      display: inline-block;
      width: 18%;
      height: 100%;
      box-sizing: border-box;
      border: 1px solid #d9d9d9;
      border-radius: 3px;
      font-size: 14px;
      vertical-align: middle;
      &:hover {
        border-color: #1890ff;
      }
      ul {
        margin: 0;
        padding: 0;
        width: 100%;
        min-width: max-content;
      }
      li {
        list-style: none;
      }
    }
    .echarts-item-r {
      position: relative;
      display: inline-block;
      width: 82%;
      height: 100%;
      font-size: 14px;
      vertical-align: middle;
    }
  }
}
</style>
