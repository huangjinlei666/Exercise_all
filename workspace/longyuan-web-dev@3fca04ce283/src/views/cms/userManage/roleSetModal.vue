<template>
  <div id="role-set-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="role-set-container" v-loading="loading">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="t in roleList" :key="t.id" :label="$t('user.' + t.name)" :name="t.id">
            <el-form label-width="150px" class="demo-ruleForm">
              <el-form-item :label="$t('user.featurePermission')" required>
                <el-tree ref="tree" node-key="id" :data="featureTypes" :props="defaultProps">
                  <span slot-scope="{ data }">
                    <span>{{ $t('user.' + data.name) }}</span>
                  </span>
                </el-tree>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="handleConfirm">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'roleSetModal',
  data() {
    return {
      activeName: '',
      roleLoading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      roleList: [],
      loading: false,
      featureTypes: [],
      defaultProps: {
        children: 'permissions',
        label: 'name',
      },
      permission: [],
    };
  },
  mounted() {
    this.fetchRoleList();
  },
  methods: {
    fetchRoleList(more) {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.roleLoading = true;
      this.$api.user
        .getRoleList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            return;
          }
          let list = [];
          if (more) {
            list = this.roleList.concat(res.data);
          } else {
            list = res.data;
          }
          this.roleList = list;
          this.activeName = list[0].id;
          this.pageIndex += 1;
          this.total = res.totalRecords;
          // 查询角色的权限
          this.fetchRole(list[0].id);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.roleLoading = false;
        });
    },
    loadMore() {
      const { roleLoading, pageIndex, pageSize, total } = this;
      if (roleLoading) {
        return;
      }
      if (total && (pageIndex - 1) * pageSize >= total) {
        return;
      }
      this.fetchRoleList(true);
    },
    fetchRole(id) {
      if (!id) return;
      this.loading = true;
      this.$api.user
        .getRole(id)
        .then((res) => {
          if (!res || !res.permission || !res.permission.permissions || res.permission.permissions.length === 0) {
            this.featureTypes = [];
            return;
          }
          this.featureTypes = res.permission.permissions;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleClick(tab, event) {
      if (!tab.name) return;
      this.fetchRole(tab.name);
    },
  },
};
</script>
<style lang="less" scoped>
#role-set-modal {
  .role-set-container {
    max-height: 400px;
    overflow: auto;
  }
}
</style>
