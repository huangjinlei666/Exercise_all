<template>
  <div class="fault-farm-number sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.faultFarmsTop5') }}</span>
    </div>
    <div id="fault-farm-number-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';

export default {
  name: 'FaultFarmNumber',
  props: {
    faultFarmNumber: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.chart = echarts.init(document.getElementById('fault-farm-number-chart'));
    this.chart.resize();
    window.addEventListener('resize', this.onWindowResize, false);
    this.fetchTopFive(this.$route.query.hierarchyId);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.onWindowResize = () => false;
    this.chart = null;
  },
  methods: {
    // 获取故障风场前五数据
    fetchTopFive(id) {
      if (!id) {
        return;
      }
      this.chart && this.chart.showLoading();
      this.$api.screen
        .getTopfiveFaults(id)
        .then((res) => {
          const xData = [];
          const yData = [];
          if (res && res.length > 0) {
            for (let i = 0; i < res.length; i += 1) {
              xData.push(res[i].name);
              yData.push(res[i].alarmTotal);
            }
          }
          this.draw(xData, yData);
        })
        .catch((err) => {
          this.chart && this.chart.hideLoading();
          this.$msg.error(err);
        });
    },
    onWindowResize: debounce(
      function onWindowResize() {
        this.chart && this.chart.resize();
      },
      300,
      { leading: false, trailing: true }
    ),
    draw(xData, yData) {
      if (xData.length === 0 || yData.length === 0) {
        this.chart &&
          this.chart.showLoading({
            text: this.$t('common.nodata'),
            color: 'rgba(255, 255, 255, 0)',
            textColor: '#ccc',
            maskColor: 'rgba(255, 255, 255, 0)',
          });
        return;
      }
      this.chart && this.chart.hideLoading();
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: '2%',
          right: '8%',
          top: '8%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'value',
            axisLabel: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: 'category',
            axisLabel: {
              color: '#8E929E',
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            data: xData,
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '15',
            label: {
              show: true,
              position: 'right',
              color: '#45E6F0',
              formatter: '{c}次',
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0.5, 1, 0.5, [
                { offset: 0, color: '#00a8ff' },
                { offset: 1, color: '#49d9fa' },
              ]),
              barBorderRadius: [0, 20, 20, 0],
            },
            data: yData,
          },
        ],
      };
      this.chart && this.chart.setOption(option);
      this.chart && this.chart.resize();
    },
  },
};
</script>

<style lang="less" scoped>
.fault-farm-number {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  #fault-farm-number-chart {
    width: 100%;
    height: calc(100% - 20px);
  }
}
</style>
