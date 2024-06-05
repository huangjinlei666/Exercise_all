<template>
  <div id="productTemplate">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('productTemplate.productTemplate') }}</div>
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
            $t('productTemplate.newProductTemplate')
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
          <el-table-column :label="$t('productTemplate.productTemplateName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standingBook.creationTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.createdAt }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <!-- <a class="cms-a-btn" @click="handleEdit(scope.row)">{{ $t('common.edit') }} </a>
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
              <a class="cms-a-btn" @click="handleDetail(scope.row)">{{ $t('common.detail') }}</a> -->
              <el-button
                :disabled="scope.row.relateDeviceStatus === 1"
                class="cms-a-btn"
                @click="handleEdit(scope.row)"
                type="text"
                >{{ $t('common.edit') }}
              </el-button>
              <el-button
                :disabled="scope.row.relateDeviceStatus === 1"
                class="cms-a-btn"
                @click="handleDelete(scope.row)"
                type="text"
                >{{ $t('common.delete') }}
              </el-button>
              <el-button class="cms-a-btn" @click="handleDetail(scope.row)" type="text"
                >{{ $t('common.detail') }}
              </el-button>
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
  name: 'productTemplate',
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
        name: this.searchValue,
      };
      this.loading = true;
      this.$api.productTemplate
        .getProductTemplatesList(params)
        .then((res) => {
          console.log(res);
          if (!res || !res.data || res.data.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
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
          this.$t('productTemplate.newProductTemplate'),
          equipmentAddModal,
          winData,
          '850px',
          this.fetchBearingList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleEdit: debounce(
      function handleAdd(item) {
        const winData = {
          oper: 'edit',
          item,
        };
        this.$modal.show(
          this.$t('productTemplate.editProductTemplate'),
          equipmentAddModal,
          winData,
          '850px',
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
            title: this.$t('productTemplate.deleteTitle'),
            tip: this.$t('productTemplate.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('productTemplate.deleteTemplate'),
          equipmentDeleteModal,
          winData,
          '550px',
          this.fetchBearingList
        );
      },
      300,
      { leading: true, trailing: false }
    ),

    handleDetail: debounce(
      function handleAdd(item) {
        const winData = {
          oper: 'detail',
          item,
        };
        this.$modal.show(
          this.$t('productTemplate.detailProductTemplate'),
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
  },
};
</script>
<style lang="less" scoped>
#productTemplate {
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
