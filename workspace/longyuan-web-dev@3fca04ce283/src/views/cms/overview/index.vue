<template>
  <div id="overview">
    <el-row :gutter="10">
      <el-col :span="6">
        <div class="chart cms-card">
          <div id="machineChart"></div>
        </div>
        <div class="chart cms-card">
          <div id="alertChart"></div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="cms-card">
          <my-map
            v-show="!hierarchy.id || hierarchy.type === 'ROOT' || hierarchy.type === 'PROJECT'"
            :mapMachineList="mapMachineList"
          ></my-map>
          <div
            v-loading="mapBoxLoading"
            class="mapBox"
            v-if="hierarchy.id && hierarchy.type !== 'ROOT' && hierarchy.type !== 'PROJECT'"
          >
            <d2-container better-scroll>
              <template v-if="hierarchy.type === 'FACTORY' && !sensorRectClick">
                <template v-if="workshopList.length > 0">
                  <div v-for="(item, index) in workshopList" :key="index">
                    <div class="factory-name">{{ item.workshopName }}</div>
                    <div
                      class="factory-list-box"
                      v-if="
                        item.machineCountDTO &&
                        item.machineCountDTO.machineInfoDTOList &&
                        item.machineCountDTO.machineInfoDTOList.length
                      "
                    >
                      <cms-status-rect
                        v-for="subItem in item.machineCountDTO.machineInfoDTOList"
                        :key="subItem.id"
                        :statusForm="subItem"
                        @handleRectClick="handleMachineRectClick"
                      ></cms-status-rect>
                    </div>
                  </div>
                </template>
                <cms-nodata v-if="workshopList.length === 0" :message="$t('overview.noWorkshopData')"></cms-nodata>
              </template>
              <template v-if="hierarchy.type === 'WORKSHOP' && !sensorRectClick">
                <template v-if="machineList.length > 0">
                  <cms-status-rect
                    v-for="item in machineList"
                    :key="item.id"
                    :statusForm="item"
                    @handleRectClick="handleMachineRectClick"
                  ></cms-status-rect>
                </template>
                <cms-nodata v-if="machineList.length === 0" :message="$t('overview.noMachineData')"></cms-nodata>
              </template>
              <template v-if="hierarchy.type === 'MACHINE' && !sensorRectClick">
                <template v-if="sensorList.length > 0">
                  <cms-status-rect
                    v-for="item in sensorList"
                    :key="item.id"
                    :statusForm="item"
                    @handleRectClick="handleMachineRectClick"
                  ></cms-status-rect>
                </template>
                <cms-nodata v-if="sensorList.length === 0" :message="$t('overview.noSensorData')"></cms-nodata>
              </template>
              <template v-if="hierarchy.type === 'MACHINE' && sensorRectClick">
                <div class="machine-name">
                  <a class="cms-a-btn" @click="handleBackToMachine">
                    <i class="el-icon-d-arrow-left"></i>
                    {{ hierarchy.name }}</a
                  >
                </div>
                <template v-if="variates.length > 0">
                  <cms-status-rect v-for="item in variates" :key="item.identifier" :statusForm="item"></cms-status-rect>
                </template>
                <cms-nodata v-if="variates.length === 0" :message="$t('overview.noVariateData')"></cms-nodata>
              </template>
            </d2-container>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <alarm-log></alarm-log>
    </el-row>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import * as echarts from 'echarts';
import debounce from 'lodash/debounce';
import moment from 'moment';
import d2Container from '@/components/d2-container/index';
import CmsNodata from '@/components/cms-nodata/index.vue';
import CmsStatusRect from '@/components/cms-status-rect/index.vue';
import { extractMachine, extractWorkshopId } from '@/util/commonService';
import AlarmLog from './alarmLog.vue';
import MyMap from './map.vue';

