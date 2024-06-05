<template>
  <div class="device-status sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.fanFaultStatus') }}</span>
    </div>
    <div id="device-status-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';

export default {
  name: 'DeviceStatus',
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
    this.chart = echarts.init(document.getElementById('device-status-chart'));
    this.chart.resize();
    this.fetchUnitStatus(this.$route.query.hierarchyId);
  },
  beforeDestroy() {
    this.chart = null;
  },
  methods: {
    // 获取机组设备状态数据
    fetchUnitStatus(id) {
      if (!id) {
        return;
      }
      this.chart && this.chart.showLoading();
      this.$api.screen
        .deviceStatus(id)
        .then((res) => {
          console.log(res);
          const data = [];
          let total = 0;
          if (res) {
            total = res.normalTotal + res.attentionTotal + res.errorTotal;
            data.push({ value: res.normalTotal, name: '正常' });
            data.push({ value: res.attentionTotal, name: '注意' });
            data.push({ value: res.errorTotal, name: '报警' });
          }
          this.draw(data, total);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.chart && this.chart.hideLoading();
        });
    },
    onWindowResize: debounce(
      function onWindowResize() {
        this.chart && this.chart.resize();
      },
      300,
      { leading: false, trailing: true }
    ),
    draw(data, total) {
      const option = {
        tooltip: {
          trigger: 'item',
          // formatter: '{b} : {c} ({d}%)',
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
            let tarValue;
            for (let i = 0; i < chartData.length; i += 1) {
              if (chartData[i].name === name) {
                tarValue = chartData[i].value;
              }
            }
            let percentage = null;
            total === 0 ? (percentage = 0) : (percentage = ((tarValue / total) * 100).toFixed(2));
            const arr = [`{a|${name}}`, `{b|${tarValue}}`, `{c|(${percentage}%)}`];
            return arr.join(' ');
          },
          top: 'center',
          left: '35%',
        },
        color: ['#64c42d', '#f8cf00', '#df3317'],

        series: [
          {
            // name: this.$t('screen.deviceStatus'),
            type: 'pie',
            radius: ['65%', '85%'],
            right: '65%',
            top: '5%',
            startAngle: 240,
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '12',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
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
  #device-status-chart {
    width: 100%;
    height: calc(100% - 20px);
  }
}
</style>
