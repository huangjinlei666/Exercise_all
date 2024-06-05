<template>
  <div class="charts-box">
    <div class="myChart" :ref="sid"></div>
    <span class="chart-box-title">{{ $t('routineAtlas.selectTypes.trend') }}</span>
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
    <div class="operation-box" ref="operationBox">
      <a class="cms-a-btn" @click="toViewOriginal">
        {{ $t('routineAtlas.viewOriginalData') }}
      </a>
      <a class="cms-a-btn" @click="addToCompareList">
        {{ $t('routineAtlas.addToCompare') }}
      </a>
      <a class="cms-a-btn" @click="calEigenvalue"> {{ $t('routineAtlas.computed') }} </a>
      <a class="cms-a-btn" @click="deleteOriginal"> {{ $t('routineAtlas.deleteRawData') }} </a>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import StompService from '@/util/StompService';
import { extractWorkshopId, isValueExist } from '@/util/commonService';
import trendEigenvalue from '../modal/trendEigenvalue.vue';

import mixin from './mixin';

export default {
  name: 'Trend',
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
      currentTimestamp: '', // 鼠标选择的要查看或对比原始数据的时刻点
      showTags: false,
      chart: null,
      // 实时数据时，静态数据开关
      staticflag: false,
      // websocket
      stomp: null,
      subscription: null,
      firstDraw: true,
      // 实时数据，由于实时数据每次只更新一条，所以需要将每次返回的数据缓存起来
      realtimeTrendTimeArr: [],
      realtimeTrendDataArr: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList', 'passSensor', 'hierarchy']),
    ...mapState('cms/chart', ['compareParamList']),
    // 是否需要展示原始数据
    needShowOriginal() {
      if (!this.passSensor) {
        return false;
      }
      let info;
      try {
        info = JSON.parse(this.passSensor.additionalInfo);
      } catch (error) {
        info = {};
      }
      if (info && info.deviceType && info.deviceType[0] && info.deviceType[0] === 'speed') {
        return false;
      }
      return true;
    },
  },
  mounted() {
    this.chart = echarts.init(this.$refs[this.sid]);
    this.chart.resize();
    this.toDrawBlank();
  },
  beforeDestroy() {
    this.chart = null;
    this.closeStomp();
  },
  watch: {
    requestParam(value) {
      if (!this) return;
      if (!value || !value.sensorId) {
        this.closeStomp();
        this.toDrawBlank();
        return;
      }
      this.renderChart(value);

      if (value.dataType === 'HISTORY') {
        this.chart.on('click', this.onChartClick);
        this.chart.getZr().on('click', this.onBlankClick);
      } else {
        this.chart.off('click', this.onChartClick);
        this.chart.getZr().off('click', this.onBlankClick);
      }
    },
    windowResize() {
      this.chart && this.chart.resize();
    },
    passSensor(value) {
      // 传感器切换后清空依赖趋势图的其他图谱数据
      const v = this.requestParam ? cloneDeep(this.requestParam) : {};
      this.$emit('trendParamsChange', { ...v, startAt: 0, endAt: 0 });
    },
  },
  methods: {
    ...mapMutations('cms/chart', ['saveCompareParamList']),
    toDrawBlank() {
      const res = {
        xAxis: [],
        yAxis: [],
        textObj: {
          sensorName: '--',
          identifierName: this.$t('routineAtlas.speedAxis'),
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          unit: 'rpm',
        },
      };
      this.draw(res);
    },
    renderChart(param) {
      this.hideOperationBox();
      this.currentTimestamp = '';
      // 每次请求，要清除实时缓存的数据
      this.resetRealtimeTrendData();
      const { sensorName, identifierName, dataType, unit } = param;
      if (dataType === 'HISTORY' && param.identifier !== 'longOriginalData') {
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
            dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
            unit,
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
      const { machineId, sensorId, sensorName, identifier, identifierName, dataType, unit, startAt, endAt } = param;
      const workshopId = extractWorkshopId(this.passList, machineId);
      if (!sensorId || !identifier) {
        // 空请求数据，直接绘制空图
        this.$nextTick(() => {
          this.draw({
            xAxis: [],
            yAxis: [],
            textObj: {
              sensorName: '--',
              identifierName: '--',
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
              unit: 'rpm',
            },
          });
        });
        return;
      }
      const params = {
        workshopId,
        identifier,
        dataType,
        startAt,
        endAt,
      };
      // 加载中
      this.chart &&
        this.chart.showLoading({
          textColor: 'rgba(255, 255, 255, 0.85)',
          maskColor: 'rgba(10, 40, 63, 0.8)',
        });
      this.$api.routineAtlas
        .getTrendMap(sensorId, params)
        .then((res) => {
          let xAxis = [];
          let yAxis = [];
          let bAxis = [];
          if (res && res.timestamp && res.timestamp.length > 0) {
            xAxis = res.timestamp;
            if (res && res.originalDataFlags && res.originalDataFlags.length > 0 && this.needShowOriginal) {
              bAxis = res.originalDataFlags;
            }
          }
          if (res && res.value && res.value.length > 0) {
            yAxis = res.value;
          }

          const textObj = {
            sensorName,
            identifierName,
            dataTypeText: this.$t('routineAtlas.selectTypes.history'),
            unit,
          };
          // 绘图
          this.draw({
            xAxis,
            yAxis,
            textObj,
            bAxis,
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
    computedSubscribeUrl(sensorId, identifier) {
      return `/ws/${sensorId}/tendency/${identifier}`;
    },
    connectStomp(param) {
      if (!this) return;
      const { identifier, sensorId } = param;
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        this.subscribe(this.computedSubscribeUrl(sensorId, identifier), param);
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
      const { identifier, sensorId } = param;
      this.subscription && this.subscription.unsubscribe();
      this.subscription = null;
      this.subscribe(this.computedSubscribeUrl(sensorId, identifier), param);
    },
    resetRealtimeTrendData() {
      this.realtimeTrendTimeArr = [];
      this.realtimeTrendDataArr = [];
    },
    subscribe(url, param) {
      if (!this) return;
      const { sensorName, identifierName, dataType, unit } = param;
      this.subscription = this.stomp.subscribe(url, this, (data, sub) => {
        if (this && sub) {
          this.subscription = sub;
        }
        let { body } = data;
        if (body) {
          body = JSON.parse(body);
        }
        let xAxis = [];
        let yAxis = [];
        // 趋势图
        if (body.timestamp) {
          this.realtimeTrendTimeArr.push(body.timestamp);
          if (this.realtimeTrendTimeArr.length >= 61) {
            this.realtimeTrendTimeArr.shift();
          }
          xAxis = this.realtimeTrendTimeArr;

          this.realtimeTrendDataArr.push(body.value);
          if (this.realtimeTrendDataArr.length >= 61) {
            this.realtimeTrendDataArr.shift();
          }
          yAxis = this.realtimeTrendDataArr;
        }
        if (!this.staticflag) {
          this.draw({
            xAxis,
            yAxis,
            textObj: {
              sensorName,
              identifierName,
              dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
              unit,
            },
          });
        }
      });
    },
    draw(response) {
      const { xAxis, yAxis, textObj, bAxis } = response;
      const { sensorName, identifierName, dataTypeText } = textObj;
      let { unit } = textObj;
      if (!unit) {
        unit = '';
      }
      const chartTitleText = this.$t('routineAtlas.selectTypes.trend');
      const subTitleText = this.$t('routineAtlas.subText', {
        0: sensorName,
        1: identifierName,
        2: dataTypeText,
      });
      const xAxisText = this.$t('routineAtlas.timeAxis');

      const data = [];
      for (let i = 0; i < yAxis.length; i += 1) {
        data.push({
          value: yAxis[i],
          symbol: 'circle',
          symbolSize: bAxis && bAxis[i] ? 8 : 0,
          itemStyle: {
            color: bAxis && bAxis[i] ? '#1890ff' : '#02879F',
          },
        });
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
          formatter: (params) => {
            const x = isValueExist(params[0].name) ? this.$dateFormat.formatLocalDateTime(params[0].name) : '';
            const y = isValueExist(params[0].value) ? params[0].value : '';
            return `${xAxisText}: ${x}<br />${identifierName}: ${y} ${unit}`;
          },
        },
        // legend: {
        //   data: [identifierName],
        //   x: 'left',
        // },
        xAxis: {
          type: 'category',
          data: xAxis,
          name: `${xAxisText}`,
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
            formatter: (value) => this.$dateFormat.formatLocalDateTime(value, 'datetime'),
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: `${identifierName}(${unit || '--'})`,
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
            name: identifierName,
            type: 'line',
            data,
            // showSymbol: false,
            showAllSymbol: true,
            // symbolSize: 8,
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
            end: 100,
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
    hideOperationBox() {
      this.$refs && this.$refs.operationBox && (this.$refs.operationBox.style.display = 'none');
    },
    onChartClick(params) {
      params.event && params.event && params.event.stop();
      const { name, data, event } = params;
      if (typeof data === 'object') {
        this.currentTimestamp = name;
        this.$refs.operationBox.style.display = 'block';
        this.$refs.operationBox.style.top = `${event.offsetY}px`;
        this.$refs.operationBox.style.left = `${event.offsetX}px`;
      } else {
        this.hideOperationBox();
      }
    },
    onBlankClick(e) {
      const { target } = e;
      if (!target) {
        this.hideOperationBox();
      }
    },
    toViewOriginal() {
      const requestParam = {
        ...cloneDeep(this.requestParam),
        startAt: +this.currentTimestamp,
        endAt: +this.currentTimestamp + 1,
      };
      this.hideOperationBox();
      this.$emit('trendParamsChange', requestParam);
    },
    addToCompareList() {
      const tempParam = {
        ...cloneDeep(this.requestParam),
        startAt: +this.currentTimestamp,
        endAt: +this.currentTimestamp + 1,
      };
      this.hideOperationBox();
      const compareParamList = this.handleParamList(tempParam, 4, cloneDeep(this.compareParamList));
      this.saveCompareParamList(compareParamList);
    },
    calEigenvalue() {
      const winData = {
        sensorId: this.requestParam.sensorId,
        startAt: +this.currentTimestamp,
        endAt: +this.currentTimestamp + 1,
      };
      this.$modal.show('滤波特征值', trendEigenvalue, winData, '500px');
      this.hideOperationBox();
    },
    deleteOriginal() {
      const param = {
        sensorId: this.requestParam.sensorId,
        time: +this.currentTimestamp,
      };
      this.$confirm(this.$t('routineAtlas.isDelete'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning',
      }).then(() => {
        this.$api.routineAtlas
          .deleteRawData(param)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('routineAtlas.failure.rowData'));
              return;
            }
            this.$msg.success(this.$t('routineAtlas.success.rowData'));
          })
          .catch((err) => {
            this.$msg.error(err);
          })
          .finally(() => {
            this.request(this.requestParam);
            this.hideOperationBox();
          });
      });
    },
    handleParamList(tempParam, number, arr) {
      // 过滤掉无用参数或默认参数
      let compareParamList = arr.filter((item) => item.sensorId && item.dataType);
      if (!tempParam || !tempParam.sensorId) {
        return compareParamList;
      }
      // 如果参数列表为空，则直接添加
      if (compareParamList.length === 0) {
        compareParamList.push(tempParam);
        return compareParamList;
      }
      // 最新参数是否包含在现有参数列表中
      const noSameParam = !compareParamList.some((i) => i.sensorId === tempParam.sensorId);
      // 如果请求参数列表长度大于分屏数，则裁剪
      if (compareParamList.length > number) {
        compareParamList = compareParamList.splice(compareParamList.length - number);
        const currentParam = compareParamList.find((i) => i.sensorId === tempParam.sensorId);
        if (!currentParam) {
          compareParamList.shift();
          compareParamList.unshift(tempParam);
        }
      }
      if (noSameParam) {
        // 最新请求参数与当前参数列表里的元素均不相同时
        if (compareParamList.length === number) {
          // 弹出栈首参数
          compareParamList.shift();
        }
        // 栈尾压入最新参数
        compareParamList.push(tempParam);
      } else {
        // 替换最新参数
        this.replaceParam(compareParamList, tempParam);
      }
      return compareParamList;
    },
    replaceParam(compareParamList, tempParam) {
      let idx = null;
      compareParamList.every((r, index) => {
        if (r.sensorId === tempParam.sensorId) {
          idx = index;
          return false;
        }
        return true;
      });
      if (idx !== null) {
        compareParamList.splice(idx, 1, tempParam);
      }
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
  .operation-box {
    padding: 10px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    font-size: 12px;
    position: absolute;
    display: none;
    z-index: 99;
    .cms-a-btn {
      display: block;
    }
  }
}
</style>
