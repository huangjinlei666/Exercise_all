<template>
  <div id="user-manage">
    <div class="user-container cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('user.userManage') }}</div>
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <el-select
            class="width-163 d2-mr-10 vertical-middle"
            v-model="searchRoleId"
            :placeholder="$t('user.placeholder.roleId')"
            size="medium"
            clearable
            @change="fetchUserList('search')"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="$t('user.' + item.name)"
              :value="item.id"
            ></el-option>
          </el-select>
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-360 vertical-middle"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchUserList('search')"
            @clear="fetchUserList('search')"
          >
            <el-select class="width-130" v-model="searchType" slot="prepend">
              <el-option v-for="t in userSearchTypes" :key="t.value" :label="$t(t.label)" :value="t.value"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="fetchUserList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" @click="addUser">{{ $t('user.addUser') }}</el-button>
          <el-button size="medium" @click="roleSet">{{ $t('user.roleSet') }}</el-button>
        </div>
      </div>
      <div class="user-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column prop="name" :label="$t('user.username')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.name" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('user.email')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.email" placement="top" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.email || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('user.phoneNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.phoneNumber || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('user.affiliated')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ $t('user.' + scope.row.roleName) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.enable')" width="120">
            <template slot-scope="scope">
              <el-switch
                :value="scope.row.enable"
                @change="(checked) => handleEnable(checked, scope.row)"
                :disabled="info.id === scope.row.id"
              ></el-switch>
              <span class="d2-ml-5">{{ scope.row.enable ? $t('common.enable') : $t('common.disable') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.description')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.description" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.description || '--' }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="370">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleReset(scope.row.id)">{{ $t('common.resetPwd') }}</a>
              <a
                :class="info.id === scope.row.id ? 'cms-a-btn cms-delete-forbid' : 'cms-a-btn'"
                @click="changeDataPermission(scope.row.id)"
                >{{ $t('user.changeDataPermission') }}</a
              >
              <a class="cms-a-btn" @click="handleView(scope.row.id)">{{ $t('common.view') }}</a>
              <a class="cms-a-btn" @click="handleEdit(scope.row.id)">{{ $t('common.edit') }}</a>
              <a
                :class="info.id === scope.row.id ? 'cms-a-btn cms-delete-forbid' : 'cms-a-btn'"
                @click="handleDelete(scope.row)"
                >{{ $t('common.delete') }}</a
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
import { userSearchTypes } from '@/util/selectTypes';
import UserAddModal from './userAddModal.vue';
import UserDeleteModal from './userDeleteModal.vue';
import RoleSetModal from './roleSetModal.vue';
import pwdResetModal from './pwdResetModal.vue';
import changePermission from './changePermission.vue';

export default {
  name: 'userManage',
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
      userSearchTypes: [],
      loading: false,
      tableData: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    this.userSearchTypes = userSearchTypes;
    this.fetchUserList();
    this.fetchRoleList();
  },
  methods: {
    fetchUserList(way) {
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
      this.$api.user
        .getUserList(params)
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
    fetchRoleList() {
      const params = {
        pageIndex: this.rolePageIndex,
        pageSize: this.rolePageSize,
      };
      this.roleLoading = true;
      this.$api.user
        .getRoleList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            return;
          }
          this.roleList = res.data;
          this.roleTotal = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.roleLoading = false;
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchUserList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchUserList();
    },
    addUser: debounce(
      function addUser() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(this.$t('user.addUser'), UserAddModal, winData, '600px', this.fetchUserList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    roleSet() {
      const winData = {};
      this.$modal.show(this.$t('user.roleSet'), RoleSetModal, winData, '700px');
    },
    handleEnable: debounce(
      function handleEnable(checked, user) {
        const param = {
          enable: checked,
        };
        this.$api.user
          .enableUser(user.id, param)
          .then((res) => {
            if (!res || !res.success) {
              checked
                ? this.$msg.error(this.$t('user.failure.enableUser', { 0: user.name }))
                : this.$msg.error(this.$t('user.failure.disableUser', { 0: user.name }));
              return;
            }
            checked
              ? this.$msg.success(this.$t('user.success.enableUser', { 0: user.name }))
              : this.$msg.success(this.$t('user.success.disableUser', { 0: user.name }));
            this.fetchUserList();
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      300,
      { leading: true, trailing: false }
    ),
    changeDataPermission: debounce(
      function changeDataPermission(id) {
        if (id === this.info.id) {
          return;
        }
        this.$api.user.getUser(id).then((res) => {
          if (!res || !res.id) {
            return;
          }
          const winData = {
            item: res,
          };
          this.$modal.show(
            this.$t('user.changeDataPermission'),
            changePermission,
            winData,
            '600px',
            this.fetchUserList
          );
        });
      },
      300,
      { leading: true, trailing: false }
    ),
    handleReset: debounce(
      function handleReset(id) {
        this.$api.user.getUser(id).then((res) => {
          if (!res || !res.id) {
            return;
          }
          const winData = {
            item: res,
          };
          this.$modal.show(this.$t('common.resetPwd'), pwdResetModal, winData, '500px');
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleView: debounce(
      function handleView(id) {
        this.$api.user.getUser(id).then((res) => {
          if (!res || !res.id) {
            return;
          }
          const winData = {
            oper: 'view',
            item: res,
          };
          this.$modal.show(this.$t('user.viewUser'), UserAddModal, winData, '600px', this.fetchUserList);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleEdit: debounce(
      function handleEdit(id) {
        this.$api.user.getUser(id).then((res) => {
          if (!res || !res.id) {
            return;
          }
          const winData = {
            oper: 'edit',
            item: res,
          };
          this.$modal.show(this.$t('user.editUser'), UserAddModal, winData, '600px', this.onUserEditOk);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    onUserEditOk(res) {
      if (res && res.id === this.info.id) {
        this.$store.commit('system/account/saveInfo', { name: res.name, id: res.id });
      }
      this.fetchUserList();
    },
    handleDelete: debounce(
      function handleDelete(user) {
        if (user.id === this.info.id) {
          return;
        }
        const winData = {
          list: [cloneDeep(user)],
          text: {
            title: this.$t('user.deleteTitle'),
            tip: this.$t('user.deleteTip'),
          },
        };
        this.$modal.show(this.$t('user.deleteUser'), UserDeleteModal, winData, '550px', this.fetchUserList);
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#user-manage {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  padding-bottom: 20px;
  .user-container {
    min-height: 697px;
  }
}
</style>
