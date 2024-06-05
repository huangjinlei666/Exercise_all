<template>
  <div class="myChart" ref="stftChart"></div>
</template>
<script>
import * as echarts from 'echarts';
import { mapState } from 'vuex';
import { extractWorkshopId, isValueExist } from '@/util/commonService';

export default {
  name: 'Spectrum',
  props: {
    requestParam: { type: Object, default: () => {} },
    inputValue: { type: Object, default: () => {} },
  },
  data() {
    return {
      chart: null,
      chartData: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    this.chart = echarts.init(this.$refs.stftChart);
    this.chart.resize();
    this.renderChart(this.requestParam);
  },
  watch: {
    inputValue: {
      handler(value) {
        const val = JSON.stringify(value);
        if (val !== '{}') {
          this.request(this.requestParam, value);
          return;
        }
        this.request(this.requestParam);
      },
    },
  },
  methods: {
    renderChart(param) {
      this.request(param);
    },
    toDrawBlank() {
      let extensionType = 'accelerated';
      if (this.requestParam && this.requestParam.extensionType) {
        extensionType = this.requestParam.extensionType;
      }
      const res = {
        xAxis: [],
        yAxis: [],
        textObj: {
          sensorName: '--',
          identifierName: this.$t('routineAtlas.accelerationPeak'),
          identifierValue: '--',
          identifierUnit: 'm/s²',
          xAxisUnit: 'hz',
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          dataType: 'HISTORY',
          extensionType,
        },
      };
      this.draw(res);
    },
    request(param, value) {
      const { machineId, sensorId, dataType, startAt, endAt, xAxisUnit, velocitySensorId, extensionType } = param;
      const workshopId = extractWorkshopId(this.passList, machineId);
      if (!sensorId || !xAxisUnit || startAt === endAt) {
        // 空请求数据，直接绘制空图
        this.$nextTick(() => {
          this.toDrawBlank();
        });
        return;
      }
      const params = {
        workshopId,
        pageOffset: '',
        dataType,
        startAt,
        endAt,
        type: xAxisUnit,
        velocitySensorId,
        extensionType,
        windowsLength: value ? value.windowsLength : '8192',
        overlap: value ? value.overlap : '5000',
        evaluateFs: value ? value.evaluateFs : '1000',
      };
      // 加载中
      this.chart &&
        this.chart.showLoading({
          textColor: 'rgba(255, 255, 255, 0.85)',
          maskColor: 'rgba(10, 40, 63, 0.8)',
        });
      this.$api.routineAtlas
        .getSpectrumMap(sensorId, params)
        .then((res) => {
          if (!res || !res.data || !res.data.length) {
            this.toDrawBlank();
            return;
          }
          const data = this.mockData(res.data[0].colormap);
          // 绘图
          this.draw(data.xData, data.yData, data.chartData, data.max);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          // 加载停止
          this.chart && this.chart.hideLoading();
        });
      // const data = this.mockData(this.testData.data[0].colormap);
      // // 绘图
      // this.draw(data.xData, data.yData, data.chartData);
    },
    mockData(colormap) {
      const xData = [];
      const yData = [];
      const colorData = [];
      const chartData = [];
      for (let i = 0; i < colormap.length; i += 1) {
        const [x, y, v] = colormap[i];
        const a = xData.indexOf(x);
        const b = yData.indexOf(y);
        let m = a;
        let n = b;
        if (a === -1) {
          m = xData.length;
          xData.push(x);
        }
        if (b === -1) {
          n = yData.length;
          yData.push(y);
        }
        colorData.push(v);
        chartData.push([m, n, v]);
      }
      colorData.length === 0 && colorData.push(0);
      const max = Math.max(...colorData);
      return { xData, yData, chartData, max };
    },
    draw(xData, yData, chartData, max) {
      const option = {
        title: {
          text: 'chartTitleText',
          textStyle: {
            fontSize: 0,
            lineHeight: 0,
            color: 'rgba(255, 255, 255, 0)',
          },
          left: 'center',
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: xData,
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
        },
        yAxis: {
          type: 'category',
          data: yData,
          axisLine: {
            lineStyle: {
              color: '#fff',
            },
          },
        },
        visualMap: {
          min: 0,
          max,
          left: 'right',
          top: 'center',
          calculable: true,
          realtime: false,
          textStyle: {
            color: '#fff',
          },
          inRange: {
            color: [
              '#313695',
              '#4575b4',
              '#74add1',
              '#abd9e9',
              '#e0f3f8',
              '#ffffbf',
              '#fee090',
              '#fdae61',
              '#f46d43',
              '#d73027',
              '#a50026',
            ],
          },
        },
        series: [
          {
            name: 'STFT',
            type: 'heatmap',
            data: chartData,
            emphasis: {
              itemStyle: {
                borderColor: '#333',
                borderWidth: 1,
              },
            },
            progressive: 1000,
            animation: false,
          },
        ],
      };

      this.chart && this.chart.setOption(option, true);
    },
  },
};
</script>
<style lang="less" scoped>
.myChart {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
