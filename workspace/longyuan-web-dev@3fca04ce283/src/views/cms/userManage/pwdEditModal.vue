<template>
  <div id="user-add-modal">
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
        <el-form-item :label="$t('user.oldPwd')" prop="oldCredential">
          <el-input
            class="width-300"
            type="password"
            v-model="ruleForm.oldCredential"
            :placeholder="$t('user.placeholder.oldPwd')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.newPwd')" prop="newCredential">
          <el-input
            class="width-300"
            type="password"
            v-model="ruleForm.newCredential"
            :placeholder="$t('user.placeholder.newPwd')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.confirmPwd')" prop="confirmCredential">
          <el-input
            class="width-300"
            type="password"
            v-model="ruleForm.confirmCredential"
            :placeholder="$t('user.placeholder.confirmPwd')"
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
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { PASSWORD_REG } from '@/util/regExpService';
import { getSpecialLetterNum } from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'pwdEditModal',
  data() {
    const oldPwdValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
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
      if (value === this.ruleForm.oldCredential) {
        return callback(new Error(this.$t('user.invalid.newPwdValid')));
      }
      callback();
    };
    const confirmValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
      }
      if (value !== this.ruleForm.newCredential) {
        return callback(new Error(this.$t('user.invalid.confirmPwdValid')));
      }
      callback();
    };
    return {
      loading: false,
      ruleForm: {
        oldCredential: '',
        newCredential: '',
        confirmCredential: '',
      },
      rules: {
        oldCredential: [{ required: true, validator: oldPwdValidator, trigger: 'change' }],
        newCredential: [{ required: true, validator: pwdValidator, trigger: 'change' }],
        confirmCredential: [{ required: true, validator: confirmValidator, trigger: 'change' }],
      },
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  methods: {
    ...mapMutations('system/account', ['logout']),
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.changePwd(this.ruleForm);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    changePwd(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.user
        .changeUserPwd(formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('user.failure.changePwd', { 0: this.info.name }));
            return;
          }
          this.$msg.success(this.$t('user.success.changePwd', { 0: this.info.name }));
          this.handleConfirm();
          // 修改密码后，则登出
          this.logout();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
#user-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .permission-box {
    width: 300px;
    height: 80px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
