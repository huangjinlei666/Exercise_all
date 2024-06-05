<template>
  <div id="lag-change-modal">
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
        <el-form-item label="开关阈值" prop="maxLag">
          <el-input-number
            v-model="ruleForm.maxLag"
            controls-position="right"
            class="width-300"
            :min="1"
            :max="10000000"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disables="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'lagChangeModal',
  data() {
    return {
      loading: false,
      ruleForm: {
        maxLag: 1,
      },
      rules: {
        maxLag: [{ required: true, message: '请输入开关阈值', trigger: 'change' }],
      },
    };
  },
  mounted() {
    const { maxLag } = this.options.winData;
    this.ruleForm.maxLag = maxLag;
  },
  methods: {
    changeLag(maxLag) {
      const param = { maxLag };
      this.loading = true;
      this.$api.monitor
        .setLag(param)
        .then((res) => {
          if (!res || !res.success) {
            return;
          }
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submitForm: debounce(
      function submitForm(formName) {
        if (this.oper === 'view') {
          this.handleCancel();
          return;
        }
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.changeLag(this.ruleForm.maxLag);
        });
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
<style lang="less">
#lag-change-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
