<template>
  <el-container class="fe-layout">
    <cms-browser-tip></cms-browser-tip>
    <!-- header -->
    <el-header class="fe-layout-header">
      <!-- logo -->
      <header-logo></header-logo>
      <!-- logo title -->
      <!-- <span class="fe-aside-logo-title">{{ $t('title') }}</span> -->
      <!-- collapse trigger icon -->
      <i v-if="!asideCollapse" class="fa fa-outdent font-20 fe-layout-trigger" @click="toogle"></i>
      <i v-if="asideCollapse" class="fa fa-indent font-20 fe-layout-trigger" @click="toogle"></i>
      <!-- bread crumb -->
      <div class="fe-layout-bread-crumb">{{ breadCrumb }}</div>
      <!-- user info -->
      <header-user></header-user>
      <!-- locales -->
      <header-locales></header-locales>
      <!-- fullscreen -->
      <!-- <template v-if="!passLoading && hierarchy && hierarchy.type === 'MACHINE' && $route.path.includes('index')">
        <header-fullscreen></header-fullscreen>
      </template> -->
      <!-- 集团大屏 -->
      <span class="systemVersion" @click="systemVersion"><i class="fa fa-info"></i>{{ $t('systemVersion') }}</span>
      <screen-fullscreen></screen-fullscreen>
    </el-header>
    <el-container style="position: relative; width: 100%; height: calc(100% - 60px)">
      <!-- aside -->
      <div
        class="fe-layout-aside"
        :style="{
          width: asideCollapse ? '64px' : '200px',
          minWidth: asideCollapse ? '64px' : '200px',
        }"
      >
        <menu-aside></menu-aside>
      </div>
      <!-- content -->
      <el-container style="height: 100%; overflow-x: hidden">
        <el-main class="fe-layout-content">
          <div class="fe-layout-content-container clearfix">
            <cms-pass
              class="pull-left mr-10"
              :style="{ width: contentLeftWidth + 'px', height: passHeight + 'px' }"
              v-if="needPassPathArr.includes($route.path)"
            ></cms-pass>
            <div ref="mainContentRef" class="pull-left" :style="{ width: contentRightWidth }">
              <router-view></router-view>
            </div>
          </div>
          <!-- footer -->
          <!-- <div class="fe-layout-footer">
            {{ $t('common.copyright1') + new Date().getFullYear() + $t('common.copyright2') }}
          </div> -->
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import cmsBrowserTip from '@/components/cms-browser-tip/index.vue';
import { needPassPathArr } from '@/router/routes';
import MenuAside from './components/menu-aside/index.vue';
import HeaderLogo from './components/header-logo/index.vue';
import HeaderUser from './components/header-user/index.vue';
import HeaderLocales from './components/header-locales/index.vue';
import HeaderFullscreen from './components/header-fullscreen/index.vue';
import cmsPass from '../../components/cms-pass/index.vue';
import ScreenFullscreen from './components/screen-fullscreen/index.vue';
import config from '../../../package.json';

