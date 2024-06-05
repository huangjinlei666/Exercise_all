<template>
  <div class="fan-information sceen-element-unit">
    <img class="sceen-top-filter-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="header-top">
      <img src="../../../../assets/images/screen/icon-title.png" alt />
      <span class="sceen-title-text">{{ $t('screen.fanInfo') }}</span>
    </div>
    <div class="content display_flex">
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <div class="point"></div>
          <p class="title">{{ $t('screen.brand') }}</p>
        </div>
        <p class="fanName mt-10" :title="data.brand">{{ data.brand }}</p>
      </div>
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <div class="point"></div>
          <p class="title">{{ $t('screen.type') }}</p>
        </div>
        <p class="fanName mt-10" :title="data.equipmentModel">{{ data.equipmentModel }}</p>
      </div>
      <div class="list-box">
        <div class="title-box display_flex align-items_center">
          <div class="point"></div>
          <p class="title">{{ $t('screen.watt') }}</p>
        </div>
        <p class="fanName mt-10" :title="data.watt">{{ data.watt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';

export default {
  name: 'FanInformation',
  props: {
    fanEquipment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      data: {},
    };
  },
  watch: {
    fanEquipment: {
      handler(value, oldValue) {
        if (!value) {
          return;
        }
        this.data = value;
      },
      immediate: true,
    },
  },
  mounted() {
    // this.fetchFactoryCountData(this.$route.query.hierarchyId);
  },
  beforeDestroy() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.fan-information {
  width: 100%;
  height: 100%;
  position: relative;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  .content {
    width: 100%;
    justify-content: space-around;
    position: relative;
    top: 10%;
    .list-box {
      // text-align: center;
      width: 30%;
      .title-box {
        justify-content: flex-start;
      }
    }
    .point {
      width: 6px;
      height: 6px;
      background: #0fd1e8;
      border-radius: 50%;
      margin-right: 10px;
    }
    .title {
      font-size: 16px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.65);
    }
    .fanName {
      font-size: 18px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      margin-left: 17px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
