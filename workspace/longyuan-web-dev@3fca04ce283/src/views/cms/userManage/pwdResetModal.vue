<template>
  <div id="pwd-reset-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '700px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div v-loading="loading" class="cms-delete-text">
        {{ $t('user.resetPwdText', { 0: name }) }}
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="handleReset()">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import { mapState, mapMutations } from 'vuex';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'pwdResetModal',
  data() {
    return {
      loading: false,
      id: '',
      name: '',
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    const { item } = this.options.winData;
    this.id = item.id;
    this.name = item.name;
  },
  methods: {
    ...mapMutations('system/account', ['logout']),
    handleReset: debounce(
      function handleReset() {
        this.loading = true;
        this.$api.user
          .resetUserPwd(this.id)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('user.failure.resetPwd', { 0: this.name }));
              return;
            }
            this.$msg.success(this.$t('user.success.resetPwd', { 0: this.name }));
            this.handleConfirm();
            // 如果重置了当前用户的密码，则登出
            if (this.info.id === this.id) {
              this.logout();
            }
          })
          .catch((err) => {
            this.$msg.error(err);
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
#pwd-reset-modal {
  .cms-delete-text {
    font-size: 14px;
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
