<template>
  <div id="principalAxis">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('fan.fanDB') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-230"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchFanList('search')"
            @clear="fetchFanList"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchFanList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-refresh" @click="handleSync">{{
            $t('common.sync')
          }}</el-button>
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
          <el-table-column :label="$t('fan.factoryName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.factoryName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('fan.workshopName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.workshopName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('fan.machineName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.machineName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('fan.uniqueNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.uniqueNumber }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('fan.machineModel')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.machineModel || '--' }}</span>
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

export default {
  name: 'fan',
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
  mounted() {
    // 获取列表数据
    this.searchValue = this.$route.query.search;
    this.fetchFanList();
  },
  methods: {
    // 列表查询接口
    fetchFanList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        uniqueNumber: this.searchValue,
      };
      this.loading = true;
      this.$api.fan
        .getFanList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          console.log(res);
          this.tableData = res.data.data;
          this.total = res.data.totalRecords;
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
      this.fetchFanList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchFanList();
    },
    // 同步集团数据
    handleSync() {
      this.$api.fan
        .syncMachineData()
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('fan.failure.syncFail'));
            return;
          }
          this.$msg.success(this.$t('fan.success.syncSuccess'));
          this.fetchFanList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
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
