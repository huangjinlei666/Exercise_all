<template>
  <div id="user-delete-modal">
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
            <el-table-column prop="name" :label="$t('user.username')"></el-table-column>
            <el-table-column v-if="email" prop="email" :label="$t('user.email')"></el-table-column>
            <el-table-column v-else prop="phoneNumber" :label="$t('user.phoneNumber')"></el-table-column>
            <el-table-column prop="createdAt" :label="$t('common.createTime')"></el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="deleteUser()">{{
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
  name: 'userDeleteModal',
  data() {
    return {
      loading: false,
      userId: '',
      userName: '',
      email: '',
      title: '',
      tip: '',
      list: [],
    };
  },
  mounted() {
    const { list, text } = this.options.winData;
    this.userId = list[0].id;
    this.userName = list[0].name;
    this.email = list[0].email;
    this.list = list.map((item) => {
      item.createdAt = this.$dateFormat.formatLocalDateTime(item.createdAt);
      return item;
    });
    this.title = text && text.title;
    this.tip = text && text.tip;
  },
  methods: {
    deleteUser: debounce(
      function deleteUser() {
        this.loading = true;
        this.$api.user
          .deleteUser(this.userId)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('user.failure.deleteUser', { 0: this.userName }));
              return;
            }
            this.$msg.success(this.$t('user.success.deleteUser', { 0: this.userName }));
            this.handleConfirm();
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
#user-delete-modal {
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
