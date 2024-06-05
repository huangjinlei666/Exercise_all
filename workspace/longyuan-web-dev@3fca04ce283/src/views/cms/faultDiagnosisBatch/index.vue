<template>
  <div class="fault-diagnosis">
    <div class="diagnosis-table cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.faultDiagnosisBatch') }}</div>
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :row-style="{ height: '48px' }"
        :cell-style="{ padding: '0px' }"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column prop="name" :label="$t('faultDiagnosisBatch.name')" show-overflow-tooltip />
        <el-table-column prop="statusText" :label="$t('faultDiagnosisBatch.status')" />
        <el-table-column prop="beginDate" :label="$t('faultDiagnosisBatch.beginAt')" />
        <el-table-column prop="finishedAt" :label="$t('faultDiagnosisBatch.endAt')" />
        <el-table-column prop="remark" :label="$t('faultDiagnosisBatch.remark')" />
        <el-table-column fixed="right" :label="$t('common.operation')" width="100">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.status === 'FINISHED'" @click="handlePullById(scope.row.id)" type="text">{{
              $t('faultDiagnosisBatch.pull')
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
</template>

<script>
import { diagnosisStatus } from '@/util/selectTypes';

export default {
  name: 'FaultDiagnosis',
  data() {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      imageUrl: [],
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    fetchList() {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.$api.faultDiagnosis
        .getDiagnosisBatchList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const sta = diagnosisStatus.find((i) => i.value === item.status);
            item.statusText = sta ? this.$t(sta.label) : '--';
            item.beginDate = item.beginAt ? this.$dateFormat.formatLocalDateTime(item.beginAt) : '--';
            item.finishedAt = item.finishedAt ? this.$dateFormat.formatLocalDateTime(item.finishedAt) : '--';
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
      this.fetchList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchList();
    },
    // 拉取集团指定诊断批次至风场
    handlePullById(id) {
      if (!id) return;
      this.$api.faultDiagnosis
        .pullBatchFromGroupById(id)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('faultDiagnosisBatch.failure.pull'));
            return;
          }
          this.$msg.success(this.$t('faultDiagnosisBatch.success.pull'));
          this.fetchList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
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
}
</style>
