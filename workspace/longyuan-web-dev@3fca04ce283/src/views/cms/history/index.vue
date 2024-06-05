<template>
  <div id="history">
    <div class="history-container cms-card">
      <div class="d2-mb-20">
        <span class="cms-module-title">{{ $t('history.history') }}</span>
      </div>
      <div class="search-box d2-mb-10 clearfix">
        <div>
          <el-form :model="ruleForm" :rules="rules" size="medium" ref="ruleForm" :inline="true" :inline-message="true">
            <el-select
              class="width-200 d2-mr-10 vertical-middle"
              v-model="selectedTemplateId"
              :placeholder="$t('history.placeholder.selectTemplate')"
              size="medium"
              clearable
              @change="handleChangeTemplate"
            >
              <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-form-item prop="timeRange">
              <el-date-picker
                class="width-360 date-range-wrapper"
                popper-class="date-range-wrapper"
                v-model="ruleForm.timeRange"
                type="datetimerange"
                :picker-options="pickerOptions"
                :range-separator="$t('common.to')"
                :start-placeholder="$t('common.beginDate')"
                :end-placeholder="$t('common.endDate')"
                align="right"
                size="medium"
                :editable="false"
                @blur="handleBlurDateRange"
              ></el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <div class="button-bar">
          <el-button
            :disabled="exportDisabled"
            size="medium"
            type="primary"
            icon="el-icon-document-copy"
            @click="goDataTemplate"
          >
            {{ $t('history.templateManage') }}
          </el-button>
          <el-button
            :disabled="exportDisabled"
            size="medium"
            type="primary"
            icon="el-icon-download"
            @click="handleHistoryExport('csv')"
          >
            {{ $t('history.csvExport') }}
          </el-button>
          <el-button
            :disabled="exportDisabled"
            size="medium"
            type="primary"
            icon="el-icon-download"
            @click="handleHistoryExport('txt')"
          >
            {{ $t('history.txtExport') }}
          </el-button>
          <!-- 长波形历史数据导出 -->
          <el-button
            :disabled="exportDisabled"
            size="medium"
            type="primary"
            icon="el-icon-download"
            @click="handleHistoryExport('csv', 'longOriginalData')"
          >
            {{ $t('history.longCsvExport') }}
          </el-button>
          <el-button
            :disabled="exportDisabled"
            size="medium"
            type="primary"
            icon="el-icon-download"
            @click="handleHistoryExport('txt', 'longOriginalData')"
          >
            {{ $t('history.longTxtExport') }}
          </el-button>
        </div>
      </div>
      <div class="history-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column fixed :label="$t('history.fileName')" width="400px">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.filePath | fileName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('history.dataFormat')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.fileType }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('history.fileNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.fileNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('history.dataSize')">
            <template slot-scope="scope">
              <span v-if="scope.row.fileSize" class="text-ellipsis vertical-bottom">
                {{ scope.row.fileSize | prettySize }}
              </span>
              <span v-else class="text-ellipsis vertical-bottom">-</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createTime')">
            <template slot-scope="scope">
              <span v-if="scope.row.createdAt" class="text-ellipsis vertical-bottom">
                {{ scope.row.createdAt }}
              </span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.statusCode === 'SUCCESS'"
                type="text"
                :disabled="downLoading"
                @click="handleDownload(scope.row.id)"
              >
                <i v-show="downLoading" class="el-icon-loading" />
                {{ $t('common.download') }}
              </el-button>
              <el-button type="text" :disabled="downLoading" @click="handleDelete(scope.row.id)">
                {{ $t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          class="d2-mt-10"
          v-if="total > 10"
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
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'history',
  data() {
    return {
      loading: false,
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
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
          const three = 4 * 24 * 60 * 60 * 1000; // 设定3天日期  3天 * 24小时 * 60分钟 * 60秒 * 1000 = 3天的时间戳
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
          {
            text: this.$t('routineAtlas.selectTypes.fiveDays'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 5);
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
      ruleForm: {
        timeRange: '', // 选填选项：时间范围
      },
      rules: {
        timeRange: [
          {
            required: true,
            message: this.$t('routineAtlas.placeholder.timeRange'),
            trigger: 'change',
          },
        ],
      },
      downLoading: false,
      exportDisabled: false, // 正在导出的时候不允许切换其他的数据导出
      templateList: [], // 模板列表
      selectedTemplateId: '', // 选中的模板id
      timer: null, // 定时任务 定时刷新列表
    };
  },
  filters: {
    prettySize(size = 0, fixed = 2) {
      size *= 1;
      if (size > 1024 * 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(fixed)} TB`;
      }
      if (size > 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024 / 1024).toFixed(fixed)} GB`;
      }
      if (size > 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(fixed)} MB`;
      }
      if (size > 1024) {
        return `${(size / 1024).toFixed(fixed)} KB`;
      }
      return `${size.toString()} B`;
    },
    fileName(filePath) {
      if (!filePath) {
        return '';
      }
      const fileArr = filePath.split('/');
      return fileArr.pop();
    },
  },
  computed: {
    ...mapState('cms/pass', [
      'workshopHierarchy',
      'workshopSelectedList',
      'machineSelectedList',
      'sensorSelectedList',
      'selectedNodes',
    ]),
  },
  mounted() {
    if (this.$route.params && this.$route.params.origin === 'atlas' && this.$route.params.selected) {
      this.$nextTick(() => {
        this.saveSelectedNodes({ selectedNodes: JSON.parse(this.$route.params.selected) });
      });
    }
    this.getHistoryTemplate();
    this.fetchRecordList();
    // 三秒刷新一次列表
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.fetchRecordList();
      }, 3000);
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    ...mapMutations('cms/pass', ['saveTemplate', 'saveSelectedNodes']),
    handleBlurDateRange(value) {
      this.min = '';
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchRecordList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchRecordList();
    },
    prepareParam(fileType, featureIdentifier = 'originalData') {
      return {
        ...(this.workshopHierarchy[0] || {}),
        featureIdentifier, // 原始数据
        beginTime: this.ruleForm.timeRange[0].getTime(),
        endTime: this.ruleForm.timeRange[1].getTime(),
        fileType,
      };
    },
    handleHistoryExport(type, featureIdentifier) {
      this.$refs.ruleForm.validate((val) => {
        if (!val) {
          return false;
        }
        if (!this.workshopHierarchy?.length) {
          this.$msg.error(this.$t('history.invalid.selectSensor'));
          return;
        }
        const param = this.prepareParam(type, featureIdentifier);
        this.handleExport(param, type);
      });
    },
    handleExport(param, fileType) {
      this.loading = true;
      this.exportDisabled = true;
      this.$api.history
        .unifiedDownload(param)
        .then((res) => {
          this.exportDisabled = false;
          this.loading = false;
          if (!res?.id) {
            this.$msg.error(this.$t('history.exportFail'));
            return;
          }
          this.$msg.success(this.$t('history.exportDataSuccess'));
          // this.handlePreDownload(res.id, fileType);
        })
        .catch((err) => {
          this.exportDisabled = false;
          this.loading = false;
          this.$msg.error(err);
        });
    },
    handlePreDownload(field, fileType) {
      this.$api.history
        .downloadStatus(field)
        .then((res) => {
          if (!res) {
            return;
          }
          if (res.statusCode !== 0 && res.statusCode !== 200) {
            // this.tableData = [];
            this.exportDisabled = false;
            this.downLoading = false;
            // this.loading = false;
            return this.$msg.error(this.$t('history.exportFail'));
          }
          if (res.statusCode === 0) {
            this.exportDisabled = true;
            this.downLoading = true;
            // this.loading = true;
            return this.handlePreDownload(field, fileType);
          }
          if (res.statusCode === 200) {
            // this.tableData = [res];
            this.exportDisabled = false;
            this.downLoading = false;
            // this.loading = false;
            fileType === 'txt'
              ? this.$msg.success(this.$t('history.txtExportSuccess'))
              : this.$msg.success(this.$t('history.csvExportSuccess'));
          }
        })
        .catch((err) => {
          this.exportDisabled = false;
          this.downLoading = false;
          // this.loading = false;
          this.$msg.error(err);
        });
    },
    handleDownload(id) {
      if (!id) {
        return;
      }
      const aTag = document.createElement('a');
      aTag.href = this.$api.history.exprotDirectDownload(id);
      document.body.appendChild(aTag);
      aTag.click();
      aTag.remove();
    },
    /**
     * 跳转到模板页面
     */
    goDataTemplate() {
      this.$router.push({ name: 'dataTemplate' });
    },
    /**
     * 获取历史数据模板
     */
    getHistoryTemplate() {
      const params = {
        pageIndex: 1,
        pageSize: 200,
      };
      this.$api.history
        .getTemplateList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            return;
          }
          this.templateList = res.data.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * 选中模板后将数据匹配到左侧的通道列表
     */
    handleChangeTemplate(id) {
      const selectTemplate = this.templateList.filter((val) => val.id === id);
      this.saveTemplate({ template: selectTemplate });
    },
    /**
     * 删除导出记录
     */
    handleDelete(id) {
      if (!id) {
        return;
      }
      this.loading = true;
      this.$api.history
        .deleteExportRecord(id)
        .then((res) => {
          this.loading = false;
          if (!res || !res.success) {
            this.$msg.error(this.$t('history.failure.delete'));
            return;
          }
          this.$msg.success(this.$t('history.success.delete'));
          this.fetchRecordList();
        })
        .catch((err) => {
          this.loading = false;
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * 获取下载记录
     */
    fetchRecordList() {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.loading = true;
      this.$api.history
        .fetchExportRecord(params)
        .then((res) => {
          this.loading = false;
          if (!res || !res.data || !res.data.data || res.data.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.data;
          this.total = res.data.totalRecords;
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
<style lang="less" scoped>
#history {
  height: 100%;
  min-height: 697px;
  min-width: 1000px;
  padding-right: 20px;
  .history-container {
    .button-bar {
      margin-bottom: 20px;
    }
    .history-table {
      width: 100%;
      min-height: 636px;
    }
  }
}
</style>
