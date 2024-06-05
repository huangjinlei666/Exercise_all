<template>
  <div class="charts-box">
    <div class="myChart" :ref="sid"></div>
    <span class="chart-box-title">{{ $t('routineAtlas.selectTypes.waterfall') }}</span>
    <div class="static-box" v-if="requestParam && requestParam.dataType === 'REALTIME'">
      <el-tooltip
        effect="dark"
        :content="staticflag ? $t('routineAtlas.static') : $t('routineAtlas.dynamic')"
        placement="top"
        :open-delay="500"
      >
        <span
          :class="{
            'btn btn-static btn-click': !staticflag,
            'btn btn-static': staticflag,
          }"
          @click="staticflag = !staticflag"
        ></span>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import * as echarts from 'echarts';
import 'echarts-gl';
import StompService from '@/util/StompService';
import { extractWorkshopId, isValueExist } from '@/util/commonService';
import mixin from './mixin';

export default {
  name: 'WaterFall',
  mixins: [mixin],
  props: {
    sid: {
      type: String,
      default: 'chart1',
    },
    requestParam: {
      type: Object,
      default: () => {},
    },
    windowResize: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chart: null,
      // 实时数据时，静态数据开关
      staticflag: false,
      // websocket
      stomp: null,
      subscription: null,
      actionInterval: null,
      // 实时数据，由于实时数据每次只更新一组，所以需要将每次返回的数据缓存起来
      realtimeResultList: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
    ...mapState('cms/atlas', ['refreshTime']),
  },
  mounted() {
    this.$nextTick(() => {
      this.chart = echarts.init(this.$refs[this.sid]);
      this.chart.resize();
      this.toDrawBlank();

      if (this.requestParam && this.requestParam.sensorId) {
        this.renderChart(this.requestParam);
      }
    });
  },
  beforeDestroy() {
    this.chart = null;
    this.closeStomp();
    // 清除定时器
    this.actionInterval && clearInterval(this.actionInterval);
    this.actionInterval = null;
  },
  watch: {
    requestParam(value) {
      if (!this) return;
      if (!value || !value.sensorId) {
        this.closeStomp();
        this.actionInterval && clearInterval(this.actionInterval);
        this.actionInterval = null;
        this.toDrawBlank();
        return;
      }
      this.renderChart(value);
    },
    windowResize() {
      this.chart && this.chart.resize();
    },
  },
  methods: {
    toDrawBlank() {
      const res = {
        sourceData: [
          {
            type: 'line3D',
            data: [],
          },
        ],
        textObj: {
          sensorName: '--',
          identifierName: this.$t('routineAtlas.accelerationPeak'),
          identifierValue: '--',
          identifierUnit: 'm/s²',
          xAxisUnit: 'Hz',
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
        },
      };
      this.draw(res);
    },
    renderChart(searchParam) {
      // 清除定时器
      this.actionInterval && clearInterval(this.actionInterval);
      this.actionInterval = null;
      // 每次请求，要清除实时缓存的数据
      this.resetRealtimeResultList();
      const { sensorName, dataType } = searchParam;
      if (dataType === 'HISTORY') {
        this.closeStomp();
        // 历史数据，发送http请求
        this.request(searchParam);
      } else if (dataType === 'REALTIME') {
        // 实时数据，一开始websocket不会推送数据，需要先绘制一个空图形
        this.draw({
          sourceData: [
            {
              type: 'line3D',
              data: [],
            },
          ],
          textObj: {
            sensorName,
            identifierName: this.$t('routineAtlas.accelerationPeak'),
            identifierValue: '--',
            identifierUnit: 'm/s²',
            xAxisUnit: 'Hz',
            dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
          },
        });
        // 实时数据，发起websocket连接
        if (!this.stomp) {
          this.connectStomp(searchParam);
        } else {
          this.resetsubscribe(searchParam);
        }
      }
    },
    request(searchParam) {
      const {
        machineId,
        sensorId,
        sensorName,
        dataType,
        startAt,
        endAt,
        xAxisUnit,
        type,
        velocitySensorId,
        identifierOriginalDataType,
      } = searchParam;
      const workshopId = extractWorkshopId(this.passList, machineId);
      if (!sensorId) {
        this.draw({
          sourceData: [
            {
              type: 'line3D',
              data: [],
            },
          ],
          textObj: {
            sensorName: '--',
            identifierName: this.$t('routineAtlas.accelerationPeak'),
            identifierValue: '--',
            identifierUnit: 'm/s²',
            xAxisUnit: 'Hz',
            dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          },
        });
        return;
      }
      const params = {
        workshopId,
        dataType,
        startAt,
        endAt,
        type,
        velocitySensorId,
        identifier: identifierOriginalDataType,
      };
      if (identifierOriginalDataType !== 'longOriginalData') delete params.identifier;
      // 加载中
      this.chart &&
        this.chart.showLoading({
          textColor: 'rgba(255, 255, 255, 0.85)',
          maskColor: 'rgba(10, 40, 63, 0.8)',
        });
      this.$api.routineAtlas
        .getWaterfallMap(sensorId, params)
        .then((res) => {
          let textObj = {
            sensorName,
            identifierName: this.$t('routineAtlas.accelerationPeak'),
            identifierValue: '--',
            identifierUnit: 'm/s²',
            xAxisUnit,
            dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          };
          let sourceData = [];
          if (res && res.length > 0) {
            textObj = {
              sensorName,
              identifierName: this.$t('routineAtlas.accelerationPeak'),
              identifierValue: isValueExist(res[0].accelerationPeak) ? res[0].accelerationPeak.toFixed(6) : '--',
              identifierUnit: 'm/s²',
              xAxisUnit,
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
            };
            sourceData = res.map((r) => {
              const data = [];
              if (r.frequency && r.frequency.length > 0) {
                for (let i = 1; i < r.frequency.length; i += 1) {
                  data.push([r.frequency[i], this.$dateFormat.formatLocalDateTime(r.startAt), r.amplitude[i]]);
                }
              }
              if (r.order && r.order.length > 0) {
                for (let i = 1; i < r.order.length; i += 1) {
                  data.push([r.order[i], this.$dateFormat.formatLocalDateTime(r.startAt), r.amplitude[i]]);
                }
              }
              return {
                type: 'line3D',
                data,
              };
            });
          }
          // 绘图
          this.draw({
            sourceData,
            textObj,
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          // 加载停止
          this.chart && this.chart.hideLoading();
        });
    },
    computedSubscribeUrl(sensorId, type, velocitySensorId) {
      if (type === 'hz' && velocitySensorId) {
        return `/ws/${sensorId}/spectrum/orderSensorId/${velocitySensorId}`;
      }
      return `/ws/${sensorId}/spectrum`;
    },
    connectStomp(searchParam) {
      if (!this) return;
      const { sensorId, type, velocitySensorId } = searchParam;
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        this.subscribe(this.computedSubscribeUrl(sensorId, type, velocitySensorId), searchParam);
      });
    },
    closeStomp() {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
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
    resetsubscribe(searchParam) {
      if (!this) return;
      const { sensorId, type, velocitySensorId } = searchParam;
      this.subscription && this.subscription.unsubscribe();
      this.subscription = null;
      this.subscribe(this.computedSubscribeUrl(sensorId, type, velocitySensorId), searchParam);
    },
    resetRealtimeResultList() {
      this.realtimeResultList = [];
    },
    subscribe(url, searchParam) {
      if (!this) return;
      const { sensorName, dataType, xAxisUnit } = searchParam;
      this.subscription = this.stomp.subscribe(url, this, (response, sub) => {
        if (this && sub) {
          this.subscription = sub;
        }
        let { body } = response;
        if (body) {
          body = JSON.parse(body);
        }
        // 瀑布图
        let sourceData = [];
        if (body) {
          this.realtimeResultList.push(body);
          if (this.realtimeResultList.length >= 51) {
            this.realtimeResultList.shift();
          }
          const res = this.realtimeResultList;
          sourceData = res.map((r) => {
            const data = [];
            if (r.frequency && r.frequency.length > 0) {
              for (let i = 1; i < r.frequency.length; i += 1) {
                data.push([r.frequency[i], this.$dateFormat.formatLocalDateTime(r.startAt), r.amplitude[i]]);
              }
            }
            if (r.order && r.order.length > 0) {
              for (let i = 1; i < r.order.length; i += 1) {
                data.push([r.order[i], this.$dateFormat.formatLocalDateTime(r.startAt), r.amplitude[i]]);
              }
            }
            return {
              type: 'line3D',
              data,
            };
          });
        }
        if (!this.staticflag) {
          this.draw({
            sourceData,
            textObj: {
              sensorName,
              identifierName: this.$t('routineAtlas.accelerationPeak'),
              identifierValue: isValueExist(body.accelerationPeak) ? body.accelerationPeak.toFixed(6) : '--',
              identifierUnit: 'm/s²',
              xAxisUnit,
              dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
            },
          });
        }
      });
      // 设置定时器，根据系统的图谱刷新时间配置，进行定时请求
      this.actionInterval && clearInterval(this.actionInterval);
      this.actionInterval = null;
      this.intervalAction(searchParam);
      if (!this) return;
      this.actionInterval = setInterval(() => {
        this.intervalAction(searchParam);
      }, this.refreshTime * 1000);
    },
    draw(response) {
      const { sourceData, textObj } = response;
      const { sensorName, identifierName, identifierValue, identifierUnit, dataTypeText, xAxisUnit } = textObj;
      // const subTitleText = this.$t('routineAtlas.subTextNew', {
      //   0: identifierName,
      //   1: identifierValue,
      //   2: identifierUnit,
      // });
      const chartTitleText = this.$t('routineAtlas.selectTypes.waterfall');
      const xAxisText = this.$t('routineAtlas.frequencyAxis');
      const yAxisText = this.$t('routineAtlas.timeAxis');
      const zAxisText = this.$t('routineAtlas.accelerationAxis');
      const option = {
        title: {
          text: chartTitleText,
          textStyle: {
            fontSize: 0,
            lineHeight: 0,
            color: 'rgba(255, 255, 255, 0)',
          },
          // subtext: subTitleText,
          left: 'center',
        },
        toolbox: {
          right: 30,
          iconStyle: {
            borderColor: 'rgba(255, 255, 255, 0.85)',
          },
          feature: {
            saveAsImage: {},
            // restore: {},
            myRestore: {
              show: true,
              title: '还原',
              emphasis: {
                iconStyle: {
                  color: 'rgb(62,152,197)',
                },
              },
              icon: 'path://M856 425.9c-6 0-11.5-3.8-13.4-9.8-48.2-154.3-195-259.9-356.8-256.7-157.7 3.1-295.2 106.3-342.3 256.7-2.3 7.4-10.2 11.5-17.5 9.2-7.4-2.3-11.5-10.2-9.2-17.5 12.2-38.9 30.3-75.6 53.9-109.1 23.3-33.1 51.4-62.3 83.6-86.8 66.8-51 146.7-78.8 231-80.5 43.9-0.9 87.1 5.4 128.5 18.7 40 12.9 77.6 32 111.7 56.9 33.7 24.6 63.2 54.3 87.6 88.2 24.8 34.4 43.7 72.2 56.3 112.5 2.3 7.4-1.8 15.2-9.2 17.5-1.4 0.5-2.8 0.7-4.2 0.7zM493 919.7c-41.1 0-81.6-6.3-120.5-18.8-40-12.9-77.6-32-111.7-56.9-33.7-24.6-63.2-54.3-87.6-88.2-24.8-34.4-43.7-72.2-56.3-112.5-2.3-7.4 1.8-15.2 9.2-17.5 7.4-2.3 15.2 1.8 17.5 9.2 48.2 154.3 195 259.9 356.8 256.7 157.7-3.1 295.2-106.3 342.3-256.7 2.3-7.4 10.2-11.5 17.5-9.2 7.4 2.3 11.5 10.2 9.2 17.5a393.72 393.72 0 0 1-53.9 109.1c-23.3 33.1-51.4 62.3-83.6 86.8-66.8 51-146.7 78.8-231 80.5-2.6-0.1-5.3 0-7.9 0z',
              onclick: () => {
                const chart = echarts.init(this.$refs[this.sid]);
                // 还原
                chart.clear();
                chart.setOption(option);
                // 传值
                this.$emit('init');
              },
            },
          },
        },
        grid3D: {
          viewControl: {
            alpha: 7,
            beta: 30,
            animation: true,
            animationDurationUpdate: 1000,
            animationEasingUpdate: 'cubicInOut',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(5, 87, 169, 0.45)',
          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          formatter(params) {
            return (
              `${yAxisText}: ${isValueExist(params.value[1]) ? params.value[1] : ''}<br />` +
              `${xAxisText}: ${isValueExist(params.value[0]) ? params.value[0] : ''} ${xAxisUnit}<br />` +
              `${zAxisText}: ${isValueExist(params.value[2]) ? params.value[2] : ''} m/s²<br />`
            );
          },
        },
        xAxis3D: {
          type: 'value',
          name: `${xAxisText}(${xAxisUnit})`,
          axisPointer: {
            show: false,
          },
          nameTextStyle: {
            lineHeight: 20,
            color: '#8E929E',
          },
          axisLabel: {
            color: '#8E929E',
          },
        },
        yAxis3D: {
          type: 'category',
          name: `${yAxisText}`,
          axisPointer: {
            show: false,
          },
          nameTextStyle: {
            lineHeight: 20,
            color: '#8E929E',
          },
          axisLabel: {
            color: '#8E929E',
          },
        },
        zAxis3D: {
          type: 'value',
          name: `${zAxisText}(m/s²)`,
          axisPointer: {
            show: false,
          },
          nameTextStyle: {
            lineHeight: 20,
            color: '#8E929E',
          },
          axisLabel: {
            color: '#8E929E',
          },
        },
        series: [...sourceData],
      };
      if (!this || !this.chart) {
        return;
      }
      this.chart.clear();
      this.chart.setOption(option);
    },
  },
};
</script>
<style lang="less" scoped>
.charts-box {
  position: relative;
  width: 100%;
  height: 100%;
  .chart-box-title {
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.85);
    position: absolute;
    top: 10px;
    left: 10px;
  }
  .myChart {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .static-box {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
