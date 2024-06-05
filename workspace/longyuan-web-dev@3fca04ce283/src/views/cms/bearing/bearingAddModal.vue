<template>
  <div id="bearing-add-modal">
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
        <div style="margin: -20px 0 10px 253px">
          <el-radio-group v-model="ruleForm.standard">
            <el-radio-button :label="true">标准轴承</el-radio-button>
            <el-radio-button :label="false">非标轴承</el-radio-button>
          </el-radio-group>
        </div>
        <el-form-item :label="$t('bearing.bearingNumber')" prop="bearingNumber">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.bearingNumber"
            :placeholder="$t('bearing.placeholder.bearingNumber')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('bearing.rollNumber')" prop="rollNumber">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.rollNumber"
            :placeholder="$t('bearing.placeholder.rollNumber')"
          >
          </el-input>
        </el-form-item>
        <template v-if="ruleForm.standard">
          <el-form-item :label="$t('bearing.cageFrequency')" prop="cageFrequency">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.cageFrequency"
              :placeholder="$t('bearing.placeholder.frequency')"
            >
              <span slot="append">hz</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('bearing.rollFrequency')" prop="rollFrequency">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.rollFrequency"
              :placeholder="$t('bearing.placeholder.frequency')"
            >
              <span slot="append">hz</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('bearing.outerFrequency')" prop="outerFrequency">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.outerFrequency"
              :placeholder="$t('bearing.placeholder.frequency')"
            >
              <span slot="append">hz</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('bearing.innerFrequency')" prop="innerFrequency">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.innerFrequency"
              :placeholder="$t('bearing.placeholder.frequency')"
            >
              <span slot="append">hz</span>
            </el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="'计算频率'" prop="bearingNumber">
            <el-radio v-model="fixed" :label="true">外圈固定</el-radio>
            <el-radio v-model="fixed" :label="false">外圈不固定</el-radio>
          </el-form-item>
          <el-form-item :label="'滚动体直径'" prop="d">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.d"
              :placeholder="$t('bearing.placeholder.rollingElementDiameter')"
            >
              <span slot="append">mm</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="'节圆直径'" prop="D">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.D"
              :placeholder="$t('bearing.placeholder.pitchDiameter')"
            >
              <span slot="append">mm</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="'接触角度'" prop="angle">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.angle"
              :placeholder="$t('bearing.placeholder.contactAngle')"
            >
              <span slot="append">度</span>
            </el-input>
          </el-form-item>
          <!-- <el-form-item :label="'输入转速'" prop="R">
            <el-input class="width-300" v-model.trim="ruleForm.R" :placeholder="$t('bearing.placeholder.speed')">
              <span slot="append">rpm</span>
            </el-input>
          </el-form-item> -->
          <el-form-item :label="'滚动体个数'" prop="N">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.N"
              :placeholder="$t('bearing.placeholder.rollingNumber')"
            >
              <span slot="append">个</span>
            </el-input>
          </el-form-item>

          <el-form-item :label="'外圈转速'" prop="P" v-if="!fixed">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.P"
              :placeholder="$t('bearing.placeholder.outerRingSpeed')"
            >
              <span slot="append">rpm</span>
            </el-input>
          </el-form-item>
        </template>
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
import { NAME_64_REG, POSITIVE_FLOAT_REG, POSITIVE_INT_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'bearingAddModal',
  data() {
    function lessthan1000(v) {
      return v <= 1000;
    }
    const bearingNumberValidator = (rule, value, callback) => {
      if (!NAME_64_REG.test(value)) {
        return callback(new Error(this.$t('bearing.invalid.bearingNumber')));
      }
      callback();
    };
    const frequencyValidator = (rule, value, callback) => {
      if (!POSITIVE_FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('bearing.invalid.frequency')));
      }
      if (!lessthan1000(value)) {
        return callback(new Error(this.$t('bearing.invalid.frequency')));
      }
      callback();
    };
    const rollNumberValidator = (rule, value, callback) => {
      if (!POSITIVE_INT_REG.test(value)) {
        return callback(new Error(this.$t('bearing.invalid.rollNumber')));
      }
      if (!lessthan1000(value)) {
        return callback(new Error(this.$t('bearing.invalid.rollNumber')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      fixed: true,
      pi: 3.1415926,
      ruleForm: {
        bearingNumber: '',
        innerFrequency: '',
        outerFrequency: '',
        rollFrequency: '',
        cageFrequency: '',
        rollNumber: '',
        D: '',
        d: '',
        P: '',
        N: '',
        R: 1,
        angle: '',
        standard: true,
      },
      rules: {
        bearingNumber: [{ required: true, validator: bearingNumberValidator, trigger: 'blur' }],
        innerFrequency: [{ required: true, validator: frequencyValidator, trigger: 'blur' }],
        outerFrequency: [{ required: true, validator: frequencyValidator, trigger: 'blur' }],
        rollFrequency: [{ required: true, validator: frequencyValidator, trigger: 'blur' }],
        cageFrequency: [{ required: true, validator: frequencyValidator, trigger: 'blur' }],
        rollNumber: [{ required: true, validator: rollNumberValidator, trigger: 'blur' }],
        D: [{ required: true, message: this.$t('bearing.placeholder.pitchDiameter'), trigger: 'blur' }],
        d: [{ required: true, message: this.$t('bearing.placeholder.rollingElementDiameter'), trigger: 'blur' }],
        P: [{ required: true, message: this.$t('bearing.placeholder.outerRingSpeed'), trigger: 'blur' }],
        N: [{ required: true, message: this.$t('bearing.placeholder.rollingNumber'), trigger: 'blur' }],
        // R: [{ required: true, message: this.$t('bearing.placeholder.speed'), trigger: 'blur' }],
        angle: [{ required: true, message: this.$t('bearing.placeholder.contactAngle'), trigger: 'blur' }],
      },
    };
  },
  mounted() {
    const { oper, item } = this.options.winData;
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm.bearingNumber = item.bearingNumber;
      this.ruleForm.innerFrequency = item.innerFrequency;
      this.ruleForm.outerFrequency = item.outerFrequency;
      this.ruleForm.rollFrequency = item.rollFrequency;
      this.ruleForm.cageFrequency = item.cageFrequency;
      this.ruleForm.rollNumber = item.rollNumber;
      this.ruleForm.d = item.nonStandardContent.d;
      this.ruleForm.D = item.nonStandardContent.D;
      this.ruleForm.P = item.nonStandardContent.P;
      this.ruleForm.N = item.nonStandardContent.N;
      // this.ruleForm.R = item.nonStandardContent.R;
      this.ruleForm.angle = item.nonStandardContent.angle;
      this.ruleForm.standard = item.standard;
      this.fixed = item.nonStandardContent.fixed;
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
      // 如果是非标准轴承，则计算保持架 外圈 滚子或滚柱 内圈
      if (!formData.standard) {
        this.caclulateFormData(formData);
      }
      this.loading = true;
      this.$api.bearing
        .addBearing(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('bearing.failure.createBearing'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.createBearing'));
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
      // 如果是非标准轴承，则计算保持架 外圈 滚子或滚柱 内圈
      if (!formData.standard) {
        this.caclulateFormData(formData);
      }
      this.loading = true;
      this.$api.bearing
        .updateBearing(id, formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('bearing.failure.updateBearing'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.updateBearing'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 计算保持架
    caclulateCageFrequency(R, D, d, α, P) {
      if (this.fixed) {
        return (R / 120) * (1 - (d / D) * Math.cos((α * this.pi) / 180));
      }
      return (
        (R / 120) * (1 - (d / D) * Math.cos((α * this.pi) / 180)) +
        (P / 120) * (1 + (d / D) * Math.cos((α * this.pi) / 180))
      );
    },
    // 计算滚子或滚柱
    caclulateRollFrequency(R, D, d, α, P) {
      if (this.fixed) {
        return ((D * R) / (d * 120)) * (1 - Math.pow((d / D) * Math.cos((α * this.pi) / 180), 2));
      }
      return Math.abs(((D * (R - P)) / (d * 120)) * (1 - Math.pow((d / D) * Math.cos((α * this.pi) / 180), 2)));
    },
    // 计算外圈
    caclulateOut(R, D, d, α, P, N) {
      if (this.fixed) {
        return ((R * N) / 120) * (1 - (d / D) * Math.cos((α * this.pi) / 180));
      }
      return Math.abs((((R - P) * N) / 120) * (1 - (d / D) * Math.cos((α * this.pi) / 180)));
    },
    // 计算内圈
    caclulateIn(R, D, d, α, P, N) {
      if (this.fixed) {
        return ((R * N) / 120) * (1 + (d / D) * Math.cos((α * this.pi) / 180));
      }
      return Math.abs((((R - P) * N) / 120) * (1 + (d / D) * Math.cos((α * this.pi) / 180)));
    },
    // 计算
    caclulateFormData(formData) {
      const { R, D, d, angle, P, N } = formData;
      formData.cageFrequency = this.caclulateCageFrequency(R, D, d, angle, P);
      formData.rollFrequency = this.caclulateRollFrequency(R, D, d, angle, P);
      formData.outerFrequency = this.caclulateOut(R, D, d, angle, P, N);
      formData.innerFrequency = this.caclulateIn(R, D, d, angle, P, N);
      const fixed = this.fixed;
      formData.nonStandardContent = { R, D, d, angle, P, N, fixed };
    },
  },
};
</script>
<style lang="less">
#bearing-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
      .el-input-group__append {
        width: 25px;
        padding: 0 10px;
      }
    }
  }
}
</style>
