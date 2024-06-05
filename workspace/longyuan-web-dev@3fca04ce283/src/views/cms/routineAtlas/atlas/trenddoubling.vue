<template>
  <div class="charts-box">
    <div class="myChart" :ref="sid"></div>
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
import { trendDoublingTypes } from '@/util/selectTypes';
import { extractWorkshopId, isValueExist } from '@/util/commonService';
import mixin from './mixin';

export default {
  name: 'TrendDoubling',
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
      subscription1: null,
      subscription2: null,
      firstDraw: true,
      // 实时数据，由于实时数据每次只更新一条，所以需要将每次返回的数据缓存起来
      realData1: [],
      realData2: [],
      realtimeTrendTimeArr1: [],
      realtimeTrendDataArr1: [],
      realtimeTrendTimeArr2: [],
      realtimeTrendDataArr2: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    this.$emit('on-chart-item-add', this);
    this.chart = echarts.init(this.$refs[this.sid]);
    this.chart.resize();
    this.toDrawBlank();
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
        this.toDrawBlank();
        return;
      }
      this.firstDraw = true;
      const requestParamArr = this.handleDoubleTrendInputParams(value);
      this.renderChart(requestParamArr);
    },
    windowResize() {
      this.chart && this.chart.resize();
    },
  },
  methods: {
    toDestroy() {
      this.chart = null;
      this.closeStomp();
    },
    toDrawBlank() {
      this.draw([], [], {
        sensorName: '--',
        dataTypeText: this.$t('routineAtlas.selectTypes.history'),
        doublingText: '--',
        identifierName1: '速度1X幅值',
        unit1: '--',
        identifierName2: '速度1X相位',
        unit2: '--',
        trendDoubling: '1',
      });
    },
    // 根据倍频参数生成请求参数
    handleDoubleTrendInputParams(param) {
      let arr = [];
      if (!param) {
        return arr;
      }
      const { sensorId, identifierList, trendDoubling } = param;
      if (!sensorId || !identifierList || identifierList.length === 0) {
        return arr;
      }
      if (['1', '2'].includes(trendDoubling)) {
        const identifier1 = identifierList.find((i) => i.identifier === `${trendDoubling}XspeedEffective`);
        const identifier2 = identifierList.find((i) => i.identifier === `phase${trendDoubling}X`);
        if (!identifier1 || !identifier2) {
          return arr;
        }
        arr = [
          {
            ...param,
            identifier: identifier1.identifier,
            identifierName: identifier1.name,
            unit: (identifier1.metadata && identifier1.metadata.unit) || '--',
          },
          {
            ...param,
            identifier: identifier2.identifier,
            identifierName: identifier2.name,
            unit: (identifier2.metadata && identifier2.metadata.unit) || '--',
          },
        ];
      }
      return arr;
    },
    renderChart(requestParamArr) {
      // 每次请求，要清除实时缓存的数据
      this.resetRealtimeTrendData();
      if (requestParamArr.length !== 2) {
        this.toDrawBlank();
        return;
      }
      const { sensorName, dataType, trendDoubling } = requestParamArr[0];
      const { identifierName: identifierName1, unit: unit1 } = requestParamArr[0];
      const { identifierName: identifierName2, unit: unit2 } = requestParamArr[1];
      if (dataType === 'HISTORY') {
        this.closeStomp();
        // 历史数据，发送http请求
        this.request(requestParamArr);
      } else if (dataType === 'REALTIME') {
        // 实时数据，一开始websocket不会推送数据，需要先绘制一个空图形
        this.draw([], [], {
          sensorName,
          dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
          doublingText: this.$t(trendDoublingTypes.find((i) => i.value === trendDoubling).label),
          identifierName1,
          unit1,
          identifierName2,
          unit2,
          trendDoubling: '1',
        });
        // 实时数据，发起websocket连接
        if (!this.stomp) {
          this.connectStomp(requestParamArr);
        } else {
          this.resetsubscribe(requestParamArr);
        }
      }
    },
    request(requestParamArr) {
      const { machineId, sensorId, sensorName, dataType, trendDoubling, startAt, endAt } = requestParamArr[0];
      const workshopId = extractWorkshopId(this.passList, machineId);
      const { identifier: identifier1, identifierName: identifierName1, unit: unit1 } = requestParamArr[0];
      const { identifier: identifier2, identifierName: identifierName2, unit: unit2 } = requestParamArr[1];
      if (!sensorId) {
        // 空请求数据，直接绘制空图
        this.draw([], [], {
          sensorName: '--',
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          doublingText: '--',
          identifierName1: '速度1X幅值',
          unit1: '--',
          identifierName2: '速度1X相位',
          unit2: '--',
          trendDoubling: '1',
        });
        return;
      }
      // 加载中
      this.chart.showLoading();
      Promise.all([
        this.$api.routineAtlas.getTrendMap(sensorId, {
          workshopId,
          identifier: identifier1,
          dataType,
          startAt,
          endAt,
        }),
        this.$api.routineAtlas.getTrendMap(sensorId, {
          workshopId,
          identifier: identifier2,
          dataType,
          startAt,
          endAt,
        }),
      ])
        .then(([res1, res2]) => {
          const data1 = [];
          const data2 = [];
          if (res1 && res1.timestamp && res1.timestamp.length > 0 && res1 && res1.value && res1.value.length > 0) {
            const x = res1.timestamp;
            const y = res1.value;
            for (let i = 0; i < x.length; i += 1) {
              data1.push([x[i], y[i]]);
            }
          }
          if (res2 && res2.timestamp && res2.timestamp.length > 0 && res2 && res2.value && res2.value.length > 0) {
            const x = res2.timestamp;
            const y = res2.value;
            for (let i = 0; i < x.length; i += 1) {
              data2.push([x[i], y[i]]);
            }
          }
          this.draw(data1, data2, {
            sensorName,
            dataTypeText: this.$t('routineAtlas.selectTypes.history'),
            doublingText: this.$t(trendDoublingTypes.find((i) => i.value === trendDoubling).label),
            identifierName1,
            unit1,
            identifierName2,
            unit2,
            trendDoubling,
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          // 加载停止
          this.chart.hideLoading();
        });
    },
    computedSubscribeUrl(sensorId, identifier) {
      return `/ws/${sensorId}/tendency/${identifier}`;
    },
    connectStomp(requestParamArr) {
      if (!this) return;
      const { identifier: identifier1, sensorId: sensorId1 } = requestParamArr[0];
      const { identifier: identifier2, sensorId: sensorId2 } = requestParamArr[1];
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        this.subscribe(this.computedSubscribeUrl(sensorId1, identifier1), requestParamArr, 1);
        this.subscribe(this.computedSubscribeUrl(sensorId2, identifier2), requestParamArr, 2);
      });
    },
    closeStomp() {
      if (this.subscription1) {
        this.subscription1.unsubscribe();
        this.subscription1 = null;
      }
      if (this.subscription2) {
        this.subscription2.unsubscribe();
        this.subscription2 = null;
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
    resetsubscribe(requestParamArr) {
      if (!this) return;
      const { identifier: identifier1, sensorId: sensorId1 } = requestParamArr[0];
      const { identifier: identifier2, sensorId: sensorId2 } = requestParamArr[1];
      this.subscription1 && this.subscription1.unsubscribe();
      this.subscription1 = null;
      this.subscription2 && this.subscription2.unsubscribe();
      this.subscription2 = null;
      this.subscribe(this.computedSubscribeUrl(sensorId1, identifier1), requestParamArr, 1);
      this.subscribe(this.computedSubscribeUrl(sensorId2, identifier2), requestParamArr, 2);
    },
    resetRealtimeTrendData() {
      this.realData1 = [];
      this.realData2 = [];
      this.realtimeTrendTimeArr1 = [];
      this.realtimeTrendDataArr1 = [];
      this.realtimeTrendTimeArr2 = [];
      this.realtimeTrendDataArr2 = [];
    },
    subscribe(url, requestParamArr, idx) {
      if (!this) return;
      const { sensorName, dataType, trendDoubling } = requestParamArr[0];
      const { identifierName: identifierName1, unit: unit1 } = requestParamArr[0];
      const { identifierName: identifierName2, unit: unit2 } = requestParamArr[1];
      this[`subscription${idx}`] = this.stomp.subscribe(url, this, (data, sub) => {
        if (this && sub) {
          this[`subscription${idx}`] = sub;
        }
        let { body } = data;
        if (body) {
          body = JSON.parse(body);
        }
        let x = [];
        let y = [];
        // 趋势图
        if (body.timestamp) {
          this[`realtimeTrendTimeArr${idx}`].push(body.timestamp);
          if (this[`realtimeTrendTimeArr${idx}`].length >= 61) {
            this[`realtimeTrendTimeArr${idx}`].shift();
          }
          x = this[`realtimeTrendTimeArr${idx}`];
        }
        if (body.value) {
          this[`realtimeTrendDataArr${idx}`].push(body.value);
          if (this[`realtimeTrendDataArr${idx}`].length >= 61) {
            this[`realtimeTrendDataArr${idx}`].shift();
          }
          y = this[`realtimeTrendDataArr${idx}`];
        }
        this[`realData${idx}`] = [];
        if (x.length > 0 && y.length > 0) {
          for (let i = 0; i < x.length; i += 1) {
            this[`realData${idx}`].push([x[i], y[i]]);
          }
        }

        if (!this.staticflag) {
          this.draw(this.realData1, this.realData2, {
            sensorName,
            dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
            doublingText: this.$t(trendDoublingTypes.find((i) => i.value === trendDoubling).label),
            identifierName1,
            unit1,
            identifierName2,
            unit2,
            trendDoubling,
          });
        }
      });
    },
    draw(data1, data2, textObj) {
      const { sensorName, dataTypeText, doublingText, unit1, identifierName2, unit2, trendDoubling } = textObj;
      const identifierName1 = `速度${trendDoubling}X幅值`;
      // const chartTitleText = this.$t('routineAtlas.selectTypes.trendDoubling');
      // const subTitleText = this.$t('routineAtlas.subText', {
      //   0: sensorName,
      //   1: doublingText,
      //   2: dataTypeText,
      // });
      const xAxisText = this.$t('routineAtlas.timeAxis');
      const option = {
        // title: {
        //   text: chartTitleText,
        //   subtext: subTitleText,
        //   left: 'center',
        // },
        legend: {
          data: [identifierName1, identifierName2],
          top: 'top',
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const currentCom = params[0];
            let res = '';
            if (currentCom.componentIndex === 0) {
              const x1 = isValueExist(params[0].value[0])
                ? this.$dateFormat.formatLocalDateTime(params[0].value[0])
                : '';
              const y1 = isValueExist(params[0].value[1]) ? params[0].value[1] : '';
              res += `${xAxisText}: ${x1}<br />`;
              res += `${identifierName1}: ${y1} ${unit1}<br /><br />`;
              if (params.length > 1) {
                const x2 = isValueExist(params[1].value[0])
                  ? this.$dateFormat.formatLocalDateTime(params[1].value[0])
                  : '';
                const y2 = isValueExist(params[1].value[1]) ? params[1].value[1] : '';
                res += `${xAxisText}: ${x2}<br />`;
                res += `${identifierName2}: ${y2} ${unit2}<br />`;
              }
            }
            if (currentCom.componentIndex === 1) {
              const x1 = isValueExist(params[0].value[0])
                ? this.$dateFormat.formatLocalDateTime(params[0].value[0])
                : '';
              const y1 = isValueExist(params[0].value[1]) ? params[0].value[1] : '';
              res += `${xAxisText}: ${x1}<br />`;
              res += `${identifierName2}: ${y1} ${unit2}<br /><br />`;
              if (params.length > 1) {
                const x2 = isValueExist(params[1].value[0])
                  ? this.$dateFormat.formatLocalDateTime(params[1].value[0])
                  : '';
                const y2 = isValueExist(params[1].value[1]) ? params[1].value[1] : '';
                res += `${xAxisText}: ${x2}<br />`;
                res += `${identifierName1}: ${y2} ${unit1}<br />`;
              }
            }
            return res;
          },
        },
        xAxis: [
          {
            gridIndex: 0,
            type: 'category',
            name: xAxisText,
            axisLabel: {
              formatter: (value) => this.$dateFormat.formatLocalDateTime(value, 'datetime\n'),
            },
            axisTick: {
              alignWithLabel: true,
            },
          },
          {
            gridIndex: 1,
            type: 'category',
            name: xAxisText,
            axisLabel: {
              formatter: (value) => this.$dateFormat.formatLocalDateTime(value, 'datetime\n'),
            },
          },
        ],
        yAxis: [
          {
            gridIndex: 0,
            type: 'value',
            name: `${identifierName1}(${unit1})`,
          },
          {
            gridIndex: 1,
            type: 'value',
            name: `${identifierName2}(${unit2})`,
          },
        ],
        series: [
          {
            xAxisIndex: 0,
            yAxisIndex: 0,
            type: 'line',
            name: identifierName1,
            data: data1,
            showSymbol: false,
            showAllSymbol: false,
          },
          {
            xAxisIndex: 1,
            yAxisIndex: 1,
            type: 'line',
            name: identifierName2,
            data: data2,
            showSymbol: false,
            showAllSymbol: false,
          },
        ],
      };

      if (!this.firstDraw) {
        this.chart && this.chart.setOption(option);
      }
      this.firstDraw = false;

      const newOption = {
        ...option,
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
        },
        dataZoom: [
          {
            show: 'true',
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0, 1],
          },
        ],
        grid: [
          {
            left: 100,
            right: 100,
            height: '22%',
          },
          {
            left: 100,
            right: 100,
            top: '58%',
            height: '22%',
          },
        ],
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
