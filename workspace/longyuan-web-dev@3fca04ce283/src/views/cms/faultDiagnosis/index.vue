<template>
  <div class="fault-diagnosis">
    <div class="diagnosis-table cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.faultDiagnosis') }}</div>
      <div class="pull-left mb-10">
        <el-input
          :placeholder="$t('faultDiagnosis.diagnosisName')"
          class="width-230 vertical-middle mr-10"
          v-model="nameLike"
          size="medium"
          clearable
          @keyup.enter.native="searchResult('search')"
          @clear="searchResult('search')"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchResult('search')"></el-button>
        </el-input>

        <el-input
          :placeholder="$t('faultDiagnosis.batchName')"
          class="width-230 vertical-middle mr-10"
          v-model="batchNameLike"
          size="medium"
          clearable
          @keyup.enter.native="searchResult('search')"
          @clear="searchResult('search')"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchResult('search')"></el-button>
        </el-input>

        <el-select
          class="width-163 d2-mr-10"
          v-model="partName"
          :placeholder="$t('faultDiagnosis.part')"
          size="medium"
          clearable
          @change="searchResult('search')"
        >
          <el-option
            v-for="item in diagnosisParts"
            :key="item.value"
            :label="$t(item.label)"
            :value="item.value"
          ></el-option>
        </el-select>

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
          @change="searchResult('search')"
          :editable="false"
        ></el-date-picker>
      </div>
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :row-style="{ height: '48px' }"
        :cell-style="{ padding: '0px' }"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column prop="id" type="expand">
          <template slot-scope="scope">
            <div class="avatar-uploader-container" v-if="scope.row.imgUrl.length > 0">
              <div v-for="pic in scope.row.imgUrl" :key="pic" class="avatar">
                <img :src="pic" alt="picture" @click="onPreview(scope.row.imgUrl)" />
              </div>
            </div>
            <div v-else class="no-data">{{ $t('common.nodata') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('faultDiagnosis.name')" show-overflow-tooltip />
        <el-table-column prop="partText" :label="$t('faultDiagnosis.part')" />
        <el-table-column prop="faultCauseName" :label="$t('faultDiagnosis.faultCauseId')" />
        <el-table-column prop="levelText" :label="$t('faultDiagnosis.level')" />
        <el-table-column prop="batchName" :label="$t('faultDiagnosis.batchName')">
          <template slot-scope="scope">
            <span>{{ scope.row.batchName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="resolveText" :label="$t('faultDiagnosis.resolve')" />
        <el-table-column prop="pushText" :label="$t('faultDiagnosis.push')" />
        <el-table-column prop="diagnosticianName" :label="$t('faultDiagnosis.diagnosticianName')" />
        <el-table-column prop="diagnosisDate" :label="$t('faultDiagnosis.diagnosisAt')" width="220" />
        <el-table-column fixed="right" :label="$t('common.operation')" width="220">
          <template slot-scope="scope">
            <el-button @click="handleViewMahine(scope.row.id)" type="text" class="font-button">{{
              $t('common.detail')
            }}</el-button>
            <el-button :disabled="scope.row.pushed && scope.row.resolved" @click="handleEdit(scope.row)" type="text">{{
              $t('common.edit')
            }}</el-button>
            <el-button :disabled="scope.row.pushed" @click="pushClick(scope.row)" type="text" class="font-button">{{
              $t('common.push')
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
      <!-- 图片全屏查看器 -->
      <el-image-viewer style="z-index: 999999" v-if="showViewer" :on-close="closeViewer" :url-list="imageUrl" />
    </div>
  </div>
</template>

<script>
import { alarmLevels, diagnosisParts } from '@/util/selectTypes';
import { baseUrl } from '@/config/baseUrl';
import ElImageViewer from '@/components/el-image-viewer/index.vue';
import DiagnosisAddModal from '../alarmLog/diagnosisAddModal.vue';
import MachineModal from './machineModal.vue';
import moment from 'moment'

export default {
  name: 'FaultDiagnosis',
  components: { ElImageViewer },
  data() {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      showViewer: false,
      imageUrl: [],
      nameLike: '', // 风场名称
      batchNameLike: '', // 批次名称
      timeRange: '', // 时间范围
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
          const now = moment().subtract(0, 'days').startOf('day').valueOf() + (24 * 60 * 60 - 1) * 1000
          // 如果开始日期已选中，则返回需求中需要禁用的时间
          if (this.min !== '') {
            // 大于选中时间后三天 || 小于选中时间后三天 || 大于今天 的所有日期都禁用
            return (
              date.getTime() > this.min + three || date.getTime() < this.min - three || date.getTime() > now
            );
          }
          // 什么都没选，只禁用大于今天的所有日期
          return date.getTime() > now;
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
      partName: '', // 部件
      diagnosisParts,
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    fetchList(params = {}) {
      this.$api.faultDiagnosis
        .getDiagnosisList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const level = alarmLevels.find((i) => i.value === item.level);
            item.levelText = level ? this.$t(level.label) : this.$t('common.ERROR');
            const part = diagnosisParts.find((i) => i.value === item.part);
            item.partText = part ? this.$t(part.label) : '--';
            item.resolveText = item.resolved
              ? this.$t('faultDiagnosis.resolved')
              : this.$t('faultDiagnosis.unresolved');
            item.pushText = item.pushed ? this.$t('faultDiagnosis.pushed') : this.$t('faultDiagnosis.unpushed');
            item.diagnosisDate = item.diagnosisAt ? this.$dateFormat.formatLocalDateTime(item.diagnosisAt) : '--';
            item.imgUrl = item.fileIds
              ? item.fileIds
                  .split(',')
                  .map((fileId) => `${baseUrl}/api/v1/cms/files/${fileId}/show?type=JARVIS_ALARM&complete=1`)
              : [];
            item.hasChildren = true;
            return item;
          });
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.searchResult();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.searchResult();
    },
    onPreview(urlList) {
      if (!urlList || urlList.length === 0) return;
      this.showViewer = true;
      this.imageUrl = urlList;
    },
    closeViewer() {
      this.showViewer = false;
      this.imageUrl = [];
    },
    handleViewMahine(id) {
      if (!id) return;
      const winData = {
        id,
      };
      this.$modal.show(this.$t('faultDiagnosis.viewDetail'), MachineModal, winData, '600px');
    },
    // 处理故障
    handleClick(row) {
      if (!row || !row.id) return;
      this.$api.faultDiagnosis
        .handleDiagnosisById(row.id)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('faultDiagnosis.failure.handle'));
            return;
          }
          this.$msg.success(this.$t('faultDiagnosis.success.handle'));
          this.searchResult();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // 推送数据到集团
    pushClick(row) {
      if (!row || !row.id) return;
      this.$api.faultDiagnosis
        .pushDiagnosisById(row.id)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('faultDiagnosis.failure.push'));
            return;
          }
          this.$msg.success(this.$t('faultDiagnosis.success.push'));
          this.searchResult();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // edit
    handleEdit(row) {
      if (!row || !row.id) return;
      const winData = {
        oper: 'edit',
        faultDiagnosisId: row.id,
      };
      this.$modal.show(this.$t('faultDiagnosis.editDiagnosis'), DiagnosisAddModal, winData, '550px', this.searchResult);
    },
    // 搜索
    searchResult(key) {
      if (key) this.pageIndex = 1;
      const params = {
        nameLike: this.nameLike,
        batchNameLike: this.batchNameLike,
        beginTime: this.timeRange ? this.timeRange[0].getTime() : '',
        endTime: this.timeRange ? this.timeRange[1].getTime() : '',
        part: this.partName,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.fetchList(params);
    },
  },
};
</script>

<style lang="less" scoped>
.fault-diagnosis {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .diagnosis-table {
    width: 100%;
    min-height: 697px;
  }
  .avatar-uploader-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .avatar {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    margin: 2px;
    &:hover {
      border-color: #409eff;
      .cover {
        display: flex;
      }
    }
    img {
      width: auto;
      height: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      cursor: pointer;
    }
    .cover {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 6px;
      i {
        cursor: pointer;
      }
    }
  }
  .no-data {
    text-align: center;
    color: #909399;
  }
}
</style>
