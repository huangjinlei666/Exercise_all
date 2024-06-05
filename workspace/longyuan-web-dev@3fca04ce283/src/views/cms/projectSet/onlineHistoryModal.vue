<template>
  <div id="online-history-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-col :span="24">
          <el-table
            :data="tableData"
            v-loading="loading"
            style="width: 100%"
            height="600"
            :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
          >
            <el-table-column :label="$t('projectSet.onlineTime')" prop="createdAt">
              <template slot-scope="scope">
                <span> {{ $dateFormat.formatLocalDateTime(scope.row.createdAt) }} </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('projectSet.onlineStatus')" prop="status">
              <template slot-scope="scope">
                <span :class="scope.row.status.toLowerCase()">
                  {{ $t(`screen.${scope.row.status.toLowerCase()}`) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import modalMixin from '@/plugins/modal/mixin';

export default {
  name: 'onlineHistoryModal',
  mixins: [modalMixin],
  data() {
    return {
      loading: false,
      tableData: [],
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    fetchList() {
      this.loading = true;
      const { hierarchy, workshopId, passSensor } = this.options.winData;
      const param = {
        workshopId,
        deviceId: passSensor.id || '',
        machineId: passSensor.id ? '' : hierarchy.id || '',
        pageOffset: '',
        pageSize: 50,
      };

      this.$api.projectSet
        .getOnlineHistory(param)
        .then((res) => {
          if (res?.data?.length) {
            this.tableData = res.data;
          }
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
#online-history-modal {
  .online {
    color: #64c42d;
  }
  .offline {
    color: #909399;
  }
}
</style>
