<template>
  <div id="role-manage">
    <div class="role-container cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.roleManage') }}</div>
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <el-input
            :placeholder="$t('role.placeholder.roleName')"
            class="width-360 vertical-middle"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchRoleList('search')"
            @clear="fetchRoleList('search')"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchRoleList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" @click="addRole">{{ $t('role.addRole') }}</el-button>
        </div>
      </div>
      <div class="role-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column prop="name" :label="$t('role.roleName')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.name" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('role.description')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.description" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.description || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="370">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleEdit(scope.row.id)">{{ $t('common.edit') }}</a>
              <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
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
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import roleAddModal from './roleAddModal.vue';
import roleDeleteModal from './roleDeleteModal.vue';

export default {
  name: 'role-manage',
  data() {
    return {
      roleLoading: false,
      rolePageIndex: 1,
      rolePageSize: 10,
      roleTotal: 0,
      roleList: [],
      searchRoleId: '',
      searchType: 'name',
      searchValue: '',
      loading: false,
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
    };
  },
  mounted() {
    this.fetchRoleList();
  },
  methods: {
    fetchRoleList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        [this.searchType]: this.searchValue,
        roleId: this.searchRoleId,
      };
      this.loading = true;
      this.$api.role
        .getRoleList(params)
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
      this.fetchRoleList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchRoleList();
    },
    addRole: debounce(
      function addRole() {
        this.$modal.show(this.$t('role.addRole'), roleAddModal, {}, '600px', this.fetchRoleList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleEdit: debounce(
      function handleEdit(id) {
        this.$api.role.getRole(id).then((res) => {
          if (res?.id) {
            this.$modal.show(this.$t('role.editRole'), roleAddModal, { item: res }, '600px', this.fetchRoleList);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleDelete: debounce(
      function handleDelete(role) {
        const winData = {
          list: [cloneDeep(role)],
          text: {
            title: this.$t('role.deleteTitle'),
            tip: this.$t('role.deleteTip'),
          },
        };
        this.$modal.show(this.$t('role.deleteRole'), roleDeleteModal, winData, '550px', this.fetchRoleList);
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#role-manage {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  padding-bottom: 20px;
  .role-container {
    min-height: 697px;
  }
}
</style>
