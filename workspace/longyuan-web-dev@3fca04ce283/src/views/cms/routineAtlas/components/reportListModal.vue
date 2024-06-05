<template>
  <div id="report-list-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :row-style="{ height: '48px' }"
        :cell-style="{ padding: '0px' }"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column prop="updatedAt" :label="$t('routineAtlas.downloadReport.update')" />
        <el-table-column prop="status" :label="$t('routineAtlas.downloadReport.exportStatus')" />
        <el-table-column :label="$t('common.operation')" width="120">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="medium"
              @click="startTaskClick(scope.row)"
              v-if="scope.row.exportStatus === 3"
              >{{ $t('routineAtlas.downloadReport.startTask') }}</el-button
            >
            <el-button
              type="text"
              size="medium"
              @click="downLoadReport(scope.row)"
              v-else
              :disabled="scope.row.exportStatus !== 2"
              >{{ $t('routineAtlas.downloadReport.download') }}</el-button
            >
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
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { exportStatus } from '@/util/selectTypes';
import * as FileSaver from 'file-saver';

export default {
  mixins: [modalMixin],
  name: 'reportListModal',
  data() {
    return {
      loading: false,
      id: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      exportStatus,
    };
  },
  mounted() {
    const { id } = this.options.winData;
    this.id = id;
    this.fetchList();
  },
  methods: {
    fetchList() {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      const param = {
        exportStatus: '',
      };
      this.$api.routineAtlas
        .getRecordList(params, param)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const staus = exportStatus.find((i) => i.value === item.exportStatus);
            item.status = staus ? this.$t(staus.label) : this.$t('common.ERROR');
            return item;
          });
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleSizeChange(pageSize) {
      this.pageIndex = 1;
      this.pageSize = pageSize;
      this.fetchList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchList();
    },
    downLoadReport(row) {
      this.$api.routineAtlas
        .downloadReport(row.id)
        .then((res) => {
          const name = res.headers['content-disposition'].split('filename=')[1];
          const filename = window.decodeURIComponent(name);
          const blob = new Blob([res.data], { type: res.data.type });
          FileSaver.saveAs(blob, filename);
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // 重启失败任务
    startTaskClick(row) {
      console.log(row);
      this.$api.routineAtlas
        .restartTask(row.id)
        .then((res) => {
          if (res) {
            this.fetchList();
            return this.$msg.success(this.$t('routineAtlas.downloadReport.startSuccess'));
          }
          this.$msg.error(this.$t('routineAtlas.downloadReport.startFailure'));
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
};
</script>
<style lang="less">
#report-list-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      min-height: 400px;
      max-height: 600px;
      overflow: auto;
    }
  }
}
</style>
