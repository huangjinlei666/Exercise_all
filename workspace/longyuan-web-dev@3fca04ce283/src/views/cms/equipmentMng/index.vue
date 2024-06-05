<template>
  <div id="equipmentMng">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('equipmentMng.equipment') }}</div>
      <div class="search-box d2-mb-10 display_box">
        <div class="box-left">
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
        <div class="box-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('equipmentMng.newEquipment')
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
          <el-table-column :label="$t('equipmentMng.mainControlNo')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceNo }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('equipmentMng.mainControlName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('equipmentMng.product')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.productTemplateName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('equipmentMng.equipmentTemplateName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.deviceTemplateName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standingBook.creationTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.createdAt }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
              <a class="cms-a-btn" @click="handleDetail(scope.row)">{{ $t('common.detail') }}</a>
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
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import equipmentAddModal from './equipmentAddModal.vue';
import equipmentDeleteModal from './equipmentDeleteModal.vue';

export default {
  name: 'equipmentMng',
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
      this.$api.equipmentMng
        .getTemplatesList(params)
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
        this.$modal.show(
          this.$t('equipmentMng.newEquipment'),
          equipmentAddModal,
          winData,
          '1000px',
          this.fetchBearingList
        );
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
            title: this.$t('equipmentMng.deleteTitle'),
            tip: this.$t('equipmentMng.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('equipmentMng.deleteEquipment'),
          equipmentDeleteModal,
          winData,
          '550px',
          this.fetchBearingList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
    handleDetail(row) {
      this.$router.push({ name: 'equipmentDetail', query: { id: row.id } });
    },
  },
};
</script>
<style lang="less" scoped>
#equipmentMng {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .display_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
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
