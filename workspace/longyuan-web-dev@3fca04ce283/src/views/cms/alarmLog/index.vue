<template>
  <div id="alarm-log">
    <div class="cms-card d2-mb-10">
      <div class="d2-mb-20">
        <span class="cms-module-title">{{ $t('alarmLog.alertLog') }}</span>
        <span class="d2-ml-10">
          (
          <span v-if="hierarchy && hierarchy.id && hierarchy.type === 'MACHINE'" class="color-primary">{{
            $t('common.selectedMachine') + hierarchy.name
          }}</span>
          <span v-else class="color-error">{{ $t('common.noSelectedMachine') }}</span>
          )
        </span>
      </div>
      <div class="clearfix">
        <div class="pull-left" style="display: flex; align-items: center">
          <el-select
            class="width-163 d2-mr-10"
            v-model="sensorId"
            :placeholder="$t('alarmSet.placeholder.sensor')"
            size="medium"
            clearable
            @change="getFeatureIdentifierArr"
          >
            <el-option v-for="item in sensorList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-select
            class="width-163 d2-mr-10"
            v-model="featureIdentifier"
            :placeholder="$t('alarmSet.placeholder.variates')"
            size="medium"
            clearable
            @change="fetchAlarmData('search')"
          >
            <template v-for="item in featureIdentifierArr">
              <el-option :key="item.identifier" :label="item.name" :value="item.identifier"></el-option>
            </template>
          </el-select>
          <el-select
            class="width-163 d2-mr-10"
            v-model="level"
            :placeholder="$t('alarmLog.alarmLevel')"
            size="medium"
            clearable
            @change="fetchAlarmData('search')"
          >
            <el-option
              v-for="item in alarmLevels"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- <el-select
            class="width-163 d2-mr-10"
            v-model="verifyStatus"
            :placeholder="$t('alarmLog.alarmStatus')"
            size="medium"
            clearable
            @change="fetchAlarmData('search')"
          >
            <el-option
              v-for="item in alarmVerifies"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select> -->
          <span class="d2-ml-10 d2-mr-10">
            <span class="alarm-search-label">{{ $t('alarmLog.timeRange') }}:</span>
            <el-date-picker
              class="width-360 date-range-wrapper"
              popper-class="date-range-wrapper"
              v-model="timeRange"
              type="datetimerange"
              :picker-options="pickerOptions"
              :range-separator="$t('common.to')"
              :start-placeholder="$t('common.beginDate')"
              :end-placeholder="$t('common.endDate')"
              align="right"
              @change="fetchAlarmData('search')"
              :editable="false"
              @blur="handleBlurDateRange"
            ></el-date-picker>
          </span>
        </div>
      </div>
    </div>
    <div class="cms-card table-box">
      <div class="cms-module-title d2-mb-10">
        {{ $t('alarmLog.vibrationAlarmLog') }}
        (<span>{{ breadCrumb }}</span
        >)
      </div>
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column :label="$t('alarmLog.workGroup')">
          <template slot-scope="scope">
            <el-tooltip effect="dark" :content="scope.row.machineName" placement="top-start" :open-delay="500">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.machineName }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('alarmLog.sensor')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.sensorName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('alarmLog.alarmParam')">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.featureName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('alarmLog.paramValue')" width="120">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.featureValue" placement="left" effect="dark" :open-delay="500">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.featureValue }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('alarmLog.threshold')" width="100">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.threshold" placement="right" effect="dark" :open-delay="500">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.threshold }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('alarmLog.alarmLevel')" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.level === 'OK'" class="status-circle bg-color-ok"></span>
            <span v-if="scope.row.level === 'ATTENTION'" class="status-circle bg-color-attention"></span>
            <span v-if="scope.row.level === 'WARN'" class="status-circle bg-color-error"></span>
            <span v-if="scope.row.level === 'ERROR'" class="status-circle bg-color-error"></span>
            <span v-if="scope.row.level === 'EMERGENCY'" class="status-circle bg-color-error"></span>
            <span class="d2-ml-5">{{ scope.row.levelText }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="occurTime" :label="$t('alarmLog.alarmTime')" width="160"></el-table-column>
        <el-table-column :label="$t('common.operation')" width="220">
          <template slot-scope="scope">
            <a class="cms-a-btn" @click="handleToAltas(scope.row)">{{ $t('alarmLog.toAtlas') }}</a>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        v-if="total > 10"
        class="d2-mt-10"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageIndex"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { alarmLevels, alarmVerifies } from '@/util/selectTypes';
import { extractWorkshopId } from '@/util/commonService';

export default {
  name: 'alarmLog',
  data() {
    return {
      alarmLevels,
      alarmVerifies,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      min: '', // 选中时间段后，靠前的时间
      pickerOptions: {
        onPick: ({ maxDate, minDate }) => {
          if (!maxDate && minDate) {
            this.min = minDate && minDate.getTime();
          }
          if (maxDate && minDate) {
            this.min = '';
          }
        },
        disabledDate: (date) => {
          const three = 2 * 24 * 60 * 60 * 1000; // 设定3天日期  3天 * 24小时 * 60分钟 * 60秒 * 1000 = 3天的时间戳
          // 如果开始日期已选中，则返回需求中需要禁用的时间
          if (this.min !== '') {
            // 大于选中时间后三天 || 小于选中时间后三天 || 大于今天 的所有日期都禁用
            return (
              date.getTime() > this.min + three || date.getTime() < this.min - three || date.getTime() > Date.now()
            );
          }
          // 什么都没选，只禁用大于今天的所有日期
          return date.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: this.$t('routineAtlas.selectTypes.halfHour'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 0.5);
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: this.$t('routineAtlas.selectTypes.oneHour'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: this.$t('routineAtlas.selectTypes.oneDay'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: this.$t('routineAtlas.selectTypes.threeDays'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
      sensorId: '',
      sensorList: [],
      featureIdentifier: '',
      featureIdentifierArr: [],
      timeRange: '',
      level: '',
      verifyStatus: '',
    };
  },
  computed: {
    ...mapState('cms/pass', ['breadCrumb', 'hierarchy', 'passList']),
    ...mapState('system/permission', ['permissionArr']),
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        this.level = '';
        this.verifyStatus = '';
        this.timeRange = '';

        this.sensorList = [];
        this.sensorId = '';
        this.featureIdentifier = '';
        this.featureIdentifierArr = [];
        this.fetchAlarmData('search');
        if (value.type !== 'MACHINE') {
          return;
        }
        const workshopId = extractWorkshopId(this.passList, value.id);
        this.$api.projectSet
          .getSensorUnderHierarchy({ hierarchyId: value.id, workshopId })
          .then((res) => {
            if (!res) {
              this.sensorList = [];
              return;
            }
            this.sensorList = res;
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      immediate: true,
    },
  },
  methods: {
    handleBlurDateRange(value) {
      this.min = '';
    },
    getFeatureIdentifierArr(value) {
      // 传感器变化，请求列表
      if (!value || !this.hierarchy.id || this.sensorList.length === 0) {
        this.featureIdentifier = '';
        this.featureIdentifierArr = [];
        this.fetchAlarmData('search');
        return;
      }
      this.featureIdentifierArr = this.findFeatureIdentifier(this.sensorList, this.sensorId);
      if (this.featureIdentifierArr.length === 0) {
        this.featureIdentifier = '';
      }
      if (this.featureIdentifier) {
        const identifierArr = this.featureIdentifierArr.map((item) => item.identifier);
        if (!identifierArr.includes(this.featureIdentifier)) {
          this.featureIdentifier = '';
        }
      }
      this.fetchAlarmData('search');
    },
    findFeatureIdentifier(arr, tid) {
      let array = [];
      arr.every((ele) => {
        if (ele.id === tid) {
          array = ele.variates;
          return false;
        }
        return true;
      });
      return array;
    },
    prepareParam() {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        hierarchyId: this.hierarchy.id,
      };
      if (this.sensorId) {
        params.sensorId = this.sensorId;
        params.featureIdentifier = this.featureIdentifier;
      }
      if (this.timeRange && this.timeRange.length > 0) {
        params.beginTime = this.timeRange[0].getTime();
        params.endTime = this.timeRange[1].getTime();
      }
      if (this.level) {
        params.level = this.level;
      }
      if (this.verifyStatus) {
        params.verifyStatus = this.verifyStatus;
      }
      return params;
    },
    fetchAlarmData(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = this.prepareParam();
      this.loading = true;
      this.$api.alarmLog
        .getAlarmList(params)
        .then((res) => {
          if (res && res.pageIndex && this.pageIndex !== res.pageIndex) return;
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item, index) => {
            item.occurTime = this.$dateFormat.formatLocalDateTime(item.occurTime);
            const alarm = alarmLevels.find((i) => i.value === item.level);
            item.levelText = alarm ? this.$t(alarm.label) : this.$t('common.ERROR');
            item.verifyText = alarmVerifies.find((i) => i.value === item.verifyStatus).label;
            return item;
          });
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchAlarmData();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchAlarmData();
    },
    handleToAltas(row) {
      const id = row.machineId;

      this.$router.push({
        name: 'routineAtlas',
        params: {
          hierarchyId: id,
        },
      });
    },
  },
};
</script>
<style lang="less" scoped>
#alarm-log {
  position: relative;
  min-width: 967px;
  padding-right: 20px;
  .alarm-search-label {
    font-size: 14px;
    color: #606266;
    padding: 0 12px 0 0;
    box-sizing: border-box;
    vertical-align: middle;
    display: inline-block;
    line-height: 36px;
  }
  .table-box {
    // height: calc(100% - 131px);
    min-height: 642px;
  }
  .date-range-wrapper {
    height: 36px;
  }
}
</style>
