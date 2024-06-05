<template>
  <div id="sync-list-modal">
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
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column prop="identifier" :label="$t('syncList.characteristicValue')" />
        <el-table-column prop="sensorName" :label="$t('syncList.sensorName')" />
        <el-table-column prop="createdAt" :label="$t('syncList.createdAt')" />
        <el-table-column :label="$t('syncList.syncStatus')">
          <template slot-scope="scope">
            <span v-if="scope.row.syncStatus === false" class="status-circle bg-color-error"></span>
            <span v-else class="status-circle bg-color-ok"></span>
            <span class="d2-ml-5">{{ scope.row.itemStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="错误信息">
          <template slot-scope="scope">
            <el-tooltip effect="dark" :content="scope.row.errorMsg || '--'" placement="top" :open-delay="500">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.errorMsg || '--' }}</span>
            </el-tooltip>
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
import { syncStatus } from '@/util/selectTypes';

export default {
  mixins: [modalMixin],
  name: 'MachineViewModal',
  data() {
    return {
      loading: false,
      id: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      syncStatus,
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
      this.$api.syncList
        .syncDetail(this.id, params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const time = new Date(item.syncTime);
            item.createdAt = this.$dateFormat.formatLocalDateTime(time.getTime());
            const status = syncStatus.find((i) => i.value === item.syncStatus);
            item.itemStatus = status ? this.$t(status.label) : this.$t('common.ERROR');
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
  },
};
</script>
<style lang="less">
#sync-list-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      min-height: 400px;
      max-height: 600px;
      overflow: auto;
    }
  }
}
</style>
