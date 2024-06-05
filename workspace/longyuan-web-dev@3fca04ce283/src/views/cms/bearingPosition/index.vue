<template>
  <div id="bearingPosition">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('bearingPosition.bearingDb') }}</div>
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
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          :span-method="objectSpanMethod"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('bearingPosition.dicType')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.dicTypeText }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearingPosition.itemKey')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.itemKey }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('bearingPosition.itemValue')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.itemValue }}</span>
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

export default {
  name: 'bearingPosition',
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      count: {},
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    this.fetchBearingList();
  },
  methods: {
    getSpanArr(data) {
      this.spanArr = [];
      for (let i = 0; i < data.length; i += 1) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0;
        } else if (i !== 0 && data[i].dicType === data[i - 1].dicType) {
          this.spanArr[this.pos] += 1;
          this.spanArr.push(0);
        } else {
          this.spanArr.push(1);
          this.pos = i;
        }
      }
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
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
      this.$api.bearingPosition
        .getBearingList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            if (item.dicType === 'mainaxis') {
              item.dicTypeText = '主轴';
            } else if (item.dicType === 'alternator') {
              item.dicTypeText = '发电机';
            } else {
              item.dicTypeText = '齿轮箱';
            }
            return item;
          });
          this.getSpanArr(this.tableData);
          this.total = res.totalRecords;
          this.count.mainaxisCount = res.mainaxisCount + 1;
          this.count.alternatorCount = res.alternatorCount + 1;
          this.count.gearboxfeatueCount = res.gearboxfeatueCount + 1;
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
  },
};
</script>
<style lang="less" scoped>
#bearingPosition {
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
