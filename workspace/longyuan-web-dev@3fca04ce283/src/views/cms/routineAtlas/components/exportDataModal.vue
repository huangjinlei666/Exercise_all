<template>
  <div id="export-data-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="search-box d2-mb-10 clearfix" v-loading="loading">
        <div class="pull-left">
          <el-form :model="ruleForm" :rules="rules" size="medium" ref="ruleForm" :inline="true" :inline-message="true">
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
        <div class="pull-right">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-download"
            :disabled="exportDisabled"
            @click="handleCSVExport"
            >{{ $t('history.csvExport') }}</el-button
          >
          <el-button
            size="small"
            type="primary"
            icon="el-icon-download"
            :disabled="exportDisabled"
            @click="handleTXTExport"
            >{{ $t('history.txtExport') }}</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import modalMixin from '@/plugins/modal/mixin';
import { constants } from 'os';

export default {
  mixins: [modalMixin],
  name: 'exportDataModal',
  data() {
    return {
      exportDisabled: false,
      loading: false,
      requestTimes: 0,
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
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy']),
  },
  mounted() {},
  methods: {
    handleBlurDateRange(value) {
      this.min = '';
    },
    /**
     * 导出cvs
     */
    handleCSVExport() {
      this.$refs.ruleForm.validate((val) => {
        if (!val) {
          return false;
        }
        if (!this.options.winData.WORKSHOP) {
          this.$msg.error(this.$t('history.invalid.selectWindfarm'));
          return;
        }
        const param = this.creatParam('csv');
        this.handleExport(param, 'csv');
      });
    },
    /**
     * 导出txt
     */
    handleTXTExport() {
      this.$refs.ruleForm.validate((val) => {
        if (!val) {
          return false;
        }
        if (!this.options.winData.WORKSHOP) {
          this.$msg.error(this.$t('history.invalid.selectWindfarm'));
          return;
        }
        const param = this.creatParam('txt');
        this.handleExport(param, 'txt');
      });
    },
    /**
     * 请求导出数据
     */
    handleExport(param, fileType) {
      this.requestTimes = 0;
      this.loading = true;
      this.exportDisabled = true;
      this.$api.history
        .unifiedDownload(param)
        .then((res) => {
          if (!res || !res.id) {
            this.loading = false;
            this.exportDisabled = false;
            this.$msg.error(this.$t('history.exportFail'));
            return;
          }
          this.handlePreDownload(res.id, fileType);
        })
        .catch((err) => {
          this.loading = false;
          this.exportDisabled = false;
          this.$msg.error(err);
        });
    },
    /**
     * 判断文件是否生成成功
     */
    handlePreDownload(field, fileType) {
      this.requestTimes += 1;
      if (this.requestTimes > 5) {
        this.exportDisabled = false;
        this.loading = false;
        return this.$msg.error(this.$t('history.exportFail'));
      }
      this.$api.history
        .fetchExportStatus(field)
        .then((res) => {
          if (!res) {
            this.exportDisabled = false;
            this.loading = false;
            return;
          }
          if (!res.success && !res.data && !res.data.statusCode) {
            this.exportDisabled = false;
            this.loading = false;
            return this.$msg.error(this.$t('history.exportFail'));
          }
          if (res.data.statusCode === 'INIT') {
            return this.handlePreDownload(field, fileType);
          }
          if (res.data.statusCode === 'SUCCESS') {
            this.exportDisabled = false;
            this.loading = false;
            fileType === 'txt'
              ? this.$msg.success(this.$t('history.txtExportSuccess'))
              : this.$msg.success(this.$t('history.csvExportSuccess'));
            this.handleDownload(field);
          }
          if (res.data.statusCode === 'FAILED') {
            this.exportDisabled = false;
            this.loading = false;
            return this.$msg.error(this.$t('history.exportFail'));
          }
        })
        .catch((err) => {
          this.exportDisabled = false;
          this.loading = false;
          this.$msg.error(err);
        });
    },
    /**
     * 下载文件
     */
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
     * 组织参数
     */
    creatParam(fileType) {
      let sensorIdList = [];
      if (this.options.winData.SENSOR && this.options.winData.SENSOR.length > 0) {
        sensorIdList = this.options.winData.SENSOR.filter((val) => !isNaN(val));
      }
      const param = {
        workshopId: this.options.winData.WORKSHOP.id,
        workshopName: this.options.winData.WORKSHOP.name,
        machineList: [
          { machineId: this.options.winData.MACHINE.id, machineName: this.options.winData.MACHINE.name, sensorIdList },
        ],
        featureIdentifier: 'originalData', // 原始数据
        beginTime: this.ruleForm.timeRange[0].getTime(),
        endTime: this.ruleForm.timeRange[1].getTime(),
        fileType,
      };
      return param;
    },
  },
};
</script>
<style lang="less">
#wind-list-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      min-height: 400px;
      max-height: 600px;
      overflow: auto;
    }
  }
}
</style>
