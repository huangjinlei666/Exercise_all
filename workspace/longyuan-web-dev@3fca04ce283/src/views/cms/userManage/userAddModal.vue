<template>
  <div id="change-permission-modal">
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
        :hide-required-asterisk="options.winData.oper === 'view'"
        :inline-message="true"
      >
        <el-form-item :label="$t('user.email')" prop="email">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.email"
            :placeholder="options.winData.oper !== 'create' ? '' : $t('user.placeholder.email')"
            :disabled="options.winData.oper !== 'create'"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.phoneNumber')" prop="phoneNumber">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.phoneNumber"
            :placeholder="options.winData.oper !== 'create' ? '' : $t('user.placeholder.telephone')"
            :disabled="options.winData.oper !== 'create'"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.username')" prop="name">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.name"
            :placeholder="$t('user.placeholder.username')"
            :disabled="options.winData.oper === 'view'"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.password')" prop="credential" v-if="options.winData.oper === 'create'">
          <el-input
            class="width-300"
            type="text"
            v-model.trim="ruleForm.credential"
            :placeholder="$t('user.placeholder.pwd')"
            @focus="handlePwdFocus"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.confirmPwd')" prop="confirmPwd" v-if="options.winData.oper === 'create'">
          <el-input
            class="width-300"
            type="text"
            v-model.trim="ruleForm.confirmPwd"
            :placeholder="$t('user.placeholder.pwd')"
            @focus="handlePwdFocus"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.affiliated')" prop="roleId">
          <el-select
            class="width-300"
            v-model.trim="ruleForm.roleId"
            :placeholder="$t('user.placeholder.roleId')"
            :disabled="
              options.winData.oper === 'view' ||
              (options.winData.oper === 'edit' && info.id === options.winData.item.id)
            "
          >
            <el-option v-for="r in roleList" :key="r.id" :label="$t('user.' + r.name)" :value="r.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('user.dataPermission')" prop="hierarchyId">
          <div class="permission-box">
            <el-tree
              ref="permissionTree"
              :data="copyPassList"
              node-key="id"
              :check-strictly="true"
              :show-checkbox="true"
              :props="defaultProps"
              @check="handleCheck"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :default-checked-keys="defaultCheckedKeys"
            ></el-tree>
          </div>
        </el-form-item>
        <el-form-item :label="$t('common.description')" prop="description">
          <el-input
            class="width-300 cms-textarea"
            type="textarea"
            :maxlength="512"
            v-model.trim="ruleForm.description"
            :placeholder="options.winData.oper === 'view' ? '' : $t('user.placeholder.description')"
            :disabled="options.winData.oper === 'view'"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import modalMixin from '@/plugins/modal/mixin';
