<template>
  <div class="board-alarm-list">
    <div class="grident-bar">
      <img src="../../../assets/images/bg-head.png" alt="bg-head" />
    </div>
    <div class="item-title">{{ $t('board.alarmList') }}</div>
    <expert-analysis-header :item="listHeader"></expert-analysis-header>
    <template v-if="tableData.length > 0">
      <div class="expertTable">
        <better-scroll :data="tableData" ref="expertTable">
          <ul>
            <li v-for="(item, index) in tableData" :key="index">
              <expert-analysis-list :item="item"></expert-analysis-list>
            </li>
          </ul>
        </better-scroll>
      </div>
    </template>
    <div v-if="tableData.length === 0" class="nodata-box">{{ $t('common.nodata') }}</div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import StompService from '@/util/StompService';
import { alarmLevels, alarmVerifies } from '@/util/selectTypes';
import { getTotalList } from '@/util/commonService';
import betterScroll from '@/components/better-scroll/index.vue';
import expertAnalysisHeader from '@/components/cms-expert-analysis-table/header.vue';
import expertAnalysisList from '@/components/cms-expert-analysis-table/list.vue';

export default {
  name: 'boardAlarmList',
  components: {
    betterScroll,
    expertAnalysisHeader,
    expertAnalysisList,
  },
  data() {
    return {
      listHeader: {
        sensorName: this.$t('alarmLog.sensor'),
        featureName: this.$t('alarmLog.alarmParam'),
        alarmLevel: this.$t('alarmLog.alarmLevel'),
        occurTime: this.$t('alarmLog.alarmTime'),
      },
      tableData: [],
      timer: null,
    };
  },
  computed: {
    ...mapState('cms/board', ['machine']),
  },
  watch: {
    machine: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        if (!this) return;
        // http请求
        this.fetchAlarmData(value.id);
        // 定时器
        this.timer && clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.fetchAlarmData(value.id);
        }, 10000);
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    fetchAlarmData(machineId) {
      const params = {
        latest: true,
        hierarchyId: machineId,
      };
      getTotalList(this.$api.alarmLog.getAlarmList, 1, 50, params)
        .then((res) => {
          if (!res || res.length === 0) {
            this.tableData = [];
            return;
          }
          this.tableData = res.map((item, index) => {
            item.occurTime = this.$dateFormat.formatLocalDateTime(item.occurTime);
            const alarm = alarmLevels.find((i) => i.value === item.level);
            item.levelText = alarm ? this.$t(alarm.label) : this.$t('common.ERROR');
            item.verifyText = alarmVerifies.find((i) => i.value === item.verifyStatus).label;
            return item;
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};
</script>
<style lang="less" scoped>
.board-alarm-list {
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
  .expertTable {
    position: relative;
    height: calc(100% - 66px);
    ul {
      margin: 0;
      padding: 0;
      li {
        margin: 0;
        padding: 0;
        list-style: none;
      }
    }
  }
  .nodata-box {
    padding: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.35);
    text-align: center;
  }
}
</style>
