<template>
  <div class="data-device-info sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <el-row>
      <template v-for="(item, index) in deviceList">
        <el-col :span="8" :key="index">
          <div class="header-top">
            <img src="../../../../assets/images/screen/icon-title.png" alt />
            <span class="sceen-title-text">{{ item }}</span>
          </div>
        </el-col>
      </template>
    </el-row>
    <div class="echarts-box">
      <div id="dataDevice"></div>
      <div id="vibration-sensor"></div>
      <div id="speed-sensor"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import cloneDeep from 'lodash/cloneDeep';
import fanListModal from '../fanListModal.vue';

export default {
  name: 'dataDeviceInfo',
  props: {
    windowResize: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      deviceList: [this.$t('screen.dataDevice'), this.$t('screen.vibrationSensor'), this.$t('screen.speedSensor')],
      fanData: [],
      FaultData: [],
      vibrationSensorData: [], // 震动传感器
      speedSensorData: [], // 转速传感器
      chartFan: null,
      chartFaultFan: null,
      vibrationSensorFan: null,
      speedSensorFan: null,
      // 饼图基本配置
      baseOption: {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'horizontal',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 5,
          left: '0',
          bottom: '0',
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
        },
        color: ['#64c42d', '#919398'],
        series: [
          {
            type: 'pie',
            radius: ['48%', '68%'],
            center: ['40%', '35%'],
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
          },
        ],
      },
      hierarchyId: '',
    };
  },
  watch: {
    windowResize() {
      this.chartFan && this.chartFan.resize();
      this.vibrationSensorFan && this.vibrationSensorFan.resize();
      this.speedSensorFan && this.speedSensorFan.resize();
    },
  },
  mounted() {
    const { hierarchyId } = this.$route.query;
    this.hierarchyId = hierarchyId;
    this.fetchFanData(hierarchyId);
    this.chartFan = echarts.init(document.getElementById('dataDevice'));
    this.vibrationSensorFan = echarts.init(document.getElementById('vibration-sensor'));
    this.speedSensorFan = echarts.init(document.getElementById('speed-sensor'));
    this.chartFan.resize();
    this.vibrationSensorFan.resize();
    this.speedSensorFan.resize();
  },
  methods: {
    fetchFanData(id) {
      if (!id) {
        return;
      }
      Promise.all([
        this.$api.screen.getMachineStatus(id),
        this.$api.screen.getSensorStatus(id, 'vibration'),
        this.$api.screen.getSensorStatus(id, 'speed'),
      ])
        .then(([res1, res2, res3]) => {
          if (res1 && res1.data) {
            this.fanData.push(
              { value: res1.data.onLineTotal, name: this.$t('screen.online') },
              { value: res1.data.offLineTotal, name: this.$t('screen.offline') }
            );
            this.draw(this.fanData);
          }
          if (res2 && res2.data) {
            this.vibrationSensorData.push(
              { value: res2.data.onLineTotal, name: this.$t('common.OK') },
              { value: res2.data.offLineTotal, name: this.$t('common.abnormal') }
            );
            this.drawSensor(this.vibrationSensorData, 'vibration');
          }
          if (res3 && res3.data) {
            this.speedSensorData.push(
              { value: res3.data.onLineTotal, name: this.$t('common.OK') },
              { value: res3.data.offLineTotal, name: this.$t('common.abnormal') }
            );
            this.drawSensor(this.speedSensorData, 'speed');
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // 画第一个
    draw(data) {
      const optionFan = cloneDeep(this.baseOption);
      optionFan.series[0].data = data;
      optionFan.legend.formatter = (name) => {
        const chartData = optionFan.series[0].data;
        return this.legendFormatter(name, chartData);
      };
      if (this.chartFan) {
        this.chartFan.setOption(optionFan);
        this.chartFan.resize();
        this.chartFan.on('legendselectchanged', (params) => {
          this.chartFan.setOption({
            legend: { selected: { [params.name]: true } },
          });
          if (params.name === '离线') {
            this.showMachineOrSensorList('machine');
          }
        });
      }
    },
    // 画第二个
    drawSensor(data, type) {
      const optionFault = cloneDeep(this.baseOption);
      optionFault.series[0].data = data;
      optionFault.color = ['#64c42d', '#df3317'];
      optionFault.legend.formatter = (name) => {
        const chartData = optionFault.series[0].data;
        return this.legendFormatter(name, chartData);
      };
      if (type === 'vibration' && this.vibrationSensorFan) {
        this.vibrationSensorFan.setOption(optionFault);
        this.vibrationSensorFan.resize();
        this.vibrationSensorFan.on('legendselectchanged', (params) => {
          this.vibrationSensorFan.setOption({
            legend: { selected: { [params.name]: true } },
          });
          if (params.name === '异常') {
            this.showMachineOrSensorList('vibration');
          }
        });
      }
      if (type === 'speed' && this.speedSensorFan) {
        this.speedSensorFan.setOption(optionFault);
        this.speedSensorFan.resize();
        this.speedSensorFan.on('legendselectchanged', (params) => {
          this.speedSensorFan.setOption({
            legend: { selected: { [params.name]: true } },
          });
          if (params.name === '异常') {
            this.showMachineOrSensorList('speed');
          }
        });
      }
    },
    // 格式化legend的文本
    legendFormatter(name, chartData) {
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
      return arr.join('');
    },
    // 显示风机或传感器列表
    showMachineOrSensorList(type) {
      const title = type === 'machine' ? this.$t('screen.fanList') : this.$t('screen.sensorList');
      this.$modal.show(title, fanListModal, { type, hierarchyId: this.hierarchyId }, '800px', null);
    },
  },
};
</script>

<style lang="less" scoped>
.data-device-info {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
}
.echarts-box {
  display: flex;
  height: calc(100% - 20px);
  div {
    width: 50%;
    height: 100%;
  }
}
</style>
