<template>
  <div id="fault-detail-modal">
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
        <el-form-item :label="$t('faultReasonList.fanName')" prop="machineName">
          <el-input
            class="width-300"
            :value="ruleForm.machineName"
            :placeholder="$t('faultReasonList.fanName')"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('faultReasonList.sensorName')" prop="sensorName">
          <el-input
            class="width-300"
            :value="ruleForm.sensorName"
            :placeholder="$t('faultReasonList.sensorName')"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('faultReasonList.featureName')" prop="featureName">
          <el-input
            class="width-300"
            :value="ruleForm.featureName"
            :placeholder="$t('faultReasonList.featureName')"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('faultReasonList.featureValue')" prop="featureValue">
          <el-input
            class="width-300"
            :value="ruleForm.featureValue"
            :placeholder="$t('faultReasonList.featureValue')"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('faultReasonList.threshold')" prop="threshold">
          <el-input
            class="width-300"
            :value="ruleForm.threshold"
            :placeholder="$t('faultReasonList.threshold')"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('faultReasonList.level')" prop="level">
          <el-input class="width-300" :value="ruleForm.level" :placeholder="$t('faultReasonList.level')" readonly />
        </el-form-item>
      </el-form>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { alarmLevels } from '@/util/selectTypes';

export default {
  mixins: [modalMixin],
  name: 'FaultDetailModal',
  data() {
    return {
      loading: false,
      id: '',
      ruleForm: {
        machineName: '',
        sensorName: '',
        featureName: '',
        featureValue: '',
        threshold: '',
        level: '',
      },
      rules: {},
    };
  },
  mounted() {
    const params = this.options.winData;
    this.getFaultData(params.alarmId);
  },
  methods: {
    getFaultData(alarmId) {
      this.$api.faultDiagnosis
        .getFaultDetail(alarmId)
        .then((res) => {
          if (!res) return false;
          this.ruleForm = res;
          const level = alarmLevels.find((i) => i.value === this.ruleForm.level);
          this.ruleForm.level = this.$t(level.label);
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
};
</script>
<style lang="less">
#fault-detail-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
