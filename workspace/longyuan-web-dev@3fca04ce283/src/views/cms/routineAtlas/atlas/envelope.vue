<template>
  <div class="charts-box" ref="chartBox">
    <div class="myChart" :ref="sid"></div>
    <span class="chart-box-title">{{ $t('routineAtlas.selectTypes.envelope') }}</span>
    <div class="box">
      <span class="mr-10">{{ $t('routineAtlas.filterAnalysis') }}</span>
      <section>
        <el-input
          :placeholder="$t('routineAtlas.placeholder.startFrequency')"
          v-model.number="startFrequency"
        ></el-input>
        --
        <el-input :placeholder="$t('routineAtlas.placeholder.endFrequency')" v-model.number="endFrequency"></el-input>
        <i class="search-bg" @click="searchFrequency"></i>
      </section>
    </div>
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
    <template v-if="requestParam && requestParam.dataType === 'HISTORY'">
      <div ref="contextMenu" class="context-menu">
        <div>
          <el-button size="mini" type="text" @click="toBasicSet">{{
            $t('routineAtlas.selectTypes.drawFrequencyDoubling')
          }}</el-button>
        </div>
        <div>
          <el-button size="mini" type="text" @click="toDrawEdge">{{
            $t('routineAtlas.selectTypes.drawSideband')
          }}</el-button>
        </div>
        <div>
          <el-button size="mini" type="text" @click="clearDraw">{{
            $t('routineAtlas.selectTypes.clearDrawing')
          }}</el-button>
        </div>
      </div>
    </template>
    <template v-if="this.edgeDataArr.length">
      <div class="sideband-content">
        <p>Sideband Values</p>
        <ul>
          <li
            v-for="(item, index) in this.edgeDataArr"
            :key="index"
            :style="{ color: item.isCenter ? '#f00' : '#1890ff' }"
          >
            <el-row>
              <el-col :span="6" :style="{ borderRight: '1px solid #333', textAlign: 'center' }">{{
                index === 5 ? 'center' : index - 5
              }}</el-col>
              <el-col :span="18" style="text-align: center">
                <span>{{ item.y }}</span>
                <span class="ml-5 mr-5">@</span>
                <span>{{ item.x }}</span>
              </el-col>
            </el-row>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import * as echarts from 'echarts';
import StompService from '@/util/StompService';
import { extractWorkshopId, isValueExist } from '@/util/commonService';
import mixin from './mixin';
import BasicSetModal from '../modal/basicSetModal.vue';
import WaveFilterModal from '../modal/waveFilterModal.vue';