import { USERNAME_REG, EMAIL_REG, TELEPHONE_REG, PASSWORD_REG, TRIM_512_REG } from '@/util/regExpService';
import {
  extractCheckedNode,
  operateTree,
  extractHierarchy,
  disableSonHierarchies,
  getSpecialLetterNum,
} from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'userAddModal',
  data() {
    const nameValidator = (rule, value, callback) => {
      if (!USERNAME_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.usernameValid')));
      }
      callback();
    };
    const emailValidator = (rule, value, callback) => {
      if (!value && !this.ruleForm.phoneNumber) {
        return callback(new Error(this.$t('user.invalid.emailPhoneValid')));
      }
      if (value && !EMAIL_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.emailValid')));
      }
      if (value && value.length > 64) {
        return callback(new Error(this.$t('user.invalid.emailValid')));
      }
      callback();
    };
    const phoneValidator = (rule, value, callback) => {
      if (!value && !this.ruleForm.email) {
        return callback(new Error(this.$t('user.invalid.emailPhoneValid')));
      }
      if (value && !TELEPHONE_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.phoneValid')));
      }
      callback();
    };
    const pwdValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
      }
      if (!PASSWORD_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (getSpecialLetterNum(value) < 3) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      callback();
    };
    const confirmPwdValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
      }
      if (!PASSWORD_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (getSpecialLetterNum(value) < 3) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (value !== this.ruleForm.credential) {
        return callback(new Error(this.$t('user.invalid.confirmPwdValid')));
      }
      callback();
    };
    const descriptionValidator = (rule, value, callback) => {
      if (value && !TRIM_512_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.descriptionValid')));
      }
      callback();
    };
    return {
      loading: false,
      roleLoading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      roleList: [],
      defaultCheckedKeys: [],
      copyPassList: [],
      ruleForm: {
        name: '',
        email: '',
        phoneNumber: '',
        credential: '',
        confirmPwd: '',
        roleId: '',
        hierarchyId: '',
        description: '',
      },
      rules: {
        name: [{ required: true, validator: nameValidator, trigger: 'change' }],
        email: [{ validator: emailValidator, trigger: ['change', 'blur'] }],
        phoneNumber: [{ validator: phoneValidator, trigger: ['change', 'blur'] }],
        credential: [{ required: true, validator: pwdValidator, trigger: 'change' }],
        confirmPwd: [{ required: true, validator: confirmPwdValidator, trigger: 'change' }],
        roleId: [{ required: true, message: this.$t('user.placeholder.roleId'), trigger: 'change' }],
        hierarchyId: [{ required: true, message: this.$t('user.placeholder.choosePermission') }],
        description: [{ validator: descriptionValidator, trigger: 'change' }],
      },
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
      },
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    this.copyPassList = cloneDeep(this.passList);
    const { oper, item } = this.options.winData;
    if (oper !== 'create') {
      this.ruleForm = {
        name: item.name,
        email: item.email,
        phoneNumber: item.phoneNumber,
        roleId: item.roleId,
        hierarchyId: item.hierarchyId || this.copyPassList[0].id,
        description: item.description,
      };
      const checkedNode = extractCheckedNode(this.copyPassList, item.hierarchyId || this.copyPassList[0].id);
      const checkedKeys = [];
      extractHierarchy([checkedNode], checkedKeys);
      this.defaultCheckedKeys = checkedKeys;
      operateTree(this.copyPassList, true);
    }
    if (oper === 'create') {
      operateTree(this.copyPassList, false);
    }
    this.fetchRoleList();
  },
  methods: {
    handleBlur() {
      this.$refs.ruleForm.validateField(['email', 'phoneNumber']);
    },
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
          this.pageIndex += 1;
          this.total = res.totalRecords;
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
    submitForm: debounce(
      function submitForm(formName) {
        if (this.options.winData.oper === 'view') {
          this.handleCancel();
          return;
        }
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.createUser(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            this.updateUser(this.options.winData.item.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    createUser(formData) {
      if (!formData) {
        return;
      }
      const newData = {
        ...formData,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
      };
      this.loading = true;
      this.$api.user
        .createUser(newData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('user.failure.createUser', { 0: formData.name }));
            return;
          }
          this.$msg.success(this.$t('user.success.createUser', { 0: formData.name }));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateUser(userId, formData) {
      if (!userId || !formData) {
        return;
      }
      const param = {
        name: formData.name,
        roleId: formData.roleId,
        description: formData.description,
      };
      this.loading = true;
      this.$api.user
        .updateUser(userId, param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('user.failure.updateUser', { 0: formData.name }));
            return;
          }
          this.$msg.success(this.$t('user.success.updateUser', { 0: formData.name }));
          this.handleConfirm({
            id: res.id,
            name: res.name,
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCheck(data, checkedData) {
      const checked = checkedData.checkedKeys.includes(data.id);
      if (!checked) {
        // 当前节点取消选中时，直接赋值表格数据和tree数据
        this.ruleForm.hierarchyId = '';
        this.$refs.permissionTree.setCheckedKeys([]);
        operateTree(this.copyPassList, false);
        // 执行手动校验
        this.$refs.ruleForm.validateField(['hierarchyId']);
        return;
      }
      if (this.ruleForm.hierarchyId && this.ruleForm.hierarchyId !== data.id) {
        // 当前选中的节点与现有选中节点不想同时，将tree的所有节点恢复为可选
        operateTree(this.copyPassList, false);
      }
      this.ruleForm.hierarchyId = data.id;
      const idArr = [];
      // 抽取出当前节点及其子节点的id，组成一个id数组，并将这些id对应的节点设置为选中状态
      extractHierarchy([data], idArr);
      this.$refs.permissionTree.setCheckedKeys(idArr);
      // 将当前节点的子节点设置为不可选状态
      this.findHierarchy(this.copyPassList, data.id);
      // 执行手动校验
      this.$refs.ruleForm.validateField(['hierarchyId']);
    },
    findHierarchy(array, tid) {
      let findFlag = false;
      array.every((a) => {
        if (a.id === tid) {
          findFlag = true;
          disableSonHierarchies(a);
          return false;
        }
        if (a.hierarchies && a.hierarchies.length > 0) {
          findFlag = this.findHierarchy(a.hierarchies, tid);
          if (findFlag) {
            return false;
          }
        }
        return true;
      });
    },
    handlePwdFocus(e) {
      const dom = e.target;
      dom.type = 'password';
    },
  },
};
</script>
<style lang="less">
#change-permission-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .permission-box {
    width: 300px;
    height: 200px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
