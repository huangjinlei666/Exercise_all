<template>
  <div class="sensor-manage">
    <div class="sensor-container cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('sensor.sensorManage') }}</div>
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-360 vertical-middle"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchList('search')"
            @clear="fetchList('search')"
          >
            <el-select class="width-130" v-model="searchType" slot="prepend">
              <el-option v-for="t in searchTypes" :key="t.value" :label="$t(t.label)" :value="t.value"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="fetchList('search')"></el-button>
          </el-input>
        </div>
      </div>
      <div class="user-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('sensor.machineName')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.machineName" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.machineName }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sensor.deviceName')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.deviceName" placement="top" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceName || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sensor.deviceNo')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.deviceNo" placement="top" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceNo || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('sensor.type')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.typeText || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="370">
            <template slot-scope="scope">
              <a
                :class="scope.row.type ? 'cms-a-btn cms-delete-forbid' : 'cms-a-btn'"
                @click="handleAddType(scope.row)"
                >{{ $t('sensor.addType') }}</a
              >
              <a
                :class="!scope.row.type ? 'cms-a-btn cms-delete-forbid' : 'cms-a-btn'"
                @click="handleDeleteType(scope.row)"
                >{{ $t('sensor.deleteType') }}</a
              >
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
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { sensorTypes } from '@/util/selectTypes';
import TypeAddModal from './typeAddModal.vue';
import TypeDeleteModal from './typeDeleteModal.vue';

export default {
  name: 'sensorManage',
  data() {
    return {
      searchTypes: [{ label: 'sensor.machineName', value: 'machineNameLike' }],
      searchType: 'machineNameLike',
      searchValue: '',
      loading: false,
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    fetchList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        [this.searchType]: this.searchValue,
      };
      this.loading = true;
      this.$api.sensor
        .getSensorList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          if (res.pageIndex !== this.pageIndex) return;
          this.tableData = res.data.map((item) => {
            const t = sensorTypes.find((s) => s.value === item.type);
            item.typeText = t ? this.$t(t.label) : '--';
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
      this.fetchList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchList();
    },
    handleAddType: debounce(
      function addType(row) {
        if (row.type) return;
        const winData = {
          item: row,
        };
        this.$modal.show(this.$t('sensor.addType'), TypeAddModal, winData, '600px', this.fetchList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleDeleteType: debounce(
      function deleteType(row) {
        if (!row.type) return;
        const winData = {
          list: [cloneDeep(row)],
          text: {
            title: this.$t('sensor.deleteTypeTitle'),
            tip: this.$t('sensor.deleteTypeTip'),
          },
        };
        this.$modal.show(this.$t('sensor.deleteType'), TypeDeleteModal, winData, '550px', this.fetchList);
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
.sensor-manage {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  padding-bottom: 20px;
  .sensor-container {
    min-height: 697px;
  }
}
</style>