export default {
  name: 'overview',
  components: {
    d2Container,
    CmsNodata,
    CmsStatusRect,
    AlarmLog,
    MyMap,
  },
  data() {
    return {
      mapBoxLoading: false,
      machineChart: null,
      alertChart: null,
      // 右侧列表
      mapMachineList: [],
      workshopList: [],
      machineList: [],
      sensorList: [],
      variates: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy', 'sensorRectClick', 'passCollapse', 'passList']),
    ...mapState('system/layout', ['asideCollapse']),
  },
  mounted() {
    // 初始化机组图表
    this.machineChart = echarts.init(document.getElementById('machineChart'));
    this.drawMachineChart(0, 0, 0, 0);
    // 初始化告警图表
    this.alertChart = echarts.init(document.getElementById('alertChart'));
    const dataData = [0, 0, 0, 0, 0, 0, 0];
    const timeData = this.getDefaultWeekDateArr();
    this.drawAlarmChart(dataData, dataData, timeData, 0);

    const _this = this;
    setTimeout(() => {
      if (!_this.hierarchy || !_this.hierarchy.id) {
        if (_this.passList && _this.passList.length > 0) {
          this.judgeToFetchCount(_this.passList[0]);
          this.fetchAlarmCountData(_this.passList[0].id);
        }
      }
    }, 2000);

    // 监听窗口大小变化
    window.addEventListener('resize', this.onWindowResize, false);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.map = null;
    this.machineChart = null;
    this.alertChart = null;
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        if (oldValue && oldValue.id && value.id === oldValue.id) {
          return;
        }
        this.judgeToFetchCount(value);
        this.fetchAlarmCountData(value.id);
      },
      immediate: true,
    },
    asideCollapse: {
      handler(val) {
        this.onWindowResize();
      },
    },
    passCollapse: {
      handler(val) {
        this.onWindowResize();
      },
    },
  },
  methods: {
    ...mapMutations({
      saveSensorRectClick: 'cms/pass/saveSensorRectClick',
      saveReverseHierarchy: 'cms/pass/saveReverseHierarchy',
    }),
    getMachineList() {
      if (!this.passList || this.passList.length === 0) {
        return [];
      }
      const mList = [];
      extractMachine(this.passList, mList);
      return mList;
    },
    judgeToFetchCount(value) {
      if (value.type === 'PROJECT') {
        this.mapMachineList = this.getMachineList();
        this.fetchFactoryCountData(value.id);
      }
      if (value.type === 'FACTORY') {
        this.fetchWorkshopCountData(value.id);
      }
      if (value.type === 'WORKSHOP') {
        this.fetchMachineCountData(value.id);
      }
      if (value.type === 'MACHINE') {
        this.fetchSensorCountData(value.id);
      }
    },
    onWindowResize: debounce(
      function onWindowResize() {
        if (this.machineChart) {
          this.machineChart.resize();
        }
        if (this.alertChart) {
          this.alertChart.resize();
        }
      },
      300,
      { leading: false, trailing: true }
    ),
    getRecentWeekDateArr() {
      // 最近一周
      const end = moment().startOf('day').valueOf() + 24 * 3600 * 1000 - 1;
      const start = moment().subtract(6, 'days').startOf('day').valueOf();
      return [start, end];
    },
    getDefaultWeekDateArr() {
      const arr = new Array(7);
      const res = [];
      arr.forEach((e, index) => {
        if (index < 6) {
          res.push(
            this.$dateFormat.formatLocalDateTime(
              moment()
                .subtract(6 - index, 'days')
                .startOf('day')
                .valueOf()
            )
          );
        } else {
          res.push(this.$dateFormat.formatLocalDateTime(moment().startOf('day').valueOf()));
        }
      });
      return res;
    },
    fetchFactoryCountData(id) {
      if (!id) {
        return;
      }
      this.machineChart && this.machineChart.showLoading();
      this.$api.overview
        .getFactoryCount(id)
        .then((res) => {
          if (!res || res.length === 0) {
            this.drawMachineChart(0, 0, 0, 0);
            return;
          }
          let okNumber = 0;
          let attentionNumber = 0;
          let errorNumber = 0;
          res.forEach((e) => {
            okNumber += e.normalTotal || 0;
            attentionNumber += e.attentionTotal || 0;
            errorNumber += e.errorTotal || 0;
          });
          const total = okNumber + attentionNumber + errorNumber;
          this.drawMachineChart(okNumber, attentionNumber, errorNumber, total);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.machineChart && this.machineChart.hideLoading();
        });
    },
    fetchWorkshopCountData(id) {
      if (!id) {
        return;
      }
      this.mapBoxLoading = true;
      this.machineChart && this.machineChart.showLoading();
      this.$api.overview
        .getWorkshopCount(id)
        .then((res) => {
          if (!res || !res.workshopStatusDTOList || res.workshopStatusDTOList.length === 0) {
            this.workshopList = [];
            this.drawMachineChart(0, 0, 0, 0);
            return;
          }
          this.workshopList = res.workshopStatusDTOList;
          const okNumber = res.normalTotal || 0;
          const attentionNumber = res.attentionTotal || 0;
          const errorNumber = res.errorTotal || 0;
          const total = okNumber + attentionNumber + errorNumber;
          this.drawMachineChart(okNumber, attentionNumber, errorNumber, total);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.mapBoxLoading = false;
          this.machineChart && this.machineChart.hideLoading();
        });
    },
    fetchMachineCountData(id) {
      if (!id) {
        return;
      }
      this.mapBoxLoading = true;
      this.machineChart && this.machineChart.showLoading();
      this.$api.overview
        .getMachineCount(id)
        .then((res) => {
          if (!res || !res.machineInfoDTOList || res.machineInfoDTOList.length === 0) {
            this.machineList = [];
            this.drawMachineChart(0, 0, 0, 0);
            return;
          }
          this.machineList = res.machineInfoDTOList;
          const okNumber = res.normalTotal || 0;
          const attentionNumber = res.attentionTotal || 0;
          const errorNumber = res.errorTotal || 0;
          const total = okNumber + attentionNumber + errorNumber;
          this.drawMachineChart(okNumber, attentionNumber, errorNumber, total);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.mapBoxLoading = false;
          this.machineChart && this.machineChart.hideLoading();
        });
    },
    fetchSensorCountData(machineId) {
      if (!machineId) {
        return;
      }
      const workshopId = extractWorkshopId(this.passList, machineId);
      this.mapBoxLoading = true;
      this.machineChart && this.machineChart.showLoading();
      this.$api.overview
        .getSensorCount(machineId, workshopId)
        .then((res) => {
          if (!res || !res.sensorDTOList || res.sensorDTOList.length === 0) {
            this.sensorList = [];
            this.drawMachineChart(0, 0, 0, 0);
            return;
          }
          this.sensorList = res.sensorDTOList;
          const okNumber = res.normalTotal || 0;
          const attentionNumber = res.attentionTotal || 0;
          const errorNumber = res.errorTotal || 0;
          const total = okNumber + attentionNumber + errorNumber;
          this.drawMachineChart(okNumber, attentionNumber, errorNumber, total, true);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.mapBoxLoading = false;
          this.machineChart && this.machineChart.hideLoading();
        });
    },
    fetchVariateCountData(sensorId) {
      if (!sensorId) {
        return;
      }
      const workshopId = extractWorkshopId(this.passList, this.hierarchy.id);
      this.mapBoxLoading = true;
      this.$api.projectSet
        .getVariatesBySensorId(sensorId, workshopId)
        .then((res) => {
          if (!res || !res.id || !res.variates || res.variates.length === 0) {
            this.variates = [];
            return;
          }
          this.variates = res.variates;
        })
        .catch((err) => {
          this.variates = [];
          this.$msg.error(err);
        })
        .finally(() => {
          this.mapBoxLoading = false;
        });
    },
    drawMachineChart(okNumber, attentionNumber, errorNumber, totalNumber, isSensor) {
      const workGroupNumber = isSensor ? this.$t('overview.sensorNumber') : this.$t('overview.workGroupNumber');
      const okDevice = this.$t('overview.ok');
      const attentionDevice = this.$t('overview.attention');
      const errorDevice = this.$t('overview.error');
      const option = {
        title: {
          text: `${workGroupNumber} ${totalNumber}`,
          x: 'left',
          textStyle: {
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
        },
        legend: {
          top: '45%',
          left: '57%',
          orient: 'vetical',
          data: [okDevice, attentionDevice, errorDevice],
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
            return `${name} ${tarValue}`;
          },
        },
        color: ['#64c42d', '#f8cf00', '#df3317'],
        series: [
          {
            name: workGroupNumber,
            type: 'pie',
            radius: ['45%', '60%'],
            center: ['30%', '60%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '16',
                  fontWeight: 'bold',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: [
              { value: okNumber, name: okDevice },
              { value: attentionNumber, name: attentionDevice },
              { value: errorNumber, name: errorDevice },
            ],
            itemStyle: {
              borderWidth: 5,
              borderColor: '#fff',
            },
          },
        ],
      };
      if (!this || !this.machineChart) {
        return;
      }
      this.machineChart.setOption(option);
    },
    fetchAlarmCountData(hierarchyId) {
      const [start, end] = this.getRecentWeekDateArr();
      const params = {
        hierarchyId,
        beginTime: start,
        endTime: end,
      };
      this.alertChart && this.alertChart.showLoading();
      this.$api.overview
        .getAlarmCount(params)
        .then((res) => {
          if (!res || res.length === 0) {
            const dataData = [0, 0, 0, 0, 0, 0, 0];
            const timeData = this.getDefaultWeekDateArr();
            this.drawAlarmChart(dataData, dataData, timeData, 0);
            return;
          }
          const attentionArr = [];
          const errorArr = [];
          const timeArr = [];
          let total = 0;
          res.forEach((e) => {
            attentionArr.push(e.attentionTotal);
            errorArr.push(e.errorTotal);
            timeArr.push(this.$dateFormat.formatLocalDateTime(e.time, 'date'));
            total = total + e.attentionTotal + e.errorTotal;
          });
          this.drawAlarmChart(attentionArr, errorArr, timeArr, total);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.alertChart && this.alertChart.hideLoading();
        });
    },
    drawAlarmChart(attentionArr, errorArr, timeArr, totalNumber) {
      const warnErrorNumber = this.$t('overview.warnErrorNumber');
      const attention = this.$t('overview.attention');
      const error = this.$t('overview.error');
      const total = this.$t('overview.total');
      const option = {
        title: {
          text: `${warnErrorNumber} ${totalNumber}`,
          x: 'left',
          textStyle: {
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        legend: {
          bottom: 0,
          data: [attention, error],
        },
        color: ['#f8cf00', '#df3317'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '13%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: timeArr,
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: attention,
            type: 'bar',
            stack: total,
            label: {
              show: false,
              position: 'insideRight',
            },
            data: attentionArr,
          },
          {
            name: error,
            type: 'bar',
            stack: total,
            label: {
              show: false,
              position: 'insideRight',
            },
            data: errorArr,
          },
        ],
      };
      if (!this || !this.alertChart) {
        return;
      }
      this.alertChart.setOption(option);
    },
    handleMachineRectClick(item) {
      if (item.type === 'MACHINE') {
        this.saveReverseHierarchy({ machineId: item.id });
      }
      if (item.type === 'SENSOR') {
        this.saveSensorRectClick({ sensorRectClick: true });
        this.fetchVariateCountData(item.id);
      }
    },
    handleBackToMachine() {
      this.saveSensorRectClick({ sensorRectClick: false });
      this.variates = [];
    },
  },
};
</script>
<style lang="less">
#overview {
  box-sizing: border-box;
  padding-right: 20px;
  min-width: 976px;
  #machineChart {
    width: 100%;
    height: 244px;
  }
  #alertChart {
    width: 100%;
    height: 242px;
  }
  .mapBox {
    position: relative;
    height: 536px;
    min-height: 536px;
    .container-component {
      .d2-container-full-bs {
        border: none !important;
        right: 0 !important;
        .d2-container-full-bs__body {
          .d2-container-full-bs__body-wrapper-inner {
            padding: 10px !important;
          }
        }
      }
    }
    .noData-box {
      width: 100%;
      height: 300px;
      text-align: center;
    }
  }
  .chart:nth-child(1) {
    margin-bottom: 10px;
  }
  .factory-name {
    font-size: 16px;
    font-weight: bold;
    text-align: left;
    margin-bottom: 10px;
  }
  .factory-list-box {
    text-align: left;
  }
  .machine-name {
    font-size: 14px;
    margin-bottom: 10px;
  }
}
</style>
