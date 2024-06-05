<template>
  <div id="role-add">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="loading"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <el-form-item :label="$t('role.roleName')" prop="name">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.name"
            :placeholder="$t('role.placeholder.roleName')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.description"
            :placeholder="$t('role.placeholder.description')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('role.permission')" prop="permission">
          <div class="permission-box">
            <el-tree
              ref="permissionTree"
              :data="menuTree"
              node-key="id"
              :show-checkbox="true"
              :props="defaultProps"
              :expand-on-click-node="false"
              :default-checked-keys="defaultCheckedKeys"
            >
              <span slot-scope="{ data }">
                {{ $t(`menu.${data.name}`) }}
              </span>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submit">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { USERNAME_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'roleAddModal',
  data() {
    const nameValidator = (rule, value, callback) => {
      if (!USERNAME_REG.test(value)) {
        return callback(new Error(this.$t('role.invalid.roleName')));
      }
      callback();
    };
    return {
      loading: false,
      roleLoading: false,
      menuTree: [],
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      roleList: [],
      defaultCheckedKeys: [],
      ruleForm: {
        name: '',
        description: '',
      },
      rules: {
        name: [{ required: true, validator: nameValidator, trigger: 'change' }],
      },
      defaultProps: {
        children: 'permissions',
        label: 'name',
      },
    };
  },
  mounted() {
    const { item } = this.options.winData;
    this.getPermissions();
    if (item?.id) {
      this.ruleForm = {
        name: item.name,
        description: item.description,
      };
      this.defaultCheckedKeys = item.permissionIds;
    }
  },
  methods: {
    getPermissions() {
      this.$api.role
        .getPermissions()
        .then((res) => {
          this.menuTree = res?.data || [];
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit: debounce(
      function submit() {
        this.$refs.ruleForm.validate((valid) => {
          if (!valid) {
            return;
          }
          this.options.winData.item ? this.updateRole() : this.createRole();
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    createRole() {
      const postData = this.ruleForm;
      this.loading = true;
      this.$api.role
        .createRole(postData)
        .then((res) => {
          if (!res?.data?.id) {
            this.$msg.error(this.$t('role.failure.createRole', { 0: postData.name }));
            return;
          }
          this.updatePermission(res.data.id)
            .then(() => {
              this.$msg.success(this.$t('role.success.createRole', { 0: postData.name }));
              this.handleConfirm();
            })
            .catch(() => {
              this.$msg.error(this.$t('role.failure.createRole', { 0: postData.name }));
            });
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateRole() {
      const postData = this.ruleForm;
      postData.id = this.options.winData.item.id;
      this.loading = true;
      this.$api.role
        .updateRole(postData)
        .then((res) => {
          if (!res?.data?.id) {
            this.$msg.error(this.$t('role.failure.updateRoler', { 0: postData.name }));
            return;
          }
          this.updatePermission(postData.id)
            .then(() => {
              this.$msg.success(this.$t('role.success.updateRoler', { 0: postData.name }));
              this.handleConfirm();
            })
            .catch(() => {
              this.$msg.error(this.$t('role.failure.updateRoler', { 0: postData.name }));
            });
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updatePermission(id) {
      return new Promise((resolve, reject) => {
        const postData = { id, permissionIds: this.$refs.permissionTree.getCheckedKeys() };
        this.$api.role
          .updatePermission(postData)
          .then((res) => {
            resolve();
          })
          .catch((err) => {
            reject();
          });
      });
    },
  },
};
</script>
<style lang="less">
#role-add {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .permission-box {
    width: 300px;
    height: 260px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
