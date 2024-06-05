<template>
  <div id="sensor-add-modal">
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
        <el-form-item :label="$t('equipmentMng.snCode')" prop="snCode">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.snCode"
            :placeholder="$t('equipmentMng.placeholder.snCode')"
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
  name: 'sensorAddModal',
  data() {
    return {
      loading: false,
      id: '',
      ruleForm: {
        snCode: '',
      },
      rules: {
        snCode: [{ required: true, message: this.$t('equipmentMng.placeholder.snCode'), trigger: 'blur' }],
      },
    };
  },
  mounted() {
    const { oper, item, snCode } = this.options.winData;
    if (oper === 'edit') {
      console.log(item);
      this.id = item.id;
      if (snCode === '--') {
        this.ruleForm.snCode = '';
        return;
      }
      this.ruleForm.snCode = snCode;
      // this.ruleForm.snCode = item.metadata.snCode || '--';
    }
  },
  methods: {
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
    create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.database
        .createCategories(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('categoryMng.addCategoryFail'));
            return;
          }
          this.$msg.success(this.$t('categoryMng.addCategorySuccess'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    update(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      this.$api.projectSet
        .modifyMetadata(id, formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('projectSet.failure.updateSncodeFail'));
            return;
          }
          this.$msg.success(this.$t('projectSet.success.updateSncodeSuccess'));
          this.handleConfirm();
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
#sensor-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
