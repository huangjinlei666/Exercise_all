<template>
  <div id="basic-set-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <el-form-item :label="$t('routineAtlas.frequencyAxis')" prop="x">
          <el-input class="width-300" v-model="ruleForm.x"></el-input>
        </el-form-item>
        <!-- <el-form-item :label="$t('routineAtlas.accelerationAxis')" prop="y">
          <el-input class="width-300" v-model="ruleForm.y" :disabled="true"></el-input>
        </el-form-item> -->
        <el-form-item :label="$t('routineAtlas.selectTypes.frequencyDoubling')" prop="basicNum">
          <el-input-number
            class="width-300"
            v-model="ruleForm.basicNum"
            :min="1"
            :max="100"
            :placeholder="this.$t('routineAtlas.selectTypes.inputFrequencyDoubling')"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" type="primary" @click="submitForm('ruleForm')">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'BasicSetModal',
  data() {
    return {
      ruleForm: {
        x: '',
        y: '',
        basicNum: '',
      },
      rules: {
        basicNum: [
          {
            required: true,
            message: `${this.$t('routineAtlas.selectTypes.inputFrequencyDoubling')}`,
            trigger: 'change',
          },
        ],
      },
    };
  },
  mounted() {
    const { x, y } = this.options.winData;
    this.ruleForm.x = x;
    this.ruleForm.y = y;
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.handleConfirm(this.ruleForm);
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
#basic-set-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 800px;
      overflow: auto;
    }
  }
}
</style>
