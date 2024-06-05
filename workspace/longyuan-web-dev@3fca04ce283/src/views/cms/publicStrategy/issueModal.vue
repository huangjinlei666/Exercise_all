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
        <el-form-item :label="$t('publicStrategy.fanEquipment')" prop="deviceIds">
          <el-select
            class="width-300"
            v-model.trim="ruleForm.deviceIds"
            :placeholder="$t('publicStrategy.placeholder.fanEquipment')"
            multiple
          >
            <el-option v-for="item in fanData" :key="item.id" :label="item.name" :value="item.deviceId"></el-option>
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
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import cloneDeep from 'lodash/cloneDeep';

export default {
  mixins: [modalMixin],
  name: 'issueModal',
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  data() {
    return {
      loading: false,
      id: '',
      fanData: [],
      ruleForm: {
        deviceIds: '',
      },
      rules: {
        deviceIds: [{ required: true, message: this.$t('publicStrategy.placeholder.fanEquipment'), trigger: 'blur' }],
      },
    };
  },
  mounted() {
    const list = [];
    this.filterMachineList(cloneDeep(this.passList), list);
    // 获取风机列表数据，deviceId为空或者null 删除当这条数据
    this.fanData = list.filter((item) => item.deviceId != null);
    // 下发按钮带过来的参数处理
    const { oper, item } = this.options.winData;
    this.ruleForm.identifierParamId = this.options.winData.id;
  },
  methods: {
    filterMachineList(passList, list) {
      passList.forEach((item) => {
        if (item.type === 'WORKSHOP' && item.hierarchies && item.hierarchies.length > 0) {
          item.hierarchies.forEach((i) => {
            list.push(i);
          });
        }
        if (item.type !== 'WORKSHOP' && item.hierarchies && item.hierarchies.length > 0) {
          this.filterMachineList(item.hierarchies, list);
        }
      });
    },
    // 下发之前校验
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.issue(this.ruleForm);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 下发接口
    issue(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.publicStrategy
        .issueStrategy(formData)
        .then((res) => {
          this.$msg.success(this.$t('publicStrategy.success.issueStrategy'));
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
