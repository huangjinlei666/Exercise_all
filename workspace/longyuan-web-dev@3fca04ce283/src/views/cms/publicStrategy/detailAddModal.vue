<template>
  <div id="detail-add-modal">
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
        <el-form-item :label="$t('publicStrategy.parameterName')" prop="name">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.name"
            :placeholder="$t('publicStrategy.placeholder.addPubliPparameters')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('publicStrategy.identifier')" prop="identifier">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.identifier"
            :placeholder="$t('publicStrategy.placeholder.identifier')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('publicStrategy.dataType')" prop="dataType">
          <el-select
            class="width-300"
            v-model.trim="ruleForm.dataType"
            :placeholder="$t('publicStrategy.placeholder.dataType')"
          >
            <el-option v-for="item in dataType" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'detailAddModal',
  data() {
    return {
      loading: false,
      id: '',
      dataType: [
        { value: 'STRING', label: this.$t('publicStrategy.string') },
        { value: 'INTEGER', label: this.$t('publicStrategy.integer') },
        { value: 'FLOAT', label: this.$t('publicStrategy.float') },
        { value: 'BOOLEAN', label: this.$t('publicStrategy.boolean') },
      ],
      ruleForm: {
        name: '',
        identifier: '',
        dataType: '',
      },
      rules: {
        name: [
          { required: true, message: this.$t('publicStrategy.placeholder.addPubliPparameters'), trigger: 'blur' },
          { min: 1, max: 128, message: this.$t('publicStrategy.nameLimit'), trigger: 'blur' },
        ],
        identifier: [
          { required: true, message: this.$t('publicStrategy.placeholder.identifier'), trigger: 'blur' },
          { min: 1, max: 32, message: this.$t('publicStrategy.identifierLimit'), trigger: 'blur' },
        ],
      },
    };
  },
  mounted() {
    // 新增按钮带过来的参数处理
    const { oper, item } = this.options.winData;
    // 如果是编辑操作就给弹框赋值
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm.name = item.name;
      this.ruleForm.identifier = item.identifier;
      this.ruleForm.dataType = item.dataType;
      // 如果是新增操作就需要获取策略的id
    } else {
      this.ruleForm.commonStrategyId = this.options.winData.id;
    }
  },
  methods: {
    // 提交之前校验
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
        .addIdentifierParams(formData)
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
        .updateStrategyPamars(id, formData)
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
#detail-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
