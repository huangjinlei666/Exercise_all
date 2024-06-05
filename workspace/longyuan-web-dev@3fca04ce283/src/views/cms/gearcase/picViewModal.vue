<template>
  <div id="pic-view-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div v-loading="loading" style="overflow: auto; max-height: 400px">
        <img class="img" :src="imgUrl" alt="gearbox picture" ref="image" @mousewheel="rollImage" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'picViewModal',
  data() {
    return {
      loading: false,
      id: '',
      imgUrl: '',
    };
  },
  mounted() {
    const { id } = this.options.winData;
    this.id = id;
    this.fetchPicture(id);
  },
  methods: {
    rollImage(event) {
      let zoom = parseInt(this.$refs.image.style.width, 10) || 100;
      zoom += event.wheelDelta / 12;
      if (zoom >= 100 && zoom < 300) {
        this.$refs.image.style.width = `${zoom}%`;
      }
      return false;
    },
    fetchPicture(id) {
      if (!id) {
        this.$msg(this.$t('errorCode.000'));
        return;
      }
      this.loading = true;
      this.$api.gearcase
        .getDrawing(id)
        .then((res) => {
          if (!res || !res.content) {
            this.$msg.error(this.$t('gearbox.failure.drawing'));
          }
          const str = window.atob(res.content);
          const UnicodeArr = new Array(str.length);
          for (let i = 0; i < str.length; i += 1) {
            UnicodeArr[i] = str.charCodeAt(i);
          }
          const unit8 = new Uint8Array(UnicodeArr);
          let binary = '';
          for (let i = 0; i < unit8.byteLength; i += 1) {
            binary += String.fromCharCode(unit8[i]);
          }
          this.imgUrl = `data:image/jpeg;base64,${window.btoa(binary)}`;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false;
          }, 500);
        });
    },
  },
};
</script>
<style lang="less">
#pic-view-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .img {
    width: 100%;
  }
}
</style>
