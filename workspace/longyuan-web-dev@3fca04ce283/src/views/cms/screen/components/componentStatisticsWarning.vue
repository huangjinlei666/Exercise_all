<template>
  <div class="device-status sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.componentStatisticsWarning') }}</span>
    </div>
    <div id="warning-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'componentStatisticsWarning',
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
    this.chart = echarts.init(document.getElementById('warning-chart'));
    this.chart.resize();
    window.addEventListener('resize', this.onWindowResize, false);
    this.getComponentAlarm(this.$route.query.hierarchyId);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.onWindowResize = () => false;
    this.chart = null;
  },
  methods: {
    getComponentAlarm(id) {
      if (!id) {
        return;
      }
      this.chart && this.chart.showLoading();
      this.$api.screen.getComponentAlarm(id).then((res) => {
        this.chart && this.chart.hideLoading();
        const data = JSON.parse(
          JSON.stringify(res)
            .replace(/partName/g, 'name')
            .replace(/faultTotal/g, 'value')
        );
        this.draw(data);
      });
    },
    draw(data) {
      if (data.length === 0) {
        this.chart &&
          this.chart.showLoading({
            text: this.$t('common.nodata'),
            color: 'rgba(255, 255, 255, 0)',
            textColor: '#ccc',
            maskColor: 'rgba(255, 255, 255, 0)',
          });
        return;
      }
      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 7,
          textStyle: {
            rich: {
              a: {
                fontSize: 12,
                color: '#fff',
              },
              b: {
                fontSize: 12,
                color: '#fffffF',
                padding: [0, 0, 0, 10],
              },
              c: {
                fontSize: 12,
                color: '#fffffF',
                padding: [0, 0, 0, 2],
              },
            },
          },
          formatter(name) {
            const chartData = option.series[0].data;
            let chartTotal = 0;
            let tarValue;
            for (let i = 0; i < chartData.length; i += 1) {
              chartTotal += chartData[i].value;
              if (chartData[i].name === name) {
                tarValue = chartData[i].value;
              }
            }
            let percentage = null;
            chartTotal === 0 ? (percentage = 0) : (percentage = ((tarValue / chartTotal) * 100).toFixed(2));
            const arr = [`{a|${name}}`, `{b|${tarValue}}`, `{c|(${percentage}%)}`];
            return arr.join(' ');
          },
          top: 'center',
          left: '35%',
        },
        color: ['#4C98FB', '#83CCE8', '#25C7C8'],
        series: [
          {
            type: 'pie',
            radius: ['65%', '85%'],
            right: '65%',
            top: '5%',
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '12',
              },
            },
            labelLine: {
              show: false,
            },
            data,
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
.device-status {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  #warning-chart {
    width: 100%;
    height: calc(100% - 20px);
  }
}
</style>
