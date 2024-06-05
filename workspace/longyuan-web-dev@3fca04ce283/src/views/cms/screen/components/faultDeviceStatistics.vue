<template>
  <div class="fault-device-statistics sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.equipmentStatistics') }}</span>
    </div>
    <div id="fault-device-statistics-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'FaultDeviceStatistics',
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    ...mapState('cms/pass', ['passProjectId']),
  },
  mounted() {
    this.chart = echarts.init(document.getElementById('fault-device-statistics-chart'));
    this.chart.resize();
    window.addEventListener('resize', this.onWindowResize, false);
    this.initData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.onWindowResize = () => false;
    this.chart = null;
  },
  methods: {
    initData() {
      const { hierarchyId } = this.$route.query;
      this.fetchComponentFailure(hierarchyId);
    },
    // 获取风机部件故障原因
    fetchComponentFailure(id) {
      if (!id) {
        return;
      }
      this.chart && this.chart.showLoading();
      this.$api.screen
        .getComponentFailure(id)
        .then((res) => {
          const xData = [];
          const yData = [];
          if (res && res.length > 0) {
            for (let i = 0; i < res.length; i += 1) {
              xData.push(res[i].partName);
              yData.push(res[i].faultTotal);
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
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            name: this.$t('screen.type'),
            nameTextStyle: {
              color: '#8E929E',
            },
            axisLabel: {
              color: '#8E929E',
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            data: xData,
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: this.$t('screen.quantityTime'),
            nameTextStyle: {
              color: '#8E929E',
            },
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
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        ],
        series: [
          {
            type: 'bar',
            barWidth: '25%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#33d8ed' },
                { offset: 1, color: '#05e9a0' },
              ]),
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
.fault-device-statistics {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  #fault-device-statistics-chart {
    width: 100%;
    height: calc(100% - 20px);
  }
}
</style>
