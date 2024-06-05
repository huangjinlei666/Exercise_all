<template>
  <div id="gearbox-add-modal">
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
        <el-form-item :label="$t('gearbox.factory')" prop="manufacturer">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.manufacturer"
            :placeholder="$t('gearbox.placeholder.factory')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('gearbox.gearType')" prop="gearType">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.gearType"
            :placeholder="$t('gearbox.placeholder.gearType')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('gearbox.gearModel')" prop="gearModel">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.gearModel"
            :placeholder="$t('gearbox.placeholder.gearModel')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('gearbox.ratio')" prop="gearRatio">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.gearRatio"
            :placeholder="$t('gearbox.placeholder.ratio')"
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
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { NAME_64_REG, NAME_32_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'gearboxAddModal',
  data() {
    const manufacturerValidator = (rule, value, callback) => {
      if (!NAME_64_REG.test(value)) {
        return callback(new Error(this.$t('gearbox.invalid.factory')));
      }
      callback();
    };
    const gearTypeValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('gearbox.invalid.gearType')));
      }
      callback();
    };
    const gearModelValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('gearbox.invalid.gearModel')));
      }
      callback();
    };
    const ratioValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('gearbox.invalid.ratio')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      ruleForm: {
        manufacturer: '',
        gearType: '',
        gearModel: '',
        gearRatio: '',
      },
      rules: {
        manufacturer: [{ required: true, validator: manufacturerValidator, trigger: 'change' }],
        gearType: [{ required: true, validator: gearTypeValidator, trigger: 'change' }],
        gearModel: [{ required: true, validator: gearModelValidator, trigger: 'change' }],
        gearRatio: [{ required: true, validator: ratioValidator, trigger: 'change' }],
      },
    };
  },
  mounted() {
    const { oper, item } = this.options.winData;
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm = {
        manufacturer: item.manufacturer,
        gearType: item.gearType,
        gearModel: item.gearModel,
        gearRatio: item.gearRatio,
      };
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
      this.$api.gearbox
        .addGearbox(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('gearbox.failure.create'));
            return;
          }
          this.$msg.success(this.$t('gearbox.success.create'));
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
      this.$api.gearbox
        .updateGearbox(id, formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('gearbox.failure.update'));
            return;
          }
          this.$msg.success(this.$t('gearbox.success.update'));
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
#gearbox-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
