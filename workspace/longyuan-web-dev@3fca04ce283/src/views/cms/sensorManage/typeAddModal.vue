<template>
  <div id="sensor-type-add-modal">
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
        <el-form-item :label="$t('sensor.type')" prop="type">
          <el-select class="width-300" v-model.trim="ruleForm.type" :placeholder="$t('sensor.placeholder.type')">
            <el-option v-for="r in sensorTypes" :key="r.value" :label="$t(r.label)" :value="r.value"></el-option>
          </el-select>
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
import modalMixin from '@/plugins/modal/mixin';
import { sensorTypes } from '@/util/selectTypes';

export default {
  mixins: [modalMixin],
  name: 'SensorTypeAddModal',
  data() {
    return {
      sensorTypes,
      loading: false,
      ruleForm: {
        sensorId: '',
        type: '',
      },
      rules: {
        type: [{ required: true, message: this.$t('user.placeholder.choosePermission') }],
      },
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    const { item } = this.options.winData;
    this.ruleForm.sensorId = item.deviceId;
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.createUser(this.ruleForm);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    createUser(data) {
      if (!data) {
        return;
      }
      this.loading = true;
      this.$api.sensor
        .addSensor(data)
        .then((res) => {
          if (!res || !res.sensorId) {
            this.$msg.error(this.$t('sensor.failure.addType'));
            return;
          }
          this.$msg.success(this.$t('sensor.success.addType'));
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
#sensor-type-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
