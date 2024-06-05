<template>
  <div class="charts-box">
    <div class="myChart" :ref="sid"></div>
    <span class="chart-box-title">{{ $t('routineAtlas.selectTypes.waveform') }}</span>
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
import StompService from '@/util/StompService';
import { extractWorkshopId, isValueExist } from '@/util/commonService';
import mixin from './mixin';

export default {
  name: 'Waveform',
  mixins: [mixin],
  props: {
    sid: { type: String, default: 'chart1' },
    requestParam: { type: Object, default: () => {} },
    windowResize: { type: Boolean, default: false },
    isCompare: { type: Boolean, default: false },
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
      firstDraw: true,
    };
  },
  computed: {
    ...mapState('cms/atlas', ['refreshTime']),
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    this.$emit('on-chart-item-add', this);
    this.chart = echarts.init(this.$refs[this.sid]);
    this.chart.resize();
    this.toDrawBlank();

    // 比较弹窗中，不在mounted中调用接口
    if (this.isCompare) {
      return;
    }
    if (this.requestParam && this.requestParam.sensorId) {
      this.renderChart(this.requestParam);
    }
  },
  beforeDestroy() {
    this.$emit('on-chart-item-remove', this);
    this.toDestroy();
  },
  watch: {
    requestParam(value, oldValue) {
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
    toDestroy() {
      this.chart = null;
      this.closeStomp();
      // 清除定时器
      this.actionInterval && clearInterval(this.actionInterval);
      this.actionInterval = null;
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
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          extensionType,
        },
      };
      this.draw(res);
    },
    renderChart(param) {
      // 清除定时器
      this.actionInterval && clearInterval(this.actionInterval);
      this.actionInterval = null;
      const { sensorName, dataType, identifierName } = param;
      if (dataType === 'HISTORY') {
        this.closeStomp();
        // 历史数据，发送http请求
        this.request(param);
      } else if (dataType === 'REALTIME') {
        // 实时数据，一开始websocket不会推送数据，需要先绘制一个空图形
        this.draw({
          xAxis: [],
          yAxis: [],
          textObj: {
            sensorName,
            identifierName,
            identifierValue: '--',
            identifierUnit: 'm/s²',
            dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
            // extensionType,
          },
        });
        // 实时数据，发起websocket连接
        if (!this.stomp) {
          this.connectStomp(param);
        } else {
          this.resetsubscribe(param);
        }
      }
    },
    request(param) {
      const {
        machineId,
        sensorId,
        sensorName,
        dataType,
        startAt,
        endAt,
        extensionType,
        identifierName,
        identifierOriginalDataType,
      } = param;
      const workshopId = extractWorkshopId(this.passList, machineId);
      if (!sensorId || startAt === endAt) {
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
        extensionType,
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
        .getWaveformMap(sensorId, params)
        .then((res) => {
          let xAxis = [];
          let yAxis = [];
          let textObj = {};
          if (!res || !res.data || res.data.length === 0) {
            // 后台返回数据为空，绘制空图
            xAxis = [];
            yAxis = [];
            textObj = {
              sensorName,
              identifierName,
              identifierValue: '--',
              identifierUnit: 'm/s²',
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
              extensionType,
            };
          } else {
            const tt = res.data[0].startAt ? this.$dateFormat.formatLocalDateTime(res.data[0].startAt) : '';
            if (res.data[0].sequence && res.data[0].sequence.length > 0) {
              // xAxis = res.data[0].sequence;
              for (let i = 0; i < res.data[0].sequence.length; i += 1) {
                xAxis.push(`${tt}.${i}`);
              }
            }
            if (res.data[0].acceleration && res.data[0].acceleration.length > 0) {
              yAxis = res.data[0].acceleration;
            }

            textObj = {
              sensorName,
              identifierName,
              identifierValue: isValueExist(res.data[0].accelerationPeak)
                ? res.data[0].accelerationPeak.toFixed(6)
                : '--',
              identifierUnit: 'm/s²',
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
              extensionType,
            };
          }
          // 绘图
          this.draw({
            xAxis,
            yAxis,
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
    computedSubscribeUrl(sensorId) {
      return `/ws/${sensorId}/waveform`;
    },
    connectStomp(param) {
      if (!this) return;
      const { sensorId } = param;
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        this.subscribe(this.computedSubscribeUrl(sensorId), param);
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
    resetsubscribe(param) {
      if (!this) return;
      const { sensorId } = param;
      this.subscription && this.subscription.unsubscribe();
      this.subscription = null;
      this.subscribe(this.computedSubscribeUrl(sensorId), param);
    },
    subscribe(url, param) {
      if (!this) return;
      const { sensorName, dataType, identifierName } = param;
      this.subscription = this.stomp.subscribe(url, this, (data, sub) => {
        if (this && sub) {
          this.subscription = sub;
        }
        let { body } = data;
        if (body) {
          body = JSON.parse(body);
        }
        const xAxis = [];
        let yAxis = [];
        const tt = body.startAt ? this.$dateFormat.formatLocalDateTime(body.startAt) : '';
        // 波形图
        if (body.sequence && body.sequence.length > 0) {
          // xAxis = body.sequence;
          for (let i = 0; i < body.sequence.length; i += 1) {
            xAxis.push(`${tt}.${i}`);
          }
        }
        if (body.acceleration && body.acceleration.length > 0) {
          yAxis = body.acceleration;
        }
        if (!this.staticflag) {
          this.draw({
            xAxis,
            yAxis,
            textObj: {
              sensorName,
              identifierName,
              identifierValue: isValueExist(body.accelerationPeak) ? body.accelerationPeak.toFixed(6) : '--',
              identifierUnit: 'm/s²',
              dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
              // extensionType,
            },
          });
        }
      });
      // 设置定时器，根据系统的图谱刷新时间配置，进行定时请求
      this.actionInterval && clearInterval(this.actionInterval);
      this.actionInterval = null;
      this.intervalAction(param);
      if (!this) return;
      this.actionInterval = setInterval(() => {
        this.intervalAction(param);
      }, this.refreshTime * 1000);
    },
    draw(response) {
      const { xAxis, yAxis, textObj } = response;
      const { sensorName, dataTypeText, identifierValue, identifierUnit, extensionType } = textObj;

      const identifierName = this.$t('routineAtlas.accelerationPeak');
      const xAxisText = this.$t('routineAtlas.timeAxis');
      let yUnit = 'm/s²';
      let yAxisText = `${identifierName}(${yUnit})`;
      if (extensionType === 'speed') {
        yUnit = 'm/s';
        yAxisText = `${identifierName}(${yUnit})`;
      }

      const chartTitleText = this.$t('routineAtlas.selectTypes.waveform');
      const subTitleText = this.$t('routineAtlas.subTextNew', {
        0: sensorName,
        1: identifierName,
        2: identifierValue,
        3: yUnit,
      });

      const data = [];
      for (let i = 0; i < xAxis.length; i += 1) {
        data.push([xAxis[i], yAxis[i]]);
      }

      const option = {
        title: {
          text: chartTitleText,
          textStyle: {
            fontSize: 0,
            lineHeight: 0,
            color: 'rgba(255, 255, 255, 0)',
          },
          subtext: subTitleText,
          subtextStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(5, 87, 169, 0.45)',
          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
          },
          formatter(params) {
            return `${xAxisText}: ${isValueExist(params[0].value[0]) ? params[0].value[0] : ''}<br />
            ${yAxisText}: ${isValueExist(params[0].value[1]) ? params[0].value[1] : ''} ${yUnit}`;
          },
        },
        // legend: {
        //   data: [yAxisText],
        //   x: 'left',
        // },
        xAxis: {
          type: 'category',
          name: xAxisText,
          nameTextStyle: {
            color: '#8E929E',
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#8E929E',
            interval: 'auto',
            rotate: -3,
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: yAxisText,
          nameLocation: 'center',
          nameTextStyle: {
            color: '#8E929E',
            padding: [0, 0, 40, 0],
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#8E929E',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        series: [
          {
            name: yAxisText,
            type: 'line',
            data,
            showSymbol: false,
            showAllSymbol: false,
            lineStyle: {
              color: '#02879F',
            },
          },
        ],
      };

      if (!this.firstDraw) {
        this.chart && this.chart.setOption(option);
        return;
      }
      this.firstDraw = false;

      const newOption = {
        ...option,
        toolbox: {
          right: 30,
          iconStyle: {
            borderColor: 'rgba(255, 255, 255, 0.85)',
          },
          feature: {
            saveAsImage: {},
          },
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            filterMode: 'none',
            realtime: false,
            start: 0,
            end: 50,
            height: 20,
            bottom: 4,
            backgroundColor: 'transparent',
            borderColor: 'rgba(71, 218, 255, 0.2)',
            fillerColor: 'rgba(220, 226, 235, 0.2)',
            showDetail: false,
          },
        ],
        grid: {
          show: true,
          top: 56,
          bottom: 50,
          left: 80,
          right: 80,
          backgroundColor: '#07172D',
          borderColor: '#07172D',
        },
      };

      this.chart && this.chart.setOption(newOption, true);
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
