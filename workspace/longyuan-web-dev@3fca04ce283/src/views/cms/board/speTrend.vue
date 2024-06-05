<template>
  <div class="speed-trend">
    <div class="grident-bar">
      <img src="../../../assets/images/bg-head.png" alt="bg-head" />
    </div>
    <div class="item-title">{{ $t('board.speedTrend') }}</div>
    <div id="speed-trend-chart"></div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import echarts from 'echarts';
import StompService from '@/util/StompService';
import { colorArray } from '@/util/selectTypes';

export default {
  name: 'boardSpeedTrend',
  props: {
    sensorList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      firstFlag: true,
      chart: null,
      // websocket
      stomp: null,
      subscriptionObject: {},
      // 实时数据，由于实时数据每次只更新一条，所以需要将每次返回的数据缓存起来
      readDataObject: {},
      // 传感器id序列
      sensorIdArray: [],
      // 传感器name序列
      sensorNameArray: [],
      // 绘图的时间戳数组
      timestampArr: [],
    };
  },
  watch: {
    sensorList(value, oldValue) {
      if (value.length === 0 || !value[0].id) {
        this.sensorIdArray = [];
        this.sensorNameArray = [];
        this.readDataObject = {};
        return;
      }
      if (!this) {
        return;
      }
      if (!this.firstFlag) {
        return;
      }
      // 缓存传感器id序列和name序列
      this.sensorIdArray = [];
      this.sensorNameArray = [];
      this.readDataObject = {};
      value.forEach((v, i) => {
        this.sensorIdArray.push(v.id);
        this.sensorNameArray.push(v.name);
        this.readDataObject[v.id] = {
          timeArr: [],
          valueArr: [],
          name: v.name,
        };
      });
      // 初始化
      this.init(this.sensorIdArray);
    },
  },
  mounted() {
    this.chart = echarts.init(document.getElementById('speed-trend-chart'));
    this.chart.resize();
    window.addEventListener('resize', this.onWindowResize, false);

    this.draw([], []);
  },
  beforeDestroy() {
    this.chart = null;

    this.closeStomp();

    this.onWindowResize = () => false;
    window.removeEventListener('resize', this.onWindowResize, false);
  },
  methods: {
    onWindowResize: debounce(
      function onWindowResize() {
        this.chart && this.chart.resize();
      },
      300,
      { leading: false, trailing: true }
    ),
    init(sensorIdArr) {
      this.firstFlag = false;
      if (sensorIdArr.length === 0) {
        this.draw([], []);
        return;
      }
      // 实时数据，发起websocket连接
      if (!this.stomp) {
        this.connectStomp(sensorIdArr);
      } else {
        this.resetsubscribe(sensorIdArr);
      }
    },
    computedSubscribeUrl(sensorId, identifier) {
      return `/ws/${sensorId}/tendency/${identifier}`;
    },
    connectStomp(sensorIdArr) {
      if (!this) return;
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        // 订阅
        sensorIdArr.forEach((id) => {
          this.subscribe(this.computedSubscribeUrl(id, 'RotatingVelocity'), id);
        });
      });
    },
    closeStomp() {
      // 取消现有订阅
      Object.keys(this.subscriptionObject).forEach((id) => {
        this.subscriptionObject[id] && this.subscriptionObject[id].unsubscribe();
        this.subscriptionObject[id] = null;
      });
      this.subscriptionObject = {};
      if (this.stomp) {
        try {
          this.stomp.disconnect(() => {
            this.stomp = null;
          });
        } catch (error) {
          this.$msg.error('Websocket disconnect error.');
        }
      }
    },
    resetsubscribe(sensorIdArr) {
      if (!this) return;
      // 取消现有订阅
      Object.keys(this.subscriptionObject).forEach((id) => {
        this.subscriptionObject[id] && this.subscriptionObject[id].unsubscribe();
        this.subscriptionObject[id] = null;
      });
      this.subscriptionObject = {};
      // 重新订阅
      sensorIdArr.forEach((id) => {
        this.subscribe(this.computedSubscribeUrl(id, 'RotatingVelocity'), id);
      });
    },
    subscribe(url, id) {
      if (!this) return;
      this.subscriptionObject[id] = this.stomp.subscribe(url, this, (data, sub) => {
        if (this && sub) {
          this.subscriptionObject[id] = sub;
        }
        let { body } = data;
        if (body) {
          body = JSON.parse(body);
        }

        // 处理当前订阅返回值的逻辑
        let tempTime;
        let tempData;
        if (body.timestamp) {
          tempTime = Math.floor(body.timestamp / 1000) * 1000;
        }
        if (body.value) {
          tempData = body.value;
        }

        this.readDataObject[id].timeArr.push(tempTime);
        if (this.readDataObject[id].timeArr.length > 300) {
          this.readDataObject[id].timeArr = this.readDataObject[id].timeArr.splice(
            this.readDataObject[id].timeArr.length - 300
          );
        }
        this.readDataObject[id].valueArr.push(tempData);
        if (this.readDataObject[id].valueArr.length > 300) {
          this.readDataObject[id].valueArr = this.readDataObject[id].valueArr.splice(
            this.readDataObject[id].valueArr.length - 300
          );
        }

        if (!this.timestampArr.includes(tempTime)) {
          this.timestampArr.push(tempTime);
          if (this.timestampArr.length > 300) {
            this.timestampArr = this.timestampArr.splice(this.timestampArr.length - 300);
          }
        }

        this.toDraw(cloneDeep(this.timestampArr), cloneDeep(this.readDataObject));
      });
    },
    toDraw(xAxis, readDataObject) {
      const seriesArr = [];
      this.sensorIdArray.forEach((sensorId) => {
        const { timeArr, valueArr, name } = readDataObject[sensorId];
        const data = [];
        xAxis.forEach((t) => {
          const i = timeArr.indexOf(t);
          if (i > -1) {
            data.push(valueArr[i]);
          } else {
            data.push(null);
          }
        });
        seriesArr.push({
          name,
          data,
          type: 'line',
          // showSymbol: false,
        });
      });
      this.draw(xAxis, seriesArr);
    },
    draw(xAxis, seriesArr) {
      const yAxisText = this.$t('board.speedUnit');
      const xAxisText = this.$t('routineAtlas.timeAxis');
      let borderFlag = true;
      if (xAxis.length !== 0) {
        borderFlag = false;
      }

      const option = {
        color: colorArray,
        legend: {
          type: 'scroll',
          top: 0,
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          data: this.sensorNameArray,
        },
        grid: {
          bottom: '12%',
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let str = `${xAxisText}:${this.$dateFormat.formatLocalDateTime(params[0].name, 'time')}<br />`;
            params.forEach((e, idx) => {
              str += `${e.seriesName}: ${e.value || '--'} rpm<br />`;
            });
            return str;
          },
        },
        xAxis: {
          type: 'category',
          name: xAxisText,
          nameTextStyle: {
            color: '#8E929E',
          },
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: '#8E929E',
            },
            show: borderFlag,
          },
          axisTick: {
            lineStyle: {
              color: '#8E929E',
              opacity: 0.1,
            },
          },
          axisLabel: {
            formatter: (value) => this.$dateFormat.formatLocalDateTime(value, 'time'),
          },
        },
        yAxis: {
          type: 'value',
          name: yAxisText,
          nameTextStyle: {
            color: '#8E929E',
            align: 'right',
          },
          splitLine: {
            lineStyle: {
              color: '#8E929E',
              opacity: 0.1,
            },
          },
          axisLine: {
            lineStyle: {
              color: '#8E929E',
            },
            show: borderFlag,
          },
          axisTick: {
            lineStyle: {
              color: '#8E929E',
              opacity: 0.1,
            },
          },
        },
        series: seriesArr,
      };

      this.chart.setOption(option);
      this.chart.resize();
    },
  },
};
</script>

<style lang="less" scoped>
.speed-trend {
  height: 100%;
  padding: 10px;
  position: relative;
  border: 1px solid rgba(71, 218, 255, 0.1);
  box-sizing: border-box;
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .grident-bar {
    position: absolute;
    top: -8px;
    left: 0;
    width: 100%;
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 8px;
    }
  }
  .item-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    color: rgba(255, 255, 255, 0.85);
  }
  #speed-trend-chart {
    width: 100%;
    height: calc(100% - 30px);
  }
}
</style>
