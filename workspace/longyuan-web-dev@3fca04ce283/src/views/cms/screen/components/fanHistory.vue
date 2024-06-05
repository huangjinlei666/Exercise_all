<template>
  <div class="fan-history">
    <div class="history-wrap" v-if="isShow">
      <div class="history-title">{{ $t('menu.deviceLifeCycle') }}</div>
      <ul class="history-legend">
        <li><i class="icon device_delivery" /><span>设备出厂</span></li>
        <li><i class="icon device_upgrade" /><span>设备升级</span></li>
        <li><i class="icon device_alarm" /><span>设备告警</span></li>
        <li><i class="icon device_replace" /><span>设备更换</span></li>
        <li><i class="icon device_maintain" /><span>设备维修</span></li>
        <li><i class="icon device_scrapping" /><span>设备报废</span></li>
      </ul>
      <div class="history-month">
        <div class="history-month-title">{{ currentYear }}/01 - {{ currentYear }}/12</div>
        <MonthProgress v-if="isLoaded" :data="firstHalf" />
        <MonthProgress v-if="isLoaded" :data="secondHalf" />
      </div>
      <div class="history-timeline">
        <div class="history-title">{{ $t('screen.deviceHistory') }}</div>
        <div class="history-year">{{ currentYear }}</div>
        <div class="history-list">
          <el-timeline class="timeline">
            <el-timeline-item v-for="(item, i) in hisData" :key="i" :timestamp="item.timestamp" placement="top">
              <el-card>
                <ul>
                  <li class="event-title">{{ item.sensorName }}</li>
                  <li>设备生命周期类型：{{ item.type }}</li>
                  <li>备注：{{ item.description }}</li>
                </ul>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
    <div class="arrow" @click="drawer">
      <i v-if="isShow" class="el-icon-d-arrow-right"></i>
      <i v-else class="el-icon-d-arrow-left"></i>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import { deiviceLifeCycleTypes } from '@/util/selectTypes';
import MonthProgress from './monthProgress.vue';

export default {
  name: 'fan-history',
  props: {
    hierarchyId: {
      type: String,
      default: '',
    },
  },
  components: {
    MonthProgress,
  },
  data() {
    return {
      isShow: false,
      isLoaded: false,
      currentYear: new Date().getFullYear(),
      firstHalf: [],
      secondHalf: [],
      hisData: [],
    };
  },
  created() {
    this.getDefaultMonth();
    this.getHistoryData();
  },
  methods: {
    drawer() {
      this.isShow = !this.isShow;
    },
    getHistoryData() {
      const params = {
        machineId: this.hierarchyId,
        pageIndex: 1,
        pageSize: 100,
        startTime: moment().startOf('year').valueOf(),
        endTime: moment().endOf('day').valueOf(),
      };
      this.$api.device
        .getDeviceLifeCycleList(params)
        .then((res) => {
          if (!res?.data?.length) {
            this.hisData = [];
            return;
          }
          this.hisData = res.data.map((d) => {
            const occurTime = new Date(d.occurTime);
            const occurMonth = occurTime.getMonth() + 1;
            const monthData = occurMonth < 6 ? this.firstHalf[occurMonth] : this.secondHalf[occurMonth - 6];
            const monthEvents = monthData.events;
            if (monthEvents.length < 3) {
              monthEvents.push({
                type: d.type,
              });
            }
            return {
              ...d,
              timestamp: this.$dateFormat.formatLocalDateTime(d.occurTime),
              type: this.$t(deiviceLifeCycleTypes.find((i) => i.value === d.type).label),
            };
          });
          this.isLoaded = true;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    getDefaultMonth() {
      this.firstHalf = [1, 2, 3, 4, 5, 6].map((m) => ({ month: m, events: [] }));
      this.secondHalf = [7, 8, 9, 10, 11, 12].map((m) => ({ month: m, events: [] }));
    },
  },
};
</script>
<style lang="less" scoped>
.fan-history {
  z-index: 999;
  position: absolute;
  top: 77px;
  right: 0;
  height: calc(100%-100px);
  border: 1px solid #0c6ead;
  font-size: 12px;
  line-height: 28px;
  color: #ddf9fa;
  .history-wrap {
    background-color: rgba(12, 110, 173, 0.9);
    width: 680px;
    height: calc(100% - 40px);
    padding: 20px 24px;
    .history-title {
      font-size: 18px;
      margin-bottom: 24px;
    }
    .history-legend {
      display: flex;
      font-size: 14px;
      li {
        display: flex;
        list-style: none;
        line-height: 20px;
        .icon {
          width: 20px;
          height: 20px;
          display: inline-block;
          background-size: cover;
        }
        span {
          margin: 0 30px 0 4px;
        }
      }
    }
    .history-month {
      .history-month-title {
        font-size: 16px;
        margin: 40px 0 12px 0;
      }
    }
    .history-timeline {
      height: calc(100% - 272px);
      .history-year {
        font-size: 16px;
      }
      .history-list {
        overflow: auto;
        height: calc(100% - 100px);
        .timeline {
          margin-left: 40px;
        }
      }
    }
  }
  .arrow {
    left: -24px;
    width: 22px;
    height: 60px;
    line-height: 60px;
    position: absolute;
    font-size: 16px;
    top: 120px;
    background-color: rgba(13, 51, 75, 0.6);
    border: 1px solid rgba(71, 218, 255, 0.1);
  }
  ::v-deep .el-timeline {
    .el-timeline-item__node {
      background-color: #1890ff;
    }
    .el-timeline-item__tail {
      border: 1px dashed #1890ff;
    }
    .el-timeline-item__timestamp {
      color: #fff;
    }
    .el-card {
      background-color: rgba(255, 255, 255, 0.1);
      border: none;
      box-shadow: none;
      color: #fff;
      li {
        list-style: none;
      }
      .event-title {
        color: #45e6f0;
        font-size: 16px;
      }
    }
  }
}
</style>
<style lang="less">
.fan-history {
  .device_delivery {
    background-image: url('/images/screen/icon_exfactory.png');
  }
  .device_upgrade {
    background-image: url('/images/screen/icon_upgrade.png');
  }
  .device_alarm {
    background-image: url('/images/screen/icon_alarm.png');
  }
  .device_replace {
    background-image: url('/images/screen/icon_replace.png');
  }
  .device_maintain {
    background-image: url('/images/screen/icon_repair.png');
  }
  .device_scrapping {
    background-image: url('/images/screen/icon_scrap.png');
  }
  // 'EXPERT_DIAGNOSIS': '',
  // 'LOG_REPORT': '',
  // 'DEVICE_SELF_CHECK': '',
}
</style>
