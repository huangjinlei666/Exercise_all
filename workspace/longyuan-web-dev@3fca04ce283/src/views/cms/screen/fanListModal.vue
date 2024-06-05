<template>
  <div id="fan-list-modal">
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
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff', padding: '10px 0' }"
        :cell-style="{ height: '35px', padding: '5px 0' }"
      >
        <el-table-column :label="$t('fan.factoryName')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.factoryName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('fan.workshopName')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.workShopName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('fan.machineName')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.machineName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('fan.uniqueNumber')" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.machineNo }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('fan.sensorName')" v-if="type !== 'machine'" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceName }}</span>
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
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" icon="el-icon-download" @click="handleExcelExport">
          {{ $t('common.export') }}
        </el-button>
        <el-button type="primary" size="medium" :disabled="loading" @click="handleCancel">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { startDownload } from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'fanListModal',
  data() {
    return {
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      type: '',
      hierarchyId: '',
    };
  },
  mounted() {
    const { type, hierarchyId } = this.options.winData;
    this.type = type;
    this.hierarchyId = hierarchyId;
    this.fetchList();
  },
  methods: {
    // 切换pageSize
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchList();
    },
    // 切换pageIndex
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchList();
    },
    // 获取风机列表
    fetchList() {
      let requestApi = '';
      const params = {
        hierarchyId: this.hierarchyId,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        status: 'OFFLINE',
      };
      if (this.type === 'machine') {
        requestApi = this.$api.screen.getMachineListByStatus(params);
      } else {
        params.sensorType = this.type;
        requestApi = this.$api.screen.getSensorListByStatus(params);
      }
      if (!requestApi) {
        return;
      }
      this.loading = true;
      requestApi
        .then((res) => {
          this.loading = false;
          if (!res || !res.data || !res.data.data) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.data;
          this.total = res.data.totalRecords;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    handleExcelExport() {
      const apiName = this.type === 'machine' ? 'exportOfflineFan' : 'exportOfflineSensor';
      const params = {
        hierarchyId: this.hierarchyId,
        status: 'OFFLINE',
        sensorType: this.type, // speed-转速传感器，vibration-振动传感器
      };
      this.$api.screen[apiName](params).then((res) => {
        if (!res?.success) {
          this.$msg.error(this.$t('fan.history.exportFail'));
          return;
        }
        startDownload(res?.data, this);
      });
    },
  },
};
</script>
<style lang="less" scoped>
#fan-list-modal {
  .role-set-container {
    max-height: 400px;
    overflow: auto;
  }
  .el-table__row td,
  .el-table__row th {
    padding: 5px 0;
  }
}
</style>
