<template>
  <div class="fe-aside-box">
    <el-menu
      class="fe-aside"
      :collapse="asideCollapse"
      :unique-opened="true"
      :default-active="active"
      background-color="#2b5e79"
      text-color="#ffffff"
      active-text-color="#ffffff"
      @select="handleSelect"
    >
      <template v-if="aside && aside.length > 0">
        <template v-for="(menu, index) in aside">
          <menu-item v-if="menu.children === undefined" :key="index + ''" :menu="menu" :sid="index"></menu-item>
          <sub-menu v-else :key="index + ''" :menu="menu" :sid="index"></sub-menu>
        </template>
      </template>
      <div v-else>{{ $t('common.noMenu') }}</div>
    </el-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BScroll from 'better-scroll';
import SubMenu from '../menu/subMenu.vue';
import MenuItem from '../menu/menuItem.vue';

export default {
  name: 'menu-aside',
  components: { SubMenu, MenuItem },
  data() {
    return {
      active: '',
      BS: null,
    };
  },
  computed: {
    ...mapState('system/layout', ['asideCollapse']),
    ...mapState('system/menu', ['aside']),
  },
  watch: {
    asideCollapse(val) {
      this.scrollDestroy();
      setTimeout(() => {
        this.scrollInit();
      }, 500);
    },
    '$route.fullPath': {
      handler(value) {
        if (this.$route && this.$route.meta && this.$route.meta.isDetail) {
          this.active = this.$route.meta.parentPath;
        } else {
          this.active = value;
        }
      },
      immediate: true,
    },
  },
  methods: {
    scrollInit() {
      this.BS = new BScroll(this.$el, {
        mouseWheel: true,
        click: true,
        // scrollbar: {
        //   fade: true,
        //   interactive: false,
        // },
      });
    },
    scrollDestroy() {
      try {
        this.BS.destroy();
      } catch (e) {
        delete this.BS;
        this.BS = null;
      }
    },
    handleSelect(index) {
      if (!index) {
        return;
      }
      this.$router.push({
        path: index,
      });
    },
  },
  mounted() {
    this.scrollInit();
  },
  beforeDestroy() {
    this.scrollDestroy();
  },
};
</script>

<style lang="less">
.fe-aside-box {
  position: absolute;
  overflow: hidden;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  .fe-aside {
    border: none;
    .el-menu-item.is-active {
      background-color: #173f55 !important;
    }
    .el-submenu__icon-arrow {
      color: #ffffff;
      font-size: 16px;
    }
    // .el-menu-item,
    // .el-submenu__title {
    //   height: 40px;
    //   line-height: 40px;
    //   margin-top: 4px;
    //   margin-bottom: 4px;
    //   position: relative;
    //   &:hover {
    //     color: #1890ff !important;
    //     background-color: #fff !important;
    //     i {
    //       color: #1890ff !important;
    //     }
    //   }
    // }
    // .el-menu-item.is-active {
    //   background-color: #e6f7ff !important;
    //   &:after {
    //     content: '';
    //     display: block;
    //     position: absolute;
    //     top: 0;
    //     right: 0;
    //     bottom: 0;
    //     border-right: 3px solid #1890ff;
    //   }
    // }
    // .el-submenu.is-active {
    //   .el-submenu__title {
    //     color: #1890ff !important;
    //     i {
    //       color: #1890ff !important;
    //     }
    //   }
    // }
  }
}
</style>
