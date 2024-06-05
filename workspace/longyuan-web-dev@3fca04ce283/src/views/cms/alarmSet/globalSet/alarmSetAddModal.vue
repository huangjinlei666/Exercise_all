<template>
  <div id="alarm-set-add-modal">
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
        <el-form-item :label="$t('alarmSet.variety')" prop="featureIdentifier">
          <el-select
            class="width-300"
            v-model="ruleForm.featureIdentifier"
            :placeholder="$t('alarmSet.placeholder.variates')"
            size="medium"
            clearable
            :disabled="options.winData.oper === 'edit'"
            @visible-change="visibleChange"
          >
            <template v-for="item in globleVariableTypes">
              <el-option :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="13">
            <el-form-item :label="$t('alarmSet.frequencyBandSet')" prop="lowCut" class="">
              <el-input
                class="width-130"
                v-model.trim="ruleForm.lowCut"
                :placeholder="$t('alarmSet.placeholder.lowCut')"
                @blur="handleBlur"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="" label-width="10" prop="heightCut">
              <el-input
                prop="heightCut"
                class="width-130"
                v-model.trim="ruleForm.heightCut"
                :placeholder="$t('alarmSet.placeholder.heightCut')"
                @blur="handleBlur"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('alarmSet.attentionValue')" prop="attentionValue">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.attentionValue"
            :placeholder="$t('alarmSet.placeholder.attentionValue')"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('alarmSet.errorValue')" prop="errorValue">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.errorValue"
            :placeholder="$t('alarmSet.placeholder.errorValue')"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { FLOAT_REG } from '@/util/regExpService';
import { globleVariableTypes } from '@/util/selectTypes';
import { getBrowserType } from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'alarmSetAddModal',
  data() {
    const attentionValueValidator = (rule, value, callback) => {
      if (!FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('alarmSet.invalid.attentionValue')));
      }
      const errorValue = this.ruleForm.errorValue;
      if (value && errorValue && parseFloat(value) >= parseFloat(errorValue)) {
        return callback(new Error(this.$t('alarmSet.invalid.attentionValue')));
      }
      callback();
    };
    const errorValueValidator = (rule, value, callback) => {
      if (!FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('alarmSet.invalid.errorValue')));
      }
      const attentionValue = this.ruleForm.attentionValue;
      if (value && attentionValue && parseFloat(value) <= parseFloat(attentionValue)) {
        return callback(new Error(this.$t('alarmSet.invalid.errorValue')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      globleVariableTypes,
      ruleForm: {
        featureIdentifier: '',
        attentionValue: '',
        errorValue: '',
        lowCut: '',
        heightCut: '',
      },
      rules: {
        featureIdentifier: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.variates'),
            trigger: 'change',
          },
        ],
        attentionValue: [
          {
            required: true,
            validator: attentionValueValidator,
            trigger: 'blur',
          },
        ],
        errorValue: [
          {
            required: true,
            validator: errorValueValidator,
            trigger: 'blur',
          },
        ],
        lowCut: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.lowCut'),
            trigger: 'change',
          },
        ],
        heightCut: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.heightCut'),
            trigger: 'change',
          },
        ],
      },
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    const { oper, item } = this.options.winData;
    if (oper === 'edit') {
      this.id = item.id;
      this.machineList = [{ id: item.machineId, name: item.machineName }];
      this.ruleForm = {
        featureIdentifier: item.featureIdentifier,
        attentionValue: item.attentionValue,
        errorValue: item.errorValue,
        lowCut: item.lowCut,
        heightCut: item.heightCut,
      };
    }
  },
  methods: {
    handleBlur() {
      this.$refs.ruleForm.validateField(['attentionValue', 'errorValue']);
    },
    visibleChange(isVisible) {
      const isEdge = getBrowserType().type;
      if (isEdge === 'Edge' && !isVisible) {
        document.querySelectorAll('body > .el-select-dropdown.el-popper').forEach((it) => it.remove());
      }
    },
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          }
          if (this.options.winData.oper === 'edit') {
            this.edit(this.id, this.ruleForm);
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
      this.$api.alarmSet
        .createAlarmSetGlobal(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('alarmSet.failure.create'));
            return;
          }
          this.$msg.success(this.$t('alarmSet.success.create'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    edit(id, formData) {
      const { sensorId, machineId } = this.options.winData.item;
      if (!(id && formData && sensorId && machineId)) {
        return;
      }
      formData.sensorId = sensorId;
      formData.machineId = machineId;
      this.loading = true;
      this.$api.alarmSet
        .updateAlarmSet(id, formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('alarmSet.failure.update'));
            return;
          }
          this.$msg.success(this.$t('alarmSet.success.update'));
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
#alarm-set-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
