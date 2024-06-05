<template>
  <div id="templateMng">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('templateMng.equipmentTemplate') }}</div>
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
          <el-button size="medium" type="primary" @click="sync">{{ $t('templateMng.sync') }}</el-button>
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('templateMng.newTemplate')
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
          <el-table-column :label="$t('templateMng.equipmentTemplateName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$t('templateMng.product')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.productName }}</span>
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('templateMng.remark')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.remark }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('standingBook.creationTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.createdAt }}</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <el-button class="cms-a-btn" @click="handleEdit(scope.row)" type="text"
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
import templateAddModal from './templateAddModal.vue';
import templateDeleteModal from './templateDeleteModal.vue';

export default {
  name: 'templateMng',
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
    // 页面加载获取列表数据
    this.fetchBearingList();
  },
  methods: {
    // 获取列表数据方法
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
      this.$api.templateMng
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
    // 同步操作
    sync() {
      this.$api.templateMng
        .sync()
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('templateMng.failure.sync'));
            return;
          }
          this.$msg.success(this.$t('templateMng.success.sync'));
          // console.log(res);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 新增操作
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(
          this.$t('templateMng.addTemplate'),
          templateAddModal,
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
    // 编辑操作
    handleEdit: debounce(
      function handleEdit(item) {
        const winData = {
          oper: 'edit',
          item,
        };
        this.$modal.show(
          this.$t('templateMng.editTemplate'),
          templateAddModal,
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
    // 详情操作
    handleDetail: debounce(
      function handleDetail(item) {
        const winData = {
          oper: 'detail',
          item,
        };
        this.$modal.show(
          this.$t('templateMng.detailTemplate'),
          templateAddModal,
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
    // 删除操作
    handleDelete: debounce(
      function handleDelete(bearing) {
        const winData = {
          list: [cloneDeep(bearing)],
          text: {
            title: this.$t('templateMng.deleteTitle'),
            tip: this.$t('templateMng.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('templateMng.deleteTemplate'),
          templateDeleteModal,
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
#templateMng {
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
