<template>
  <div id="zoom-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="zoom-echart-container">
        <div :ref="'zoom'" class="zoom-echart"></div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as echarts from 'echarts';
import { isValueExist } from '@/util/commonService';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'ZoomModal',
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      const { requestParam, params } = this.options.winData;
      this.chart = echarts.init(this.$refs.zoom);
      this.chart.resize();
      this.toDrawBlank(requestParam);
      this.request(params, requestParam);
    });
  },
  methods: {
    toDrawBlank(requestParam) {
      let extensionType = 'accelerated';
      if (requestParam && requestParam.extensionType) {
        extensionType = requestParam.extensionType;
      }
      const res = {
        xAxis: [],
        yAxis: [],
        textObj: {
          identifierName: requestParam.identifierName,
          xAxisUnit: 'Hz',
          extensionType,
        },
      };
      this.draw(res, { startFrequency: 0, endFrequency: 0 });
    },
    request(params, requestParam) {
      const { xAxisUnit, extensionType, identifierName } = requestParam;
      this.chart &&
        this.chart.showLoading({
          textColor: 'rgba(255, 255, 255, 0.85)',
          maskColor: 'rgba(10, 40, 63, 0.8)',
        });
      this.$api.routineAtlas
        .getSpectralZoom(requestParam.sensorId, params)
        .then((res) => {
          let xAxis = [];
          let yAxis = [];
          let textObj = {};
          if (!res || !res.frequency || res.frequency.length === 0) {
            // 后台返回数据为空，绘制空图
            xAxis = [];
            yAxis = [];
            textObj = {
              identifierName,
              xAxisUnit,
              extensionType,
            };
          } else {
            if (res.frequency && res.frequency.length > 0) {
              xAxis = res.frequency;
            }
            if (res.amplitude && res.amplitude.length > 0) {
              yAxis = res.amplitude;
            }
            textObj = {
              identifierName,
              xAxisUnit,
              extensionType,
            };
          }
          // 绘图
          this.draw(
            {
              xAxis,
              yAxis,
              textObj,
            },
            params
          );
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          // 加载停止
          this.chart && this.chart.hideLoading();
        });
    },
    draw(response, params) {
      const { xAxis, yAxis, textObj } = response;
      const { startFrequency, endFrequency } = params;
      const { xAxisUnit, extensionType } = textObj;

      const identifierName = this.$t('routineAtlas.accelerationPeak');
      const xAxisText = this.$t('routineAtlas.frequencyAxis');
      let yUnit = 'm/s²';
      let yAxisText = `${identifierName}(${yUnit})`;
      if (extensionType === 'speed') {
        yUnit = 'm/s';
        yAxisText = `${identifierName}(${yUnit})`;
      }

      const chartTitleText = this.$t('routineAtlas.selectTypes.zoomSpectrum');

      const data = [];
      for (let i = 0; i < xAxis.length; i += 1) {
        data.push([xAxis[i], yAxis[i]]);
      }

      const _this = this;

      const option = {
        title: {
          text: chartTitleText,
          textStyle: {
            fontSize: 0,
            lineHeight: 0,
            color: 'rgba(255, 255, 255, 0)',
          },
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(5, 87, 169, 0.45)',
          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          formatter(p) {
            return `${xAxisText}: ${isValueExist(p[0].value[0]) ? p[0].value[0] : ''} ${xAxisUnit}<br />
            ${yAxisText}: ${isValueExist(p[0].value[1]) ? p[0].value[1] : ''} ${yUnit}`;
          },
        },
        toolbox: {
          right: 30,
          iconStyle: {
            borderColor: 'rgba(255, 255, 255, 0.85)',
          },
          feature: {
            saveAsImage: {},
          },
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            filterMode: 'none',
            realtime: false,
            start: 0,
            end: 100,
            height: 20,
            bottom: 4,
            backgroundColor: 'transparent',
            borderColor: 'rgba(71, 218, 255, 0.2)',
            fillerColor: 'rgba(220, 226, 235, 0.2)',
            showDetail: false,
          },
        ],
        grid: {
          show: true,
          top: 56,
          bottom: 50,
          left: 80,
          right: 80,
          backgroundColor: '#07172D',
          borderColor: '#07172D',
        },
        xAxis: {
          type: 'value',
          name: `${xAxisText}(${xAxisUnit})`,
          nameTextStyle: {
            color: '#8E929E',
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#8E929E',
          },
          splitLine: {
            show: false,
          },
          min: Math.floor(startFrequency),
          max: Math.ceil(endFrequency),
        },
        yAxis: {
          type: 'value',
          name: yAxisText,
          nameLocation: 'center',
          nameTextStyle: {
            color: '#8E929E',
            padding: [0, 0, 40, 0],
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#8E929E',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        series: [
          {
            name: yAxisText,
            type: 'line',
            data,
            showSymbol: false,
            showAllSymbol: false,
            lineStyle: {
              color: '#02879F',
            },
          },
        ],
      };

      this.chart && this.chart.setOption(option, true);
    },
  },
};
</script>
<style lang="less">
#zoom-modal {
  .el-dialog__wrapper {
    .el-dialog {
      background-color: #07172d;
      .el-dialog__header {
        .el-dialog__title {
          color: rgba(255, 255, 255, 0.85);
        }
      }
      .el-dialog__body {
        max-height: 600px;
        overflow: auto;
      }
    }
  }
  .zoom-echart-container {
    width: 100%;
    height: 306px;
    position: relative;
    .zoom-echart {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
