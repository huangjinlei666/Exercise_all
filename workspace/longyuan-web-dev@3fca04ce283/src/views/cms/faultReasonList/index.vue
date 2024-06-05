<template>
  <div class="fault-reason-list">
    <div class="reason-table cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.faultReasonList') }}</div>
      <el-row :gutter="20">
        <el-col :span="10">
          <div class="search-box d2-mb-10 clearfix">
            <div class="pull-left cms-item-title">{{ $t('faultReasonList.farmTitle') }}</div>
            <div class="pull-right">
              <CmsRefreshBtn class="ml-10" @handleBtnClick="fetchList" />
            </div>
          </div>
          <el-table
            :data="tableData1"
            v-loading="loading1"
            style="width: 100%"
            height="730"
            :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
          >
            <el-table-column :label="$t('faultReasonList.name')" prop="name" show-overflow-tooltip />
            <el-table-column :label="$t('faultReasonList.createdAt')" prop="createdAt" show-overflow-tooltip />
          </el-table>
        </el-col>
        <el-col :span="4">
          <div style="text-align: center; padding-top: 50px">
            <el-button size="small" type="primary" icon="el-icon-back" @click="handleSync">{{
              this.$t('common.sync')
            }}</el-button>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="search-box d2-mb-10 clearfix">
            <div class="pull-left cms-item-title">{{ $t('faultReasonList.groupTitle') }}</div>
            <div class="pull-right">
              <CmsRefreshBtn class="ml-10" @handleBtnClick="fetchGroupList" />
            </div>
          </div>
          <el-table
            :data="tableData2"
            v-loading="loading2"
            style="width: 100%"
            height="730"
            :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
          >
            <el-table-column :label="$t('faultReasonList.name')" prop="name" show-overflow-tooltip />
            <el-table-column :label="$t('faultReasonList.createdAt')" prop="createdAt" show-overflow-tooltip />
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import CmsRefreshBtn from '@/components/cms-refresh-btn/index.vue';
import ReasonAddModal from './reasonAddModal.vue';

export default {
  name: 'FaultReasonList',
  components: { CmsRefreshBtn },
  data() {
    return {
      loading1: false,
      tableData1: [],
      loading2: false,
      tableData2: [],
    };
  },
  mounted() {
    this.fetchList();
    this.fetchGroupList();
  },
  methods: {
    fetchList() {
      this.loading1 = true;
      this.$api.faultReasonList
        .getReasonList()
        .then((res) => {
          if (res && res.length) {
            this.tableData1 = res.slice();
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading1 = false;
        });
    },
    fetchGroupList() {
      this.loading2 = true;
      this.$api.faultReasonList
        .getDiagnosisListFromGroup()
        .then((res) => {
          if (res && res.length) {
            this.tableData2 = res.slice();
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading2 = false;
        });
    },
    handleSync: debounce(
      function handleSync() {
        this.$api.faultReasonList
          .fetchDiagnosisFromGroup()
          .then((res) => {
            this.fetchList();
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
  },
};
</script>

<style lang="less" scoped>
.fault-reason-list {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .reason-table {
    width: 100%;
    min-height: 697px;
  }
}
</style>
