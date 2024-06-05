<template>
  <el-menu-item :index="menu.path || menu.path + sid">
    <!-- <i v-if="menu.icon" :class="[menu.icon, 'fe-icon']" style="font-size: 16px"></i> -->
    <img v-if="menu.icon" :src="menu.icon" />
    <span slot="title">{{ $t(menu.title) }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'menu-item',
  props: {
    menu: {
      type: Object,
      default: () => {},
    },
    sid: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style></style>
