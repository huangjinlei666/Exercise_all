<template>
  <div id="bind-data-acquisition-modal">
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
        <el-form-item :label="$t('projectSet.gatewayDeviceNumber')" prop="deviceNumber">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.deviceNumber"
            :placeholder="$t('projectSet.placeholder.gatewayDeviceNumber')"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button
          size="medium"
          :disabled="!!receivedDeviceNumber || loading"
          type="primary"
          @click="submitForm('ruleForm')"
          >{{ $t('common.confirm') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'bindDataAcquisitionModal',
  data() {
    return {
      loading: false,
      receivedDeviceNumber: '',
      ruleForm: {
        deviceNumber: '',
      },
      rules: {
        deviceNumber: [
          {
            required: true,
            message: this.$t('projectSet.invalid.gatewayDeviceNumber'),
            trigger: 'blur',
          },
        ],
      },
    };
  },
  mounted() {
    const { deviceNumber } = this.options.winData;
    if (deviceNumber) {
      this.receivedDeviceNumber = deviceNumber;
      this.ruleForm.deviceNumber = deviceNumber;
    }
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.bind(this.ruleForm);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    bind(formData) {
      if (!formData) {
        return;
      }
      const { machineId } = this.options.winData;
      this.loading = true;
      if (!machineId) {
        return;
      }
      this.$api.projectSet
        .bindGatewayToMachine(machineId, formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('projectSet.failure.bindDataAcquisition'));
            return;
          }
          this.$msg.success(this.$t('projectSet.success.bindDataAcquisition'));
          setTimeout(() => this.handleConfirm(), 1000);
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
#bind-data-acquisition-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
