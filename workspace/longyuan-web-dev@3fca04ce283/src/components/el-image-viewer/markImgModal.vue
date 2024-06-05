<template>
  <div id="pic-view-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div id="pic-view-modal-body" v-loading="loading" style="position: relative" @mousedown="mousedown">
        <img class="img" :src="imgUrl" alt="gearbox picture" ref="image" draggable="false" />
        <image-marker ref="imgMarker" v-if="isShowMarker" :markerRect="markerRect" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" type="primary" @click="handleConfirm(markerRect)">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import $ from 'jquery';
import cloneDeep from 'lodash';
import modalMixin from '@/plugins/modal/mixin';
import imageMarker from '@/components/el-image-viewer/imageMarker.vue';

const defaultRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
};

export default {
  name: 'picViewModal',
  mixins: [modalMixin],
  components: {
    imageMarker,
  },
  data() {
    return {
      loading: false,
      id: '',
      imgUrl: '',
      isShowMarker: false,
      markerRect: cloneDeep(defaultRect),
    };
  },
  mounted() {
    const { id } = this.options.winData;
    this.id = id;
    this.fetchPicture(id);
  },
  computed: {
    basePoint() {
      const imgbox = $('#pic-view-modal-body');
      const x = imgbox.offset().left || 0;
      const y = imgbox.offset().top || 0;
      return { x, y };
    },
    parentRect() {
      const imgbox = $('#pic-view-modal-body');
      const width = imgbox.width() || 0;
      const height = imgbox.height() || 0;
      return { width, height };
    },
  },
  methods: {
    // getImageSize() {},
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
          this.showMarker(res);
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
    showMarker(imgData) {
      // test
      // this.isShowMarker = true;
      // this.markerRect = {
      //   left: 0.1,
      //   top: 0.1,
      //   width: 0.2,
      //   height: 0.2,
      // };
    },
    mousedown(e) {
      this.isShowMarker = false;
      this.markerRect = cloneDeep(defaultRect);
      const left = e.clientX - this.basePoint.x;
      const top = e.clientY - this.basePoint.y;
      this.markerRect.left = Math.round((left / this.parentRect.width) * 100) / 100;
      this.markerRect.top = Math.round((top / this.parentRect.height) * 100) / 100;
      const move = (mevt) => {
        this.mousemove(mevt, left, top);
      };
      const up = (uevt) => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    },
    mousemove(e, left, top) {
      this.isShowMarker = true;
      const x = e.clientX - this.basePoint.x;
      const y = e.clientY - this.basePoint.y;
      this.markerRect.width = Math.round(((x - left) / this.parentRect.width) * 100) / 100;
      this.markerRect.height = Math.round(((y - top) / this.parentRect.height) * 100) / 100;
      this.$refs.imgMarker.getRectStyle();
    },
  },
};
</script>
<style lang="less" scoped>
#pic-view-modal {
  .img {
    width: 100%;
    user-select: none;
  }
}
</style>
