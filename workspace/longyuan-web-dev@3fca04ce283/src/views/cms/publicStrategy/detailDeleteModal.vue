<template>
  <div id="detail-delete-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div v-loading="loading">
        <div class="cms-delete-text">{{ title }}</div>
        <div class="cms-delete-tip">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
          <span>{{ tip }}</span>
        </div>
        <div class="user-table">
          <el-table :data="list" style="width: 100%">
            <el-table-column prop="name" :label="$t('publicStrategy.parameterName')"></el-table-column>
            <el-table-column prop="identifier" :label="$t('publicStrategy.identifier')"></el-table-column>
            <el-table-column prop="createdAt" :label="$t('common.createTime')"></el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="deleteUser()">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'detailDeleteModal',
  data() {
    return {
      loading: false,
      id: '',
      title: '',
      tip: '',
      list: [],
    };
  },
  mounted() {
    // 删除按钮带过来的参数处理
    const { deleteId, list, text } = this.options.winData;
    this.id = deleteId;
    this.list = list;
    this.title = text && text.title;
    this.tip = text && text.tip;
  },
  methods: {
    // 删除接口
    deleteUser: debounce(
      function deleteUser() {
        this.loading = true;
        this.$api.publicStrategy
          .deleteStrategyPamars(this.id)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('publicStrategy.failure.deleteStrategyPamars'));
              return;
            }
            this.$msg.success(this.$t('publicStrategy.success.deleteStrategyPamars'));
            this.handleConfirm();
          })
          .catch((err) => {
            this.$msg(err.errorMessage);
          })
          .finally(() => {
            this.loading = false;
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
<style lang="less" scoped>
#detail-delete-modal {
  .cms-delete-text {
    font-size: 16px;
    padding-left: 10px;
    margin-bottom: 10px;
  }
  .cms-delete-tip {
    padding-left: 10px;
    margin-bottom: 10px;
    i {
      color: #ffc71c;
      font-size: 26px;
      vertical-align: middle;
    }
    span {
      margin-left: 10px;
      color: #999;
      vertical-align: middle;
    }
  }
}
</style>