export default {
  name: 'Envelope',
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
      minFrequency: 0, // 频率最小值
      maxFrequency: 0, // 频率最大值
      xData: [],
      yData: [],
      // 倍频
      singleCursor: null,
      basicDataArr: [],
      // 边频
      edgeDataArr: [],
      edgeDragIndex: -1,
      edgeCenterValue: 0,
      edgeInterval: 0,
      // 细化谱
      isZoomSelect: false, // 是否在选取范围（滤波需求）
      leftBoundary: 0, // 选取的左边界
      rightBoundary: 0, // 选取的右边界
      // 频带参数
      sF: 0, // 开始频段-传参进来
      eF: 0, // 结束频段-传参进来

      endFrequency: '6000',
      startFrequency: '0',
    };
  },
  computed: {
    ...mapState('cms/atlas', ['refreshTime']),
    ...mapState('cms/pass', ['passList', 'hierarchy']),
    ...mapState('cms/chart', ['frequencyBand']),
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
    requestParam(value) {
      if (!this) return;
      this.clearDraw();
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
    chart(val) {
      if (!val || !val.id) {
        return;
      }
      // 滤波
      this.chart.getZr().on('mousedown', this.onAreaMouseDown);
      // 倍频
      this.chart.getZr().on('mousedown', this.onSingleClick);
      // 鼠标右键
      this.chart.getZr().on('contextmenu', this.onContextMenu);
      // 边频
      this.chart.on('mousedown', this.onEdgeMouseDown);
    },
    // 频段
    frequencyBand(val) {
      if (!val) {
        this.sF = 0;
        this.eF = 0;
        return;
      }
      const arr = val.split('-');
      this.sF = arr[0];
      this.eF = arr[1];
      this.setFrequencyBand();
    },
  },
  methods: {
    toDestroy() {
      if (this.chart) {
        // 滤波
        this.chart.getZr().off('mousedown', this.onAreaMouseDown);
        // 倍频
        this.chart.getZr().off('mousedown', this.onSingleClick);
        // 细化谱
        this.chart.getZr().off('mousedown', this.onAreaMouseDown);
        // 鼠标右键
        this.chart.getZr().off('contextmenu', this.onContextMenu);
        // 边频
        this.chart.off('mousedown', this.onEdgeMouseDown);
      }
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
          xAxisUnit: 'Hz',
          dataTypeText: this.$t('routineAtlas.selectTypes.history'),
          dataType: 'HISTORY',
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
            xAxisUnit: 'Hz',
            dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
            dataType,
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
        xAxisUnit,
        velocitySensorId,
        extensionType,
        identifierName,
        identifierOriginalDataType,
      } = param;
      const workshopId = extractWorkshopId(this.passList, machineId);
      if (!sensorId || !xAxisUnit || startAt === endAt) {
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
        velocitySensorId,
        type: xAxisUnit,
        extensionType,
        identifier: identifierOriginalDataType,
        lowCut: this.startFrequency,
        highCut: this.endFrequency,
      };
      if (identifierOriginalDataType !== 'longOriginalData') delete params.identifier;
      // 加载中
      this.chart &&
        this.chart.showLoading({
          textColor: 'rgba(255, 255, 255, 0.85)',
          maskColor: 'rgba(10, 40, 63, 0.8)',
        });
      this.$api.routineAtlas
        .getEnvelopeMap(sensorId, params)
        .then((res) => {
          let xAxis = [];
          let yAxis = [];
          let textObj = {};
          let rotingVelocity;
          if (!res || !res.data || res.data.length === 0) {
            // 后台返回数据为空，绘制空图
            xAxis = [];
            yAxis = [];
            textObj = {
              sensorName,
              identifierName,
              identifierValue: '--',
              identifierUnit: 'm/s²',
              xAxisUnit,
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
              dataType: 'HISTORY',
              extensionType,
            };
          } else {
            if (res.data[0].frequency && res.data[0].frequency.length > 0) {
              xAxis = res.data[0].frequency.splice(1);
            }
            if (res.data[0].order && res.data[0].order.length > 0) {
              xAxis = res.data[0].order.splice(1);
            }
            if (res.data[0].acceleration && res.data[0].acceleration.length > 0) {
              yAxis = res.data[0].acceleration.splice(1);
            }
            textObj = {
              sensorName,
              identifierName,
              identifierValue: isValueExist(res.data[0].accelerationPeak)
                ? res.data[0].accelerationPeak.toFixed(6)
                : '--',
              identifierUnit: 'm/s²',
              xAxisUnit,
              dataTypeText: this.$t('routineAtlas.selectTypes.history'),
              dataType,
              extensionType,
            };
            rotingVelocity = res.data[0].rotingVelocity;
          }
          this.xData = xAxis;
          this.yData = yAxis;
          // 绘图
          this.draw(
            {
              xAxis,
              yAxis,
              textObj,
            },
            rotingVelocity
          );
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
      if (type === 'Hz' && velocitySensorId) {
        return `/ws/${sensorId}/envelope/orderSensorId/${velocitySensorId}`;
      }
      return `/ws/${sensorId}/envelope`;
    },
    connectStomp(param) {
      if (!this) return;
      const { sensorId, type, velocitySensorId } = param;
      this.stomp = new StompService();
      this.stomp.connect(() => {
        if (!this) return;
        this.subscribe(this.computedSubscribeUrl(sensorId, type, velocitySensorId), param);
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
      const { sensorId, type, velocitySensorId } = param;
      this.subscription && this.subscription.unsubscribe();
      this.subscription = null;
      this.subscribe(this.computedSubscribeUrl(sensorId, type, velocitySensorId), param);
    },
    subscribe(url, param) {
      if (!this) return;
      const { sensorName, dataType, xAxisUnit, identifierName } = param;
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
        // 包络分析图
        if (body.frequency && body.frequency.length > 0) {
          xAxis = body.frequency;
        }
        if (body.order && body.order.length > 0) {
          xAxis = body.order.splice(1);
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
              xAxisUnit,
              dataTypeText: this.$t('routineAtlas.selectTypes.realtime'),
              dataType,
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
    draw(response, rotingVelocity) {
      const { xAxis, yAxis, textObj } = response;
      const {
        sensorName,
        dataTypeText,
        dataType,
        identifierName,
        identifierValue,
        identifierUnit,
        xAxisUnit,
        extensionType,
      } = textObj;

      // const identifierName = this.$t('routineAtlas.accelerationPeak');
      const xAxisText = this.$t('routineAtlas.frequencyAxis');
      let yUnit = 'm/s²';
      let yAxisText = `${identifierName}(${yUnit})`;
      if (extensionType === 'speed') {
        yUnit = 'm/s';
        yAxisText = `${identifierName}(${yUnit})`;
      }

      const chartTitleText = this.$t('routineAtlas.selectTypes.envelope');
      const subTitleText = this.$t('routineAtlas.subTextNew', {
        // 0: sensorName,
        0: identifierName,
        1: identifierValue,
        2: yUnit,
      });

      const data = [];
      for (let i = 0; i < xAxis.length; i += 1) {
        data.push([xAxis[i], yAxis[i]]);
      }

      this.minFrequency = 0;
      this.maxFrequency = 0;
      if (xAxis.length > 0) {
        this.minFrequency = xAxis[0];
        this.maxFrequency = xAxis[xAxis.length - 1];
      }

      let series;
      if (dataType === 'HISTORY') {
        series = [
          {
            name: yAxisText,
            type: 'line',
            data,
            showSymbol: false,
            showAllSymbol: false,
            lineStyle: {
              color: '#02879F',
            },
            markLine: {
              label: {
                show: false,
                position: 'end',
                formatter(p) {
                  return `${p.value} ${xAxisUnit}`;
                  // return '▼';
                },
                textStyle: {
                  color: '#1890ff',
                  fontSize: 12,
                },
              },
              lineStyle: {
                width: 1,
              },
              symbol: ['none', 'none'],
              data: [],
            },
            markArea: {
              itemStyle: {
                color: 'rgba(255, 173, 177, 0.4)',
              },
              // data: [[{ xAxis: this.leftBoundary }, { xAxis: this.rightBoundary }]],
            },
          },
        ];
      } else {
        series = [
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
        ];
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
            return `${xAxisText}: ${isValueExist(params[0].value[0]) ? params[0].value[0] : ''} ${xAxisUnit}<br />
            ${yAxisText}: ${isValueExist(params[0].value[1]) ? params[0].value[1] : ''} ${yUnit}`;
          },
        },
        // legend: {
        //   data: [yAxisText],
        //   x: 'left',
        // },
        xAxis: {
          type: 'value',
          name: `${xAxisText}(${xAxisUnit})`,
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
          },
          splitLine: {
            show: false,
          },
          max: this.maxFrequency ? Math.ceil(this.maxFrequency) : null,
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
        series,
      };

      if (!this.firstDraw) {
        this.chart && this.chart.setOption(option);
        // 判断是否有频段参数传入
        if (this.frequencyBand) {
          const arr = this.frequencyBand.split('-');
          this.sF = arr[0];
          this.eF = arr[1];
          this.setFrequencyBand();
        }
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
    setFrequencyBand() {
      if (this.sF === this.eF) return;
      const option = this.chart.getOption();
      if (option.series[0].data.length === 0) return;

      this.chart.setOption({
        dataZoom: [
          {
            start: null,
            end: null,
            startValue: this.sF,
            endValue: this.eF,
          },
        ],
      });
    },
    // ====== 滤波逻辑 begin ======
    onAreaMouseDown(e) {
      // 绘制倍频时不处理细化谱逻辑
      if (this.basicDataArr.length > 0) return false;
      // 绘制边频时不处理细化谱逻辑
      if (this.edgeDataArr.length > 0) return false;
      // 超出图谱绘制区域，不处理
      const gridWidth = this.$refs.chartBox ? this.$refs.chartBox.offsetWidth : 0;
      const gridHeight = this.$refs.chartBox ? this.$refs.chartBox.offsetHeight : 0;
      if (e.offsetX < 80 || e.offsetX > gridWidth - 80 || e.offsetY < 56 || e.offsetY > gridHeight - 50) {
        this.leftBoundary = 0;
        this.rightBoundary = 0;
        this.isZoomSelect = false;
        this.chart.getZr().off('mousemove', this.onAreaMouseMove);
        document.removeEventListener('mouseup', this.onAreaMouseUp, false);
        return false;
      }
      // 没数据时不执行
      const option = this.chart.getOption();
      if (option.series[0].data.length === 0) return false;
      this.isZoomSelect = true;
      const pos = this.chart.convertFromPixel('grid', [e.offsetX, e.offsetY]);
      this.leftBoundary = pos[0];
      this.rightBoundary = pos[0];
      this.resetMarkArea();
      this.chart.getZr().on('mousemove', this.onAreaMouseMove);
      document.addEventListener('mouseup', this.onAreaMouseUp, false);
    },
    onAreaMouseMove(e) {
      e && e.stop && e.stop();
      // 绘制倍频时不处理细化谱逻辑
      if (this.basicDataArr.length > 0) return;
      // 绘制边频时不处理细化谱逻辑
      if (this.edgeDataArr.length > 0) return;
      // 当倍频或边频线在拖动时，细化谱功能置后
      if (this.isLineDrag) return false;
      if (!this.isZoomSelect) return false;
      const pos = this.chart.convertFromPixel('grid', [e.offsetX, e.offsetY]);
      this.rightBoundary = pos[0];
      this.resetMarkArea();
    },
    onAreaMouseUp(e) {
      e.preventDefault();
      this.isZoomSelect = false;
      this.chart.getZr().off('mousemove', this.onAreaMouseMove);
      document.removeEventListener('mouseup', this.onAreaMouseUp, false);
      this.getZoom();
    },
    resetMarkArea() {
      const _this = this;
      this.chart.setOption({
        series: [
          {
            markArea: {
              data: [[{ xAxis: this.leftBoundary }, { xAxis: this.rightBoundary }]],
            },
          },
        ],
      });
    },
    getZoom() {
      const option = this.chart.getOption();
      if (option.series[0].data.length === 0) return;
      if (this.leftBoundary === this.rightBoundary) return;
      let startFrequency = this.leftBoundary;
      let endFrequency = this.rightBoundary;
      if (startFrequency > endFrequency) {
        startFrequency = this.rightBoundary;
        endFrequency = this.leftBoundary;
      }
      const winData = {
        requestParam: {
          ...this.requestParam,
          lowCut: startFrequency,
          highCut: endFrequency,
        },
      };
      this.$modal.show(this.$t('routineAtlas.selectTypes.waveFilter'), WaveFilterModal, winData, '800px');
    },
    // ====== 滤波逻辑 end ======
    // ====== 倍频逻辑 begin ======
    onSingleClick(e) {
      // e && e.stop && e.stop();
      this.hideContextMenu();
      if (e.type !== 'mousedown') return false;
      if (e.which !== 1) return false;
      const gridWidth = this.$refs.chartBox ? this.$refs.chartBox.offsetWidth : 0;
      const gridHeight = this.$refs.chartBox ? this.$refs.chartBox.offsetHeight : 0;
      if (e.offsetX < 80 || e.offsetX > gridWidth - 80) return false;
      if (e.offsetY < 56 || e.offsetY > gridHeight - 50) return false;
      // 有边频绘制时，不允许单选游标绘制，避免与拖拽发生冲突
      if (this.edgeDataArr.length > 0) return false;
      // 没数据时不执行
      const option = this.chart.getOption();
      if (option.series[0].data.length === 0) return false;
      const pos = this.chart.convertFromPixel('grid', [e.offsetX, e.offsetY]);
      this.singleCursor = { x: pos[0].toFixed(2), y: pos[1].toFixed(6) };
      this.resetMarkLine();
    },
    onContextMenu(e) {
      e && e.stop && e.stop();
      if (e.type !== 'contextmenu') return false;
      if (this.singleCursor === null) return false;
      this.showContextMenu(e.offsetX, e.offsetY);
      return false;
    },
    showContextMenu(offsetX, offsetY) {
      if (this.$refs && this.$refs.contextMenu) {
        this.$refs.contextMenu.style.display = 'block';
        this.$refs.contextMenu.style.top = `${offsetY}px`;
      }
      this.$refs.contextMenu.style.left = `${offsetX}px`;
    },
    hideContextMenu() {
      this.$refs && this.$refs.contextMenu && (this.$refs.contextMenu.style.display = 'none');
    },
    toBasicSet() {
      const winData = {
        x: this.singleCursor.x,
        y: this.singleCursor.y,
      };
      this.$modal.show(
        `${this.$t('routineAtlas.selectTypes.frequencyDoublingSetting')}`,
        BasicSetModal,
        winData,
        '600px',
        this.toDrawBasicMarkLine
      );
      this.hideContextMenu();
    },
    toDrawBasicMarkLine(param) {
      this.singleCursor.x = param.x;
      this.edgeDataArr = [];
      this.basicDataArr = this.computedBasicDatas(param.x, param.basicNum, this.minFrequency, this.maxFrequency);
      this.resetMarkLine();
    },
    computedBasicDatas(xValue, basicNum, min, max) {
      const basic = (xValue - min) / basicNum;
      const res = [];
      let start = min;
      while (start <= max) {
        start += basic;
        res.push(start.toFixed(2));
      }
      return res;
    },
    // ====== 倍频逻辑 end ======
    // ====== 边频逻辑 begin ======
    toDrawEdge() {
      this.hideContextMenu();
      this.basicDataArr = [];
      this.centerValue = parseInt(this.singleCursor.x, 10);
      this.edgeInterval = this.computedInterval(this.centerValue);
      this.edgeDataArr = this.computedEdgeDatas(this.centerValue, this.edgeInterval);
      this.resetMarkLine(false);
    },
    computedInterval(centerValue, sV, eV) {
      if (!sV && !eV) {
        const dataZoom = this.chart.getOption().dataZoom[0];
        const startValue = dataZoom.startValue;
        const endValue = dataZoom.endValue;
        let interval;
        if (centerValue - startValue <= endValue - centerValue) {
          interval = (centerValue - startValue) / 15;
        } else {
          interval = (endValue - centerValue) / 15;
        }
        return interval;
      }
      if (sV) {
        return (centerValue - sV) / 5;
      }
      return (eV - centerValue) / 5;
    },
    computedEdgeDatas(centerValue, interval) {
      const res = [];
      for (let i = 5; i > 0; i -= 1) {
        const [x1, y1] = this.calculateXY(centerValue - i * interval);
        res.push({ x: x1.toFixed(2), y: y1.toFixed(6) });
      }
      const [x, y] = this.calculateXY(centerValue);
      res.push({ x: x.toFixed(2), y: y.toFixed(6), isCenter: true });
      for (let i = 1; i <= 5; i += 1) {
        const [x2, y2] = this.calculateXY(centerValue + i * interval);
        res.push({ x: x2.toFixed(2), y: y2.toFixed(6) });
      }
      return res;
    },
    calculateXY(target) {
      let result;

      let left = 0;
      let right = this.xData.length - 1;
      let mid;

      let leftDiff;
      let rightDiff;

      while (right - left > 1) {
        mid = Math.floor((left + right) / 2);
        if (target < this.xData[mid]) {
          right = mid;
        } else if (target > this.xData[mid]) {
          left = mid;
        } else {
          result = mid;
          break;
        }
      }
      if (!result) {
        if (target > this.xData[mid]) {
          leftDiff = Math.abs(target - this.xData[mid]);
          rightDiff = Math.abs(this.xData[mid + 1] - target);
          if (leftDiff > rightDiff) {
            result = mid + 1;
          } else {
            result = mid;
          }
        } else {
          leftDiff = Math.abs(target - this.xData[mid - 1]);
          rightDiff = Math.abs(this.xData[mid] - target);
          if (leftDiff > rightDiff) {
            result = mid;
          } else {
            result = mid - 1;
          }
        }
      }
      let x;
      let y;
      if (result) {
        x = this.xData[result];
        y = this.yData[result];
      } else {
        x = target;
        y = 0;
      }
      return [x, y];
    },
    onEdgeMouseDown(params) {
      const { componentType, event, value } = params;
      // event && event.stop && event.stop();
      if (componentType !== 'markLine') return false;
      // 第1条线和第11条线可以进行边频缩放，第6条线可以进行边频位置挪动
      const index = this.edgeDataArr.findIndex((d) => `${d.x}` === value);
      if (![0, 5, 10].includes(index)) {
        return;
      }
      this.edgeDragIndex = index;
      this.chart.getZr().on('mousemove', this.onEdgeMouseMove);
      document.addEventListener('mouseup', this.onEdgeMouseUp, false);
    },
    onEdgeMouseMove(e) {
      e && e.stop && e.stop();
      if (![0, 5, 10].includes(this.edgeDragIndex)) {
        return;
      }
      const pos = this.chart.convertFromPixel('grid', [e.offsetX, e.offsetY]);
      if (this.edgeDragIndex === 5) {
        this.centerValue = pos[0];
        this.edgeDataArr = this.computedEdgeDatas(this.centerValue, this.edgeInterval);
        this.resetMarkLine(false);
        return;
      }
      if (this.edgeDragIndex === 0) {
        const sV = pos[0];
        this.edgeInterval = this.computedInterval(this.centerValue, sV);
        this.edgeDataArr = this.computedEdgeDatas(this.centerValue, this.edgeInterval);
        this.resetMarkLine(false);
        return;
      }
      if (this.edgeDragIndex === 10) {
        const eV = pos[0];
        this.edgeInterval = this.computedInterval(this.centerValue, null, eV);
        this.edgeDataArr = this.computedEdgeDatas(this.centerValue, this.edgeInterval);
        this.resetMarkLine(false);
      }
    },
    onEdgeMouseUp(e) {
      e.preventDefault();
      this.edgeDragIndex = -1;
      this.chart.getZr().off('mousemove', this.onEdgeMouseMove);
      document.removeEventListener('mouseup', this.onEdgeMouseUp, false);
    },
    // ====== 边频逻辑 end ======
    resetMarkLine(drawSingleCursor = true) {
      // 倍频时可以绘制单频线，边频时不绘制单频线
      let res = [];
      let beginIndex = 0;
      if (drawSingleCursor) {
        beginIndex = -1;
        res.push({
          xAxis: this.singleCursor.x,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
            type: 'solid',
          },
          label: {
            show: true,
          },
        });
      }
      if (this.basicDataArr && this.basicDataArr.length > 0) {
        res = res.concat(
          this.basicDataArr.map((item) => ({
            xAxis: item,
            lineStyle: {
              color: '#358536',
              type: 'solid',
            },
            label: {
              show: true,
              position: 'insideEndBottom',
              formatter(params) {
                return `${params.dataIndex + beginIndex + 1}X`;
              },
            },
          }))
        );
      }
      if (this.edgeDataArr && this.edgeDataArr.length > 0) {
        res = res.concat(
          this.edgeDataArr.map((item, index) => ({
            xAxis: item.x,
            symbol: 'triangle',
            lineStyle: {
              color: item.isCenter ? '#f00' : '#358536',
              type: item.isCenter ? 'solid' : 'dotted',
              width: item.isCenter ? 2 : 1,
              cursor: 'move',
            },
            label: {
              show: !!item.isCenter,
            },
          }))
        );
      }
      this.chart.setOption({
        series: [
          {
            markLine: {
              data: res,
            },
          },
        ],
      });
    },
    // 清除绘制
    clearDraw() {
      this.singleCursor = null;
      this.hideContextMenu();
      this.basicDataArr = [];
      this.edgeDataArr = [];
      this.edgeDragIndex = -1;
      this.edgeCenterValue = 0;
      this.edgeInterval = 0;
      this.resetMarkLine(false);
    },
    // 搜索频率
    searchFrequency() {
      if (this.endFrequency <= this.startFrequency) return;
      this.request(this.requestParam);
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
  .box {
    position: absolute;
    top: 10px;
    left: 10%;
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.85);
    section {
      height: 28px;
      display: flex;
      align-items: center;
      border: 1px solid #13435c;
      background-color: #0d334b;
      color: rgba(255, 255, 255, 0.65);
      /deep/.el-input {
        width: auto !important;
      }
      /deep/.el-input__inner {
        width: 80px;
        height: 28px;
        padding-left: 13px;
        background-color: #0d334b;
        color: rgba(255, 255, 255, 0.85);
        border: 0;
        box-sizing: border-box;
      }
      ::-webkit-input-placeholder {
        color: rgba(255, 255, 255, 0.45);
      }
      .search-bg {
        display: inline-block;
        width: 34px;
        height: 28px;
        background: url('~@/assets/images/button-reset-selected.png') no-repeat;
        cursor: pointer;
      }
    }
  }
  .context-menu {
    display: none;
    position: absolute;
    padding: 5px 10px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
    border-radius: 4px;
  }
  .sideband-content {
    position: absolute;
    border: 1px solid #333;
    top: 40px;
    right: 20px;
    width: 220px;
    background-color: #eee;
    font-size: 12px;
    ul {
      li {
        list-style: none;
      }
    }
    p {
      border-bottom: 1px solid #333;
      text-align: center;
      color: #1890ff;
    }
  }
}
</style>
