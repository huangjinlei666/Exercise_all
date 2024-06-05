<template>
  <div id="publicStrategy">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('publicStrategy.publicStrategyDB') }}</div>
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
        <!-- <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('common.add')
          }}</el-button>
        </div> -->
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('publicStrategy.policyName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom" :title="scope.row.name">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('publicStrategy.createdAt')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.createdAt }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('publicStrategy.updatedAt')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.updatedAt }}</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" :label="$t('common.operation')" width="350">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</a>
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
              <a class="cms-a-btn" @click="handleDetail(scope.row)">{{ $t('common.detail') }}</a>
              <a class="cms-a-btn" @click="handleSetup(scope.row)">{{ $t('publicStrategy.setUp') }}</a>
              <a class="cms-a-btn" @click="handleIssue(scope.row)">{{ $t('publicStrategy.issue') }}</a>
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
import strategyAddModal from './strategyAddModal.vue';
import strategyDeleteModal from './strategyDeleteModal.vue';
// import Detail from './detail.vue';

export default {
  name: 'publicStrategy',
  // components: { Detail },
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      publicDetail: true,
      detailId: {},
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    // 页面加载调列表查询接口
    this.fetchBearingList();
  },
  methods: {
    // 详情按钮获取点击参数列表id并跳转至详情页面
    handleDetail(row) {
      this.detailId.id = row.id;
      this.detailId.oper = 'detail';
      this.$router.push({ name: 'strategyDetail', query: this.detailId });
    },
    // 设置按钮获取点击参数列表id并跳转至设置页面
    handleSetup(row) {
      this.detailId.id = row.id;
      this.detailId.oper = 'setUp';
      this.$router.push({ name: 'strategyDetail', query: this.detailId });
    },
    // 下发按钮获取点击参数列表id并跳转至下发页面
    handleIssue(row) {
      this.detailId.id = row.id;
      this.detailId.oper = 'issue';
      this.$router.push({ name: 'strategyDetail', query: this.detailId });
    },
    // 列表查询接口
    fetchBearingList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        name: this.searchValue,
      };
      this.loading = true;
      this.$api.publicStrategy
        .getStrategyList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data;
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
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
    // 新增按钮 弹出新增页面
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(
          this.$t('publicStrategy.addPublicStrategy'),
          strategyAddModal,
          winData,
          '550px',
          this.fetchBearingList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 编辑按钮 弹出编辑页面
    handleEdit: debounce(
      function handleEdit(item) {
        const winData = {
          oper: 'edit',
          item,
        };
        this.$modal.show(
          this.$t('publicStrategy.editPublicStrategy'),
          strategyAddModal,
          winData,
          '550px',
          this.fetchBearingList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 删除按钮 弹出删除页面
    handleDelete: debounce(
      function handleDelete(bearing) {
        const winData = {
          list: [cloneDeep(bearing)],
          text: {
            title: this.$t('publicStrategy.deleteTitle'),
            tip: this.$t('publicStrategy.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('publicStrategy.deleteStrategy'),
          strategyDeleteModal,
          winData,
          '550px',
          this.fetchBearingList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#publicStrategy {
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
#strategy {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
}
</style>
