<template>
  <div id="bearing-delete-modal">
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
            <el-table-column prop="deviceNo" :label="$t('equipmentMng.mainControlNo')"></el-table-column>
            <el-table-column prop="deviceName" :label="$t('equipmentMng.mainControlName')"></el-table-column>
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
  name: 'bearingDeleteModal',
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
    const { list, text } = this.options.winData;
    this.id = list[0].id;
    this.list = list;
    this.title = text && text.title;
    this.tip = text && text.tip;
  },
  methods: {
    deleteUser: debounce(
      function deleteUser() {
        this.loading = true;
        this.$api.equipmentMng
          .deleteDevices(this.id)
          .then((res) => {
            if (!res) {
              this.$msg.error(this.$t('equipmentMng.failure.deleteEquipment'));
              return;
            }
            this.$msg.success(this.$t('equipmentMng.success.deleteEquipment'));
            this.handleConfirm();
          })
          .catch((err) => {
            this.$msg.error(err);
            this.handleConfirm();
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
#bearing-delete-modal {
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
