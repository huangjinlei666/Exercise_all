<template>
  <div class="device-alarm-trend sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.alarmTrend') }}</span>
    </div>
    <div id="device-alarm-trend-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';

export default {
  name: 'DeviceAlarmTrend',
  props: {
    windowResize: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    windowResize() {
      this.chart && this.chart.resize();
    },
  },
  mounted() {
    this.chart = echarts.init(document.getElementById('device-alarm-trend-chart'));
    this.chart.resize();
    this.initData();
  },
  beforeDestroy() {
    this.chart = null;
  },
  methods: {
    initData() {
      const { hierarchyId } = this.$route.query;
      this.fetchAlarmTrend(hierarchyId);
    },
    // 获取告警趋势数据
    fetchAlarmTrend(id) {
      if (!id) {
        return;
      }
      this.chart && this.chart.showLoading();
      this.$api.screen
        .getAlarmTrend(id)
        .then((res) => {
          const monthData = [];
          const listData = [];
          if (res && res.length > 0) {
            for (let i = 0; i < res.length; i += 1) {
              monthData.unshift(res[i].yearMonth);
              listData.unshift(res[i].alarmTotal);
            }
          }
          this.draw(monthData, listData);
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
    draw(monthData, listData) {
      if (monthData.length === 0 || listData.length === 0) {
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
            type: 'line', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: '2%',
          right: '8%',
          bottom: '10%',
          top: '22%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            name: this.$t('screen.month'),
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
            boundaryGap: false,
            data: monthData,
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
                color: 'rgba(255, 255, 255, 0.25)',
              },
            },
          },
        ],
        series: [
          {
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 4,
              color: '#47a0f5',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0.5,
                x2: 1,
                y2: 0.5,
                colorStops: [
                  { offset: 0, color: '#1169b1' },
                  { offset: 1, color: '#12b0b4' },
                ],
              },
            },
            data: listData,
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
.device-alarm-trend {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  #device-alarm-trend-chart {
    width: 100%;
    height: 100%;
  }
}
</style>
