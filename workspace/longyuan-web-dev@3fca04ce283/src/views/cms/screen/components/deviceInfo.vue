<template>
  <div class="device-info sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.deviceInfo') }}</span>
    </div>
    <div class="echarts-box">
      <div id="fan"></div>
      <div id="fault-fan"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'DeviceInfo',
  props: {
    windowResize: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fanData: [],
      FaultData: [],
      chartFan: null,
      chartFaultFan: null,
    };
  },
  mounted() {
    const { hierarchyId } = this.$route.query;
    this.fetchFanData(hierarchyId);
    this.chartFan = echarts.init(document.getElementById('fan'));
    this.chartFaultFan = echarts.init(document.getElementById('fault-fan'));
    this.chartFan.resize();
    this.chartFaultFan.resize();
  },
  watch: {
    windowResize() {
      this.chartFan && this.chartFan.resize();
      this.chartFaultFan && this.chartFaultFan.resize();
    },
  },
  methods: {
    fetchFanData(id) {
      if (!id) {
        return;
      }
      Promise.all([this.$api.screen.getFanCondition(id), this.$api.screen.getMachineStatisticsByHierarchyId(id)])
        .then(([res1, res2]) => {
          if (res1) {
            this.fanData.push({ value: res1.machineTotal, name: this.$t('screen.workFan') });
            this.fanData.push({ value: res1.onlineTotal, name: this.$t('screen.monitoringFan') });
            this.draw(this.fanData);
          }
          if (res2 && res2.data) {
            this.FaultData.push({ value: res2.data.warningLevelAttention, name: this.$t('screen.attentionFan') });
            this.FaultData.push({ value: res2.data.warningLevelError, name: this.$t('screen.alarmFan') });
            this.FaultData.push({ value: res2.data.faultLevelFault, name: this.$t('screen.falutFan') });
            this.drawFault(this.FaultData);
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    draw(data) {
      const optionFan = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 5,
          left: '36%',
          top: 'middle',
          textStyle: {
            rich: {
              a: {
                fontSize: 12,
                color: '#fff',
              },
              b: {
                fontSize: 14,
                color: '#fffffF',
                padding: [0, 0, 0, 10],
              },
              c: {
                fontSize: 14,
                color: '#fffffF',
                padding: [0, 0, 0, 2],
              },
            },
          },
          formatter(name) {
            const chartData = optionFan.series[0].data;
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
            const arr = [`{a|${name}}`, `{b|${tarValue}}`];
            return arr.join(' ');
          },
          bottom: '1%',
        },
        color: ['#73DEBD', '#4C98FB'],
        series: [
          {
            type: 'pie',
            radius: ['55%', '75%'],
            center: ['20%', '50%'],
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
      this.chartFan && this.chartFan.setOption(optionFan);
      this.chartFan && this.chartFan.resize();
    },
    drawFault(data) {
      const optionFault = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 5,
          left: '36%',
          top: 'middle',
          textStyle: {
            rich: {
              a: {
                fontSize: 12,
                color: '#fff',
              },
              b: {
                fontSize: 14,
                color: '#fffffF',
                padding: [0, 0, 0, 10],
              },
              c: {
                fontSize: 14,
                color: '#fffffF',
                padding: [0, 0, 0, 2],
              },
            },
          },
          formatter(name) {
            const chartData = optionFault.series[0].data;
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
            const arr = [`{a|${name}}`, `{b|${tarValue}}`];
            return arr.join(' ');
          },
          bottom: '1%',
        },
        color: ['#f8cf00', '#df3317', '#4C98FB'],
        series: [
          {
            type: 'pie',
            radius: ['55%', '75%'],
            center: ['20%', '50%'],
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
      this.chartFaultFan && this.chartFaultFan.setOption(optionFault);
      this.chartFaultFan && this.chartFaultFan.resize();
    },
  },
};
</script>

<style lang="less" scoped>
.device-info {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  .echarts-box {
    display: flex;
    height: calc(100% - 20px);
    div {
      width: 50%;
      height: 100%;
    }
  }
}
</style>
