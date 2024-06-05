<template>
  <div id="syncList">
    <div class="sync-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('syncList.syncTask') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
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
            size="medium"
            @change="fetchSyncList('search')"
            :editable="false"
            @blur="handleBlurDateRange"
          ></el-date-picker>
        </div>
      </div>
      <div class="sync-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :row-style="{ height: '48px' }"
          :cell-style="{ padding: '0px' }"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('syncList.syncType')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.syncType }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('syncList.syncTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.syncTime }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$t('syncList.syncStatus')">
            <template slot-scope="scope">
              <span v-if="scope.row.syncStatus === false" class="status-circle bg-color-error"></span>
              <span v-else class="status-circle bg-color-ok"></span>
              <span class="d2-ml-5">{{ scope.row.itemStatus }}</span>
            </template>
          </el-table-column> -->
          <el-table-column label="任务状态">
            <template slot-scope="scope">
              <span v-if="scope.row.taskStatus === 0" class="status-circle bg-color-init"></span>
              <span v-if="scope.row.taskStatus === 1" class="status-circle bg-color-padding"></span>
              <span v-if="scope.row.taskStatus === 2" class="status-circle bg-color-ok"></span>
              <span v-if="scope.row.taskStatus === 3" class="status-circle bg-color-error"></span>
              <span class="d2-ml-5">{{ status[scope.row.taskStatus] || '--' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="错误信息">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.errorMsg || '--'" placement="top" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.errorMsg || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="200">
            <template slot-scope="scope">
              <el-button type="text" :disabled="scope.row.syncStatus" @click="checkDetail(scope.row.id)">{{
                $t('syncList.check')
              }}</el-button>
              <el-button type="text" :disabled="scope.row.syncStatus" @click="submitTask(scope.row.id)">{{
                $t('syncList.sync')
              }}</el-button>
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
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { syncStatus, syncTypes } from '@/util/selectTypes';
import Detail from './detailModal.vue';

export default {
  name: 'publicStrategy',
  data() {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      timeRange: '',
      syncStatus,
      syncTypes,
      status: ['初始化', '正在运行', '已完成', '失败'],
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
      beginTime: '',
      endTime: '',
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    // 页面加载调列表查询接口
    this.fetchSyncList();
  },
  methods: {
    // 列表查询接口
    fetchSyncList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      if (this.timeRange && this.timeRange.length > 0) {
        this.beginTime = this.timeRange[0].getTime();
        this.endTime = this.timeRange[1].getTime();
      } else {
        this.beginTime = '';
        this.endTime = '';
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        startTime: this.beginTime,
        endTime: this.endTime,
      };
      this.loading = true;
      this.$api.syncList
        .getSyncData(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const time = new Date(item.syncTime);
            item.syncTime = this.$dateFormat.formatLocalDateTime(time.getTime());
            const status = syncStatus.find((i) => i.value === item.syncStatus);
            item.itemStatus = status ? this.$t(status.label) : this.$t('common.ERROR');
            const type = syncTypes.find((i) => i.value === item.dataSyncType);
            item.syncType = type ? this.$t(type.label) : this.$t('common.ERROR');
            return item;
          });
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchSyncList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchSyncList();
    },
    handleBlurDateRange(value) {
      this.min = '';
    },
    // 查看详情
    checkDetail(id) {
      const winData = {
        id,
      };
      this.$modal.show(this.$t('common.detail'), Detail, winData, '800px');
    },
    // 提交同步任务
    submitTask(id) {
      this.$api.syncList
        .submitSyncData(id)
        .then((res) => {
          if (!res) return false;
          this.$msg.success(this.$t('syncList.syncSuccess'));
          this.fetchSyncList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
};
</script>
<style lang="less" scoped>
#syncList {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .sync-table-box {
    width: 100%;
    // height: 100%;
    min-height: 697px;
    .upload-demo {
      display: inline-block;
    }
  }
}
#strategy {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
}
</style>
