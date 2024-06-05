<template>
  <div id="category-mng">
    <div class="category-mng-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.categoryMng') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('categoryMng.searchText')"
            class="width-230"
            v-model="categoryName"
            size="medium"
            clearable
            @keyup.enter.native="getCategoriesList('search')"
            @clear="getCategoriesList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getCategoriesList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('common.add')
          }}</el-button>
        </div>
      </div>
      <div class="database-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('categoryMng.categoryName')" prop="categoryName" show-overflow-tooltip />
          <el-table-column prop="createdAt" :label="$t('common.createTime')" />
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</a>
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
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
import categoryAddModal from './categoryAddModal.vue';
import categoryDeleteModal from './categoryDeleteModal.vue';

export default {
  name: 'categoryMng',
  data() {
    return {
      categoryName: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
    };
  },
  mounted() {
    this.getCategoriesList();
  },
  methods: {
    getCategoriesList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        categoryName: this.categoryName,
      };
      this.loading = true;
      this.$api.database
        .getCategoriesList(params)
        .then((res) => {
          if (!res) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((i) => {
            i.createdAt = this.$dateFormat.formatLocalDateTime(i.createdAt);
            return i;
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
      this.getCategoriesList('search');
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.getCategoriesList();
    },
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(
          this.$t('categoryMng.addCategory'),
          categoryAddModal,
          winData,
          '550px',
          this.getCategoriesList
        );
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
          item,
          oper: 'edit',
        };
        this.$modal.show(
          this.$t('categoryMng.updateCategory'),
          categoryAddModal,
          winData,
          '550px',
          this.getCategoriesList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleDelete: debounce(
      function handleDelete(data) {
        const winData = {
          list: [cloneDeep(data)],
          text: {
            title: this.$t('categoryMng.deleteCategoryTip'),
            tip: this.$t('gearbox.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('categoryMng.deleteCategory'),
          categoryDeleteModal,
          winData,
          '550px',
          this.getCategoriesList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#category-mng {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .category-mng-table-box {
    width: 100%;
    min-height: 697px;
  }
}
</style>
