<template>
  <div id="issue-modal">
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
        <el-form-item :label="$t('strategySend.expectedValue')" prop="desiredValue">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.desiredValue"
            :placeholder="$t('strategySend.placeholder.expectedValue')"
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
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { INT_REG, NORMAL_FLOAT_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'issueModal',
  data() {
    const integerValidator = (rule, value, callback) => {
      if (this.judgmentType === 'INTEGER') {
        if (!INT_REG.test(value)) {
          return callback(new Error(this.$t('strategySend.invalid.integer')));
        }
      } else if (this.judgmentType === 'DOUBLE') {
        if (!NORMAL_FLOAT_REG.test(value)) {
          return callback(new Error(this.$t('strategySend.invalid.float')));
        }
      } else if (this.judgmentType === 'STRING') {
        if (!value) {
          return callback(new Error(this.$t('strategySend.invalid.string')));
        }
      } else if (this.judgmentType === 'BOOLEAN') {
        if (value === 'false' || value === 'true') {
          return callback(new Error(this.$t('strategySend.invalid.boolean')));
        }
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      dataType: [],
      ruleForm: {
        desiredValue: '',
        identifierId: '',
      },
      judgmentType: null,
      identifierList: {},
      rules: {
        desiredValue: [{ required: true, validator: integerValidator, trigger: 'blur' }],
      },
    };
  },
  mounted() {
    // 下发按钮带过来参数处理
    this.judgmentType = this.options.winData.item.dataType;
    this.id = this.options.winData.deviceId;
    this.ruleForm.identifierId = this.options.winData.item.id;
    const newArr = [];
    // 接口参数格式处理
    newArr[0] = this.ruleForm;
    this.identifierList.identifierList = newArr;
  },
  methods: {
    // 弹框确认按钮之前校验
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.issue(this.id, this.identifierList);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 下发接口
    issue(id, formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.strategySend
        .issueThreshold(id, formData)
        .then((res) => {
          this.$msg.success(this.$t('strategySend.success.issueMessage'));
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
#issue-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
