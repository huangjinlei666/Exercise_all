<template>
  <div id="reason-add-modal">
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
        <el-form-item :label="$t('faultReasonList.faultCauseName')" prop="faultCauseName">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.faultCauseName"
            :placeholder="$t('faultReasonList.faultCauseName')"
          />
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
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { NAME_32_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'ReasonAddModal',
  data() {
    const nameValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('faultReasonList.faultCauseName')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      ruleForm: {
        faultCauseName: '',
      },
      rules: {
        faultCauseName: [{ required: true, validator: nameValidator, trigger: 'change' }],
      },
    };
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          // if (this.options.winData.oper === 'create') {
          this.create(this.ruleForm);
          // } else if (this.options.winData.oper === 'edit') {
          //   const ruleForm = { ...this.ruleForm, id: this.id };
          //   this.update(this.id, ruleForm);
          // }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    create(data) {
      if (!data) {
        return;
      }
      const formData = new FormData();
      formData.append('faultCauseName', data.faultCauseName);
      this.loading = true;
      this.$api.faultReasonList
        .addReason(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('faultReasonList.failure.addReason'));
            return;
          }
          this.$msg.success(this.$t('faultReasonList.success.addReason'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // update(id, formData) {
    //   if (!id || !formData) {
    //     return;
    //   }
    //   this.loading = true;
    //   this.$api.database
    //     .updateCategories(id, formData)
    //     .then((res) => {
    //       if (!res || !res.id) {
    //         this.$msg.error(this.$t('categoryMng.updateCategoryFail'));
    //         return;
    //       }
    //       this.$msg.success(this.$t('categoryMng.updateCategorySuccess'));
    //       this.handleConfirm();
    //     })
    //     .catch((err) => {
    //       this.$msg.error(err);
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
  },
};
</script>
<style lang="less">
#reason-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
