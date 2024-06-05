<template>
  <div id="pass-delete-modal">
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
            <el-table-column v-if="type === 'PROJECT'" prop="name" :label="$t('pass.projectName')"></el-table-column>
            <el-table-column v-if="type === 'PROJECT'" prop="id" :label="$t('pass.id')"></el-table-column>
            <el-table-column v-if="type === 'FACTORY'" prop="name" :label="$t('pass.factoryName')"></el-table-column>
            <el-table-column
              v-if="type === 'FACTORY'"
              prop="additionalInfo.location"
              :label="$t('pass.location')"
            ></el-table-column>
            <el-table-column v-if="type === 'WORKSHOP'" prop="name" :label="$t('pass.workshopName')"></el-table-column>
            <el-table-column
              v-if="type === 'WORKSHOP'"
              prop="additionalInfo.address"
              :label="$t('pass.address')"
            ></el-table-column>
            <el-table-column v-if="type === 'MACHINE'" prop="name" :label="$t('pass.workGroupName')"></el-table-column>
            <el-table-column
              v-if="type === 'MACHINE'"
              prop="additionalInfo.workGroupType"
              :label="$t('pass.workGroupType')"
            ></el-table-column>
            <el-table-column prop="createdAt" :label="$t('common.createTime')"></el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="deletePass()">{{
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
  name: 'passDeleteModal',
  data() {
    return {
      loading: false,
      id: '',
      name: '',
      type: '',
      list: [],
      title: '',
      tip: '',
    };
  },
  mounted() {
    const { list, text } = this.options.winData;
    this.id = list[0].id;
    this.name = list[0].name;
    this.type = list[0].type;
    this.list = list.map((item) => {
      item.createdAt = this.$dateFormat.formatLocalDateTime(item.createdAt);
      return item;
    });
    this.title = text && text.title;
    this.tip = text && text.tip;
  },
  methods: {
    deletePass: debounce(
      function deletePass() {
        this.$api.projectSet
          .deleteHierarchy(this.id)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('pass.failure.deletePass', { 0: this.name }));
              return;
            }
            this.$msg.success(this.$t('pass.success.deletePass', { 0: this.name }));
            this.handleConfirm();
          })
          .catch((err) => {
            this.$msg(err);
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
#pass-delete-modal {
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
