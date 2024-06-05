<template>
  <div id="bearing">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('bearing.bearingDb') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-230"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchBearingList('search')"
            @clear="fetchBearingList"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchBearingList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('common.add')
          }}</el-button>
          <el-upload
            class="upload-demo d2-ml-10"
            action
            :show-file-list="false"
            accept=".xls, .xlsx"
            :before-upload="beforeUpload"
          >
            <el-button size="medium" icon="el-icon-upload2">{{ $t('common.import') }}</el-button>
          </el-upload>
          <el-button class="cms-a-btn" style="margin: 0 10px" type="text" @click="downloadTemplate">
            {{ $t('bearing.downloadTemplate') }}
          </el-button>
        </div>
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :row-style="{ height: '48px' }"
          :cell-style="{ padding: '0px' }"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('bearing.bearingNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.bearingNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearing.rollNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.rollNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearing.cageFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.cageFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearing.rollFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.rollFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearing.outerFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.outerFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearing.innerFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.innerFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.status')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.statusText }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</a>
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
              <template v-if="info && info.roleName === 'Administrator'">
                <el-popconfirm
                  :confirm-button-text="$t('bearing.approveSuccess')"
                  :cancel-button-text="$t('bearing.approveFailed')"
                  icon="el-icon-info"
                  icon-color="red"
                  :title="$t('bearing.confirmApproveResult')"
                  @confirm="handleApprove(scope.row.id)"
                  @cancel="handleUnApprove(scope.row.id)"
                >
                  <el-button class="cms-a-btn" slot="reference" type="text" :disabled="scope.row.status !== 'PENDING'"
                    >{{ $t('bearing.approve') }}
                  </el-button>
                </el-popconfirm>
              </template>
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
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import XLSX from 'xlsx';
import { bearingStatuses } from '@/util/selectTypes';
import bearingAddModal from './bearingAddModal.vue';
import bearingDeleteModal from './bearingDeleteModal.vue';

export default {
  name: 'bearing',
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    this.fetchBearingList();
  },
  methods: {
    fetchBearingList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchValue,
      };
      this.loading = true;
      this.$api.bearing
        .getBearingList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const sta = bearingStatuses.find((i) => i.value === item.status);
            item.statusText = sta ? this.$t(sta.label) : '--';
            return item;
          });
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchBearingList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchBearingList();
    },
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(this.$t('bearing.addBearing'), bearingAddModal, winData, '550px', this.fetchBearingList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleEdit: debounce(
      function handleEdit(item) {
        const winData = {
          oper: 'edit',
          item,
        };
        this.$modal.show(this.$t('bearing.editBearing'), bearingAddModal, winData, '550px', this.fetchBearingList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleDelete: debounce(
      function handleDelete(bearing) {
        const winData = {
          list: [cloneDeep(bearing)],
          text: {
            title: this.$t('bearing.deleteTitle'),
            tip: this.$t('bearing.deleteTip'),
          },
        };
        this.$modal.show(this.$t('bearing.deleteBearing'), bearingDeleteModal, winData, '550px', this.fetchBearingList);
      },
      300,
      { leading: true, trailing: false }
    ),
    beforeUpload(file) {
      this.upload(file);
      return false;
    },
    upload(file) {
      const formData = new FormData();
      formData.append('file', file);
      this.$api.bearing
        .batchImportBearing(formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('bearing.failure.importBearing'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.importBearing'));
          this.fetchBearingList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleApprove(bearingId) {
      this.$api.bearing
        .approveBearing(bearingId, { status: 'PASSED' })
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('bearing.failure.approve'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.approve'));
          this.fetchBearingList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleUnApprove(bearingId) {
      this.$api.bearing
        .approveBearing(bearingId, { status: 'NOT_PASSED' })
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('bearing.failure.approve'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.approve'));
          this.fetchBearingList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    downloadTemplate: debounce(
      () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
          ['轴承ID', '轴承类型', '滚子数', '保持架', '滚子或滚柱', '外环', '内环'],
          ['8806', 'BANA3691C', 30, 0.459, 6.13, 13.78, 16.22],
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'ws_name');
        XLSX.writeFile(wb, '轴承导入模板.xlsx');
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#bearing {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .bearing-table-box {
    width: 100%;
    // height: 100%;
    min-height: 697px;
    .upload-demo {
      display: inline-block;
    }
  }
}
</style>
