<template>
  <div id="strategy-add-modal">
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
        <el-form-item :label="$t('publicStrategy.policyName')" prop="name">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.name"
            :placeholder="$t('publicStrategy.placeholder.policyName')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('publicStrategy.remarke')" prop="remark">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.remark"
            :placeholder="$t('publicStrategy.placeholder.remarke')"
          >
          </el-input>
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
import { NAME_64_REG, IDENTIFIER_REG, POSITIVE_FLOAT_REG, POSITIVE_INT_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'strategyAddModal',
  data() {
    return {
      loading: false,
      id: '',
      ruleForm: {
        name: '',
        remark: '',
      },
      rules: {
        name: [
          { required: true, message: this.$t('publicStrategy.placeholder.policyName'), trigger: 'blur' },
          { min: 1, max: 200, message: this.$t('publicStrategy.characterLimit'), trigger: 'blur' },
        ],
        remark: [
          { required: false },
          { min: 0, max: 200, message: this.$t('publicStrategy.characterLimit'), trigger: 'blur' },
        ],
      },
    };
  },
  mounted() {
    // 新增按钮带过来的参数处理
    const { oper, item } = this.options.winData;
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm.name = item.name;
      this.ruleForm.remark = item.remark;
    }
  },
  methods: {
    // 新增弹框确认按钮之前的校验
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            this.update(this.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 新增接口
    create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.publicStrategy
        .addStrategy(formData)
        .then((res) => {
          this.$msg.success(this.$t('publicStrategy.success.createStrategy'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 修改接口
    update(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      this.$api.publicStrategy
        .updateStrategy(id, formData)
        .then((res) => {
          this.$msg.success(this.$t('publicStrategy.success.updateStrategy'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
#strategy-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
