<template>
  <div id="principalAxis">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('principalAxis.principalAxisDB') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-230"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchPrincipalList('search')"
            @clear="fetchPrincipalList"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchPrincipalList('search')"></el-button>
          </el-input>
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
          >

          <el-table-column :label="$t('principalAxis.manufactor')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.manufacture }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('principalAxis.model')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.model }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('principalAxis.traditionalLayout')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.transmissionChainLayout }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('principalAxis.bearingConfig')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.mainBearingConfig }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="$t('principalAxis.remarks')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.remark }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('principalAxis.source')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.source }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standingBook.creationTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.createdAt }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.status')">
            <template slot-scope="scope">
              <div class="statusBox">
                <div
                  :class="
                    scope.row.statusText == '通过'
                      ? 'blueStatus'
                      : scope.row.statusText == '待审批'
                      ? 'grayStatus'
                      : 'redStatus'
                  "
                ></div>
                <span class="vertical-bottom">{{ scope.row.statusText }}</span>
              </div>
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
import { bearingStatuses } from '@/util/selectTypes';
import XLSX from 'xlsx';

export default {
  name: 'principalAxis',
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      multipleSelection: [],
      status: 'PASSED',
      isApproval: false,
      approvalFlag: true,
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },

  mounted() {
    // 获取列表数据
    this.searchValue = this.$route.query.search;
    this.fetchPrincipalList();
  },
  methods: {
    // 列表查询接口
    fetchPrincipalList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchValue,
        status: this.status,
      };
      this.loading = true;
      this.$api.principalAxis
        .getPrincipalList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const sta = bearingStatuses.find((i) => i.value === item.approvalStatus);
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
      this.fetchPrincipalList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchPrincipalList();
    },
  },
};
</script>
<style lang="less" scoped>
#principalAxis {
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
  .statusBox {
    display: flex;
    align-items: center;
  }
  .grayStatus {
    background: #d8d8d8;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .blueStatus {
    background: #1890ff;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .redStatus {
    background: #df3317;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
}
</style>
