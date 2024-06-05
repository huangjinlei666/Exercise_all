<template>
  <div>
    <el-submenu :index="menu.path || menu.path + sid">
      <template slot="title">
        <!-- <i v-if="menu.icon" :class="[menu.icon, 'fe-icon']" style="font-size: 16px"></i> -->
        <img v-if="menu.icon" :src="menu.icon" alt="" />
        <span>{{ $t(menu.title) }}</span>
      </template>
      <template v-if="menu.children && menu.children.length > 0">
        <template v-for="(c, index) in menu.children">
          <menu-item v-if="c.children === undefined" :key="index + ''" :menu="c"></menu-item>
          <sub-menu v-else :key="index + ''" :menu="c"></sub-menu>
        </template>
      </template>
    </el-submenu>
  </div>
</template>

<script>
import MenuItem from './menuItem.vue';

export default {
  name: 'sub-menu',
  components: {
    MenuItem,
  },
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