export default {
  name: 'fe-layout',
  components: {
    MenuAside,
    HeaderLogo,
    HeaderUser,
    HeaderLocales,
    // HeaderFullscreen,
    ScreenFullscreen,
    cmsPass,
    cmsBrowserTip,
  },
  data() {
    return {
      needPassPathArr,
      titleDebounce: false,
      passHeight: 697,
      frontVersion: 'V2.0.1',
      backVersion: 'V2.0.1',
    };
  },
  computed: {
    ...mapState('system/layout', ['asideCollapse']),
    ...mapState('cms/pass', ['passLoading', 'breadCrumb', 'passCollapse', 'hierarchy']),
    ...mapState('system/permission', ['permissionArr']),
    ...mapState('cms/chart', ['screenNumber']),
    contentLeftWidth() {
      if (this.passCollapse) {
        return 38;
      }
      return 200;
    },
    contentRightWidth() {
      if (!this.needPassPathArr.includes(this.$route.path)) {
        return '100%';
      }
      return `calc(100% - ${this.contentLeftWidth + 10}px)`;
    },
  },
  watch: {
    '$route.fullPath': {
      handler() {
        this.computedPassHeight();
      },
      immediate: true,
    },
    hierarchy: {
      handler() {
        this.computedPassHeight();
      },
      immediate: true,
    },
    screenNumber() {
      this.computedPassHeight();
    },
  },
  methods: {
    ...mapMutations({
      saveAsideCollapse: 'system/layout/saveAsideCollapse',
      saveRefreshTime: 'cms/atlas/saveRefreshTime',
      saveGlobalFigurePrecision: 'cms/atlas/saveGlobalFigurePrecision',
    }),
    systemVersion() {
      this.$alert(
        `<div><div>前端版本: <span>${this.frontVersion}</span></div><div>后端版本: <span>${this.backVersion}</span></div></div>`,
        '系统版本',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
        }
      );
    },
    getBackVersion() {
      this.$api.overview
        .getBackVersion()
        .then((res) => {
          if (!res || !res.data) {
            return;
          }
          this.backVersion = `V${res.data}`;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    computedPassHeight() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs && this.$refs.mainContentRef) {
            const heightValue = this.$refs.mainContentRef.offsetHeight;
            if (heightValue !== this.passHeight) {
              this.passHeight = heightValue;
            }
          }
        }, 0);
      });
    },
    toogle() {
      if (this.asideCollapse) {
        this.toggleTitle();
      } else {
        this.titleDebounce = false;
      }
      this.saveAsideCollapse(!this.asideCollapse);
    },
    toggleTitle() {
      setTimeout(() => {
        this.titleDebounce = true;
      }, 500);
    },
    fetchAtlas() {
      this.$api.atlas
        .getAtlas()
        .then((res) => {
          if (!res) {
            return;
          }
          // 图谱刷新时间
          this.saveRefreshTime(res.refreshTime);
          // 总貌图小数点位数
          this.saveGlobalFigurePrecision(res.globalFigurePrecision);
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
  mounted() {
    this.getBackVersion();
    this.frontVersion = `V${config.version}`;
    if (!this.asideCollapse) {
      this.toggleTitle();
    }
    // 查询图谱设置
    if (this.permissionArr.includes('ViewData')) {
      this.fetchAtlas();
    }
  },
};
</script>

<style lang="less">
.fe-layout {
  height: 100%;
  min-width: 900px !important;
  .fe-layout-header {
    padding: 0;
    background-color: @color-white-bg;
    box-shadow: 0 0 12px -2px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
  .systemVersion {
    float: right;
    margin: 10px 20px;
    padding: 12px 5px;
    color: #606266;
    font-size: 14px;
    cursor: pointer;
    i {
      margin-right: 5px;
    }
  }
  .fe-aside-logo-title {
    float: left;
    font-size: 18px;
    line-height: 60px;
    font-weight: bold;
    vertical-align: middle;
    color: #484848;
  }
  .fe-layout-aside {
    position: relative;
    opacity: 1;
    transition: all 0.3s;
    background-color: #2b5e79;
  }
  .fe-layout-content {
    width: 100%;
    padding: 0;
    background-color: @color-content-bg;
    box-sizing: border-box;
    position: relative;
    overflow: auto;
    .fe-layout-content-container {
      position: relative;
      padding: 20px 0 20px 20px;
      color: #333;
      box-sizing: border-box;
      width: 100%;
      min-width: 970px;
      min-height: 100%;
      // min-height: calc(100% - 42px);
      background-color: @color-content-bg;
    }
    .fe-layout-footer {
      position: relative;
      height: 42px !important;
      text-align: center;
      font-size: 12px;
      padding: 0;
      box-sizing: border-box;
      color: @color-text-normal;
    }
  }

  .fe-layout-trigger {
    float: left;
    padding: 0 24px;
    line-height: 60px;
    cursor: pointer;
    transition: color 0.3s;
    color: #606266;
    &:hover {
      color: @color-primary;
    }
  }
  .fe-layout-bread-crumb {
    float: left;
    line-height: 20px;
    padding: 20px 0;
    font-size: 14px;
    color: #aaa;
  }
  .fe-layout-dropdown {
    float: right;
    margin: 20px;
    // line-height: 19px;
    .el-dropdown-link {
      cursor: pointer;
      &:hover {
        color: @color-primary;
      }
    }
  }
}
</style>
