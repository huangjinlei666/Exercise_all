<template>
  <div class="fan-list">
    <div class="list-box" v-if="isShow">
      <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
      <div class="header-top">
        <img src="../../../../assets/images/screen/icon-title.png" alt />
        <span class="sceen-title-text">{{ $t('screen.fanList') }}</span>
      </div>
      <div class="list">
        <better-scroll :data="fanlist" ref="expertTable">
          <ul>
            <li
              v-for="(item, index) in fanlist"
              :key="index"
              :class="{
                'color-ok': !item.alarmLevel || item.alarmLevel === 'OK',
                'color-attention': item.alarmLevel === 'ATTENTION',
                'color-error':
                  item.alarmLevel === 'WARN' || item.alarmLevel === 'ERROR' || item.alarmLevel === 'EMERGENCY',
              }"
              @click="goFan(item)"
            >
              {{ item.name }}
            </li>
          </ul>
        </better-scroll>
      </div>
    </div>
    <div :class="isShow ? 'arrow arrow-show ' : 'arrow arrow-hide'" @click="drawer">
      <i v-if="isShow" class="el-icon-d-arrow-left"></i>
      <i v-else class="el-icon-d-arrow-right"></i>
    </div>
  </div>
</template>
<script>
import betterScroll from '@/components/better-scroll/index.vue';

export default {
  name: 'fanList',
  props: {
    fanlist: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    betterScroll,
  },
  data() {
    return {
      isShow: true,
      tableData: [],
    };
  },
  methods: {
    drawer() {
      this.isShow = !this.isShow;
    },
    goFan(element) {
      this.$router.push({
        name: 'machine',
        query: {
          hierarchyId: element.hierarchyId,
          title: `${this.$route.query.title} / ${element.name}`,
        },
        params: {
          type: 'MACHINE',
          parentQuery: this.$route.query,
        },
      });
    },
  },
};
</script>
<style lang="less" scoped>
.fan-list {
  z-index: 999;
  position: absolute;
  width: 240px;
  height: calc(58%+40px);
  top: 0px;
  left: 0;
  font-size: 12px;
  line-height: 28px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  .list-box {
    padding: 10px;
    height: calc(100%-13.5px);
    background-color: rgba(7, 23, 45, 0.6);
    border: 1px solid rgba(71, 218, 255, 0.1);
    .list {
      position: relative;
      top: 5px;
      height: calc(100% - 25px);
      ul {
        margin: 0;
        padding: 0;
        li {
          margin: 0;
          padding: 0 10px;
          list-style: none;
          text-align: left;
          &:nth-of-type(odd) {
            background-color: rgba(32, 46, 66, 0.6);
          }
          &:nth-of-type(even) {
            background-color: rgba(16, 32, 53, 0.6);
          }
          &:hover {
            background-color: rgba(71, 218, 255, 0.1);
          }
        }
      }
    }
  }
  .arrow {
    width: 22px;
    height: 60px;
    line-height: 60px;
    position: absolute;
    font-size: 16px;
    top: calc(50% - 30px);
    background-color: rgba(13, 51, 75, 0.6);
    border: 1px solid rgba(71, 218, 255, 0.1);
  }
  .arrow-show {
    right: -24px;
  }
  .arrow-hide {
    left: 0px;
  }
}
</style>
