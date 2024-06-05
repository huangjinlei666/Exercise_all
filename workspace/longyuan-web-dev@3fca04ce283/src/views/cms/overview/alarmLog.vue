<template>
  <div class="overview-log cms-card d2-mt-10">
    <el-table
      :data="tableData"
      v-loading="loading"
      style="width: 100%"
      :height="201"
      :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff', padding: '6px 0' }"
      :cell-style="{ padding: '6px 0' }"
    >
      <el-table-column prop="machineName" :label="$t('alarmLog.workGroup')"></el-table-column>
      <el-table-column :label="$t('alarmLog.sensor')">
        <template slot-scope="scope">
          <span>{{ scope.row.sensorName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('alarmLog.alarmParam')">
        <template slot-scope="scope">
          <span class="text-ellipsis vertical-bottom">{{ scope.row.featureName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('alarmLog.paramValue')" width="100">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.featureValue" placement="left" effect="dark" :open-delay="500">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.featureValue }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('alarmLog.threshold')" width="90">
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
      <el-table-column prop="verifyStatus" :label="$t('alarmLog.alarmStatus')" width="110">
        <template slot-scope="scope">
          <span
            v-if="scope.row.verifyStatus === 'VERIFIED'"
            class="el-icon-check"
            style="color: green; fontweight: bold"
          ></span>
          <span v-if="scope.row.verifyStatus === 'UNVERIFIED'" class="el-icon-close" style="color: red"></span>
          <span
            class="d2-ml-5"
            :style="scope.row.verifyStatus === 'VERIFIED' ? 'color:green;fontWeight:bold' : 'color:red'"
            >{{ $t(scope.row.verifyText) }}</span
          >
        </template>
      </el-table-column>
      <el-table-column prop="verifierName" :label="$t('alarmLog.verifier')">
        <template slot-scope="scope">
          <span>{{ scope.row.verifierName || '--' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      class="d2-mt-10"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageIndex"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { alarmLevels, alarmVerifies } from '@/util/selectTypes';

export default {
  name: 'overviewTable',
  props: {
    sensorId: {
      type: String,
      default: '',
    },
    featureIdentifier: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      loading: false,
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy', 'passList']),
    ...mapState('system/permission', ['permissionArr']),
  },
  mounted() {
    const _this = this;
    setTimeout(() => {
      if (!_this.hierarchy || !_this.hierarchy.id) {
        if (_this.passList && _this.passList.length > 0) {
          this.fetchAlarmData(_this.passList[0]);
        }
      }
    }, 1000);
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        if (value && oldValue && value.id === oldValue.id) {
          return;
        }
        this.fetchAlarmData(value);
      },
      immediate: true,
    },
  },
  methods: {
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchAlarmData(this.hierarchy);
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchAlarmData(this.hierarchy);
    },
    prepareParam(hierarchy) {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        latest: true,
        hierarchyId: hierarchy.id,
      };
      if (this.sensorId) {
        params.sensorId = this.sensorId;
        params.featureIdentifier = this.featureIdentifier;
      }
      return params;
    },
    fetchAlarmData(hierarchy) {
      const params = this.prepareParam(hierarchy);
      this.loading = true;
      this.$api.alarmLog
        .getAlarmList(params)
        .then((res) => {
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
  },
};
</script>
