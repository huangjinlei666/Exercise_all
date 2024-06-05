<template>
  <div id="user-add-modal">
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
        <el-form-item :label="$t('user.dataPermission')" prop="hierarchyId">
          <div class="permission-box">
            <el-tree
              ref="permissionTree"
              :data="copyPassList"
              node-key="id"
              :show-checkbox="true"
              :check-strictly="true"
              :props="defaultProps"
              :default-expand-all="true"
              @check="handleCheck"
              :expand-on-click-node="false"
              :default-checked-keys="defaultCheckedKeys"
            ></el-tree>
          </div>
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
import cloneDeep from 'lodash/cloneDeep';
import { extractCheckedNode, operateTree, extractHierarchy, disableSonHierarchies } from '@/util/commonService';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'changePermission',
  data() {
    return {
      loading: false,
      id: '',
      name: '',
      defaultCheckedKeys: [],
      copyPassList: [],
      ruleForm: {
        hierarchyId: '',
      },
      rules: {
        hierarchyId: [{ required: true, message: this.$t('user.invalid.dataPermission') }],
      },
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
      },
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    this.copyPassList = cloneDeep(this.passList);
    const { item } = this.options.winData;
    this.id = item.id;
    this.name = item.name;
    this.ruleForm.hierarchyId = item.hierarchyId || this.copyPassList[0].id;
    const checkedNode = extractCheckedNode(this.copyPassList, item.hierarchyId || this.copyPassList[0].id);
    const checkedKeys = [];
    extractHierarchy([checkedNode], checkedKeys);
    this.defaultCheckedKeys = checkedKeys;
    if (this.info.id === item.id) {
      operateTree(this.copyPassList, true);
    }
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.changePermission(this.id, this.ruleForm);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    changePermission(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      this.$api.user
        .assignUser(id, formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('user.failure.assignUser', { 0: this.name }));
            return;
          }
          this.$msg.success(this.$t('user.success.assignUser', { 0: this.name }));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCheck(data, checkedData) {
      const checked = checkedData.checkedKeys.includes(data.id);
      if (!checked) {
        // 当前节点取消选中时，直接赋值表格数据和tree数据
        this.ruleForm.hierarchyId = '';
        this.$refs.permissionTree.setCheckedKeys([]);
        operateTree(this.copyPassList, false);
        // 执行手动校验
        this.$refs.ruleForm.validateField(['hierarchyId']);
        return;
      }
      if (this.ruleForm.hierarchyId && this.ruleForm.hierarchyId !== data.id) {
        // 当前选中的节点与现有选中节点不想同时，将tree的所有节点恢复为可选
        operateTree(this.copyPassList, false);
      }
      this.ruleForm.hierarchyId = data.id;
      const idArr = [];
      // 抽取出当前节点及其子节点的id，组成一个id数组，并将这些id对应的节点设置为选中状态
      extractHierarchy([data], idArr);
      this.$refs.permissionTree.setCheckedKeys(idArr);
      // 将当前节点的子节点设置为不可选状态
      this.findHierarchy(this.copyPassList, data.id);
      // 执行手动校验
      this.$refs.ruleForm.validateField(['hierarchyId']);
    },
    findHierarchy(array, tid) {
      let findFlag = false;
      array.every((a) => {
        if (a.id === tid) {
          findFlag = true;
          disableSonHierarchies(a);
          return false;
        }
        if (a.hierarchies && a.hierarchies.length > 0) {
          findFlag = this.findHierarchy(a.hierarchies, tid);
          if (findFlag) {
            return false;
          }
        }
        return true;
      });
    },
  },
};
</script>
<style lang="less">
#user-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .permission-box {
    width: 300px;
    height: 300px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
