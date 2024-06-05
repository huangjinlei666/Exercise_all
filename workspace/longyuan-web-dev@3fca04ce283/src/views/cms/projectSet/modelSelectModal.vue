<template>
  <div id="model-select-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="model-content">
        <template v-for="(model, index) in modelList">
          <div :key="index" class="model-preview" @click="modelClick(model)" :class="{ click: model === modelName }">
            <div class="model-preview-title">{{ model }}</div>
            <img
              class="model-preview-img"
              v-lazy="`${$baseUrl}/models/${hierarchy.additionalInfo.projectId}/${model}/preview.png`"
              alt="preview"
            />
            <span v-if="model === modelName" class="right"></span>
          </div>
        </template>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button
          size="medium"
          :disabled="loading || !modelName || modelName === initialName"
          type="primary"
          @click="selectModel"
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
  name: 'modelSelectModal',
  data() {
    return {
      loading: false,
      initialName: '',
      hierarchy: null,
      modelList: [],
      modelName: '',
    };
  },
  mounted() {
    const { hierarchy, modelList, modelName } = this.options.winData;
    this.hierarchy = hierarchy;
    this.modelList = modelList;
    this.modelName = modelName;
    this.initialName = modelName;
  },
  methods: {
    modelClick(model) {
      this.modelName = model;
    },
    selectModel: debounce(
      function selectModel() {
        if (!this.modelName || this.modelName === this.initialName) {
          return;
        }
        this.setModelName(this.modelName);
      },
      300,
      { leading: true, trailing: false }
    ),
    setModelName(val) {
      if (!this.hierarchy || this.hierarchy.type !== 'MACHINE') {
        return;
      }
      const param = {
        name: this.hierarchy.name,
        type: this.hierarchy.type,
        additionalInfo: {
          ...this.hierarchy.additionalInfo,
          modelName: val,
        },
      };
      const id = this.hierarchy.id;
      this.loading = true;
      this.$api.projectSet
        .updateHierarchy(id, param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('pass.failure.updatePass', { 0: param.name }));
            return;
          }
          this.$msg.success(this.$t('pass.success.updatePass', { 0: param.name }));
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
#model-select-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .model-content {
    width: 100%;
    .model-preview {
      position: relative;
      display: inline-block;
      padding: 5px;
      text-align: center;
      margin: 5px;
      border: 1px solid #e8e8e8;
      border-radius: 3px;
      box-sizing: border-box;
      width: calc(33.33% - 10px);
      user-select: none;
      overflow: hidden;
      cursor: pointer;
      .model-preview-title {
        text-align: left;
        font-size: 14px;
        color: #999;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 5px;
      }
      .model-preview-img {
        width: 100%;
      }
      &:hover {
        border-color: #bbb;
      }
      &.click {
        border-color: #31b1f5;
      }
      .right {
        position: absolute;
        width: 16px;
        height: 16px;
        top: 5px;
        right: 5px;
        background: url(../../../assets/images/right.png);
      }
    }
  }
}
</style>
