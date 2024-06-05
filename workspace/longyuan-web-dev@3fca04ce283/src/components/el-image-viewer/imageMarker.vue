<template>
  <div ref="marker" class="image-marker" :style="rectStyle"></div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'image-marker',
  props: ['markerRect'],
  data() {
    return {
      parentRect: '',
      rectStyle: '',
    };
  },
  watch: {
    markerRect(v) {
      this.getRectStyle();
    },
    parentRect(v) {
      this.getRectStyle();
    },
  },
  mounted() {
    this.getParentRect();
    this.getRectStyle();
  },
  methods: {
    getParentRect() {
      const imgbox = $(this.$refs.marker).parent();
      const width = imgbox.width() || 0;
      const height = imgbox.height() || 0;
      this.parentRect = { width, height };
    },
    getRectStyle() {
      const top = Math.round(this.parentRect.height * this.markerRect.top);
      const left = Math.round(this.parentRect.width * this.markerRect.left);
      const width = Math.round(this.parentRect.width * this.markerRect.width);
      const height = Math.round(this.parentRect.height * this.markerRect.height);
      this.rectStyle = `top:${top}px;left:${left}px;width:${width}px;height:${height}px`;
    },
  },
};
</script>
<style lang="less" scoped>
.image-marker {
  position: absolute;
  border: 1px solid #f00;
}
</style>
