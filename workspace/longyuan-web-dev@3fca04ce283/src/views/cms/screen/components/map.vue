<template>
  <div id="screen-map">
    <div class="bg-screen-img">
      <p class="bg-screen-title">{{ title }}</p>
    </div>
    <div class="tip-box" v-if="$route.name === 'farm'">
      <div class="tip-box-item" v-for="tipBox in tipBoxList" :key="tipBox.text">
        <span :class="tipBox.class" style="width: 4px; height: 4px"></span>
        <span style="display: inline-block; vertical-align: middle">{{ tipBox.text }}</span>
      </div>
    </div>
    <template v-if="$route.name === 'farm'">
      <FanList v-if="mapMachineList.length > 0" :fanlist="mapMachineList"></FanList>
    </template>
  </div>
</template>

<script>
import { regionData } from '@/util/selectTypes';
import { loadMP } from '@/util/commonService';
import isNumber from 'lodash/isNumber';
import FanList from './fanList.vue';

export default {
  name: 'ScreenMap',
  components: { FanList },
  data() {
    return {
      map: null,
      title: '',
      mapMachineList: [],
      tipBoxList: [
        { class: 'status-circle bg-color-ok', text: this.$t('common.OK') },
        { class: 'status-circle bg-color-attention', text: this.$t('common.ATTENTION') },
        { class: 'status-circle bg-color-error', text: this.$t('common.ERROR') },
      ],
      timedRefresh: null,
      flag: true,
    };
  },
  mounted() {
    // 地图加载
    loadMP().then((res) => {
      if (res && res.v) {
        console.info(this.$t('common.mapLoadSuccess'));
        this.initMap();
      }
      if (res && res.type === 'error') {
        console.error(this.$t('common.mapLoadError'));
      }
    });
  },
  beforeDestroy() {
    this.map && this.map.destroy();
    this.map = null;
    window.clearInterval(this.timedRefresh);
    this.timedRefresh = null;
  },
  methods: {
    async initData() {
      const { hierarchyId, title } = this.$route.query;
      this.title = title;
      const fanData = this.fetchFactoryCountData(hierarchyId);
      const speedData = this.getSpeed(hierarchyId);
      const awaitfanData = await fanData;
      const awaitspeedData = await speedData;
    },
    fetchFactoryCountData(id) {
      if (!id) {
        return;
      }
      this.$api.screen
        .getFactoryCount(id)
        .then((res) => {
          if (!res || res.length === 0) {
            return;
          }
          // 风机转速接口返回数据字段speed可能没有可能为null，先默认给它全部赋值为--
          this.mapMachineList = res.map((item) => {
            item.speed = '--';
            return item;
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    getSpeed(id) {
      this.timedRefresh = setInterval(() => {
        this.$api.screen
          .getFanSpeed(id)
          .then((response) => {
            if (!response || response.length === 0) {
              this.drawMachineList(this.mapMachineList);
              return;
            }
            // 遍历两次返回的数据相对应的数据赋值
            for (let i = 0; i < this.mapMachineList.length; i += 1) {
              for (let j = 0; j < response.length; j += 1) {
                // 两次返回的数据machineId相等但是speed不--的话就赋值
                if (
                  response[j].machineId === this.mapMachineList[i].hierarchyId &&
                  response[j].speed !== '--' &&
                  response[j].speed !== null
                ) {
                  this.mapMachineList[i].speed = `${response[j].speed}rpm`;
                }
              }
            }
            this.drawMachineList(this.mapMachineList);
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      }, 5000);
    },
    initMap() {
      // 初始化地图
      this.map = new AMap.Map('screen-map', {
        mapStyle: 'amap://styles/25a04c0f81055839899d424f6cb737ed', // 设置地图显示样式
        zoom: 6,
      });
      this.$nextTick(() => {
        this.initData();
      });
    },
    getLocation() {
      this.map.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          buttonOffset: new AMap.Pixel(10, 20),
          zoomToAccuracy: true,
          buttonPosition: 'RB',
        });
        geolocation.getCurrentPosition();
        AMap.event.addListener(geolocation, 'complete', (data) => {
          const centerPosition = new AMap.LngLat(data.position.lng, data.position.lat);
          this && this.map && this.map.setCenter(centerPosition);
        });
        AMap.event.addListener(geolocation, 'error', (err) => {
          console.log('---Failed to get the location---');
          console.log(err);
        });
      });
    },
    // 地图上添加标记物
    drawMachineList(mapMachineList) {
      if (!this.mapMachineList || this.mapMachineList.length === 0) {
        this.getLocation();
        return;
      }
      if (this.map.clearMap) {
        this.map.clearMap();
      }
      const markerList = [];
      // 遍历地图数据
      this.mapMachineList.forEach((element) => {
        // 判断经纬度是否存在并数值化处理
        if (
          element &&
          element.longitude &&
          isNumber(+element.longitude) &&
          element.latitude &&
          isNumber(+element.latitude)
        ) {
          let src = '';
          let marker = '';
          // 根据不同状态使用不用颜色的风机动画图片
          src = '/images/map/map-fan-OK.gif';
          // if (element.alarmLevel === 'EMERGENCY') {
          //   src = '/images/map/map-fan-danger.gif';
          // }
          // if (element.alarmLevel === 'ERROR') {
          //   src = '/images/map/map-fan-error.gif';
          // }
          if (element.alarmLevel === 'ATTENTION') {
            src = '/images/map/map-fan-attention.gif';
          }
          if (element.alarmLevel === 'WARN') {
            src = '/images/map/map-fan-warn.gif';
          }
          // 添加标记物并优化其样式
          marker = new AMap.Marker({
            position: new AMap.LngLat(element.longitude, element.latitude),
            content: `
                 <div style="text-align:center">
                  <div style="margin-bottom:5px;border-radius:5px;width:130px;justify-content:center;display:flex;align-items:center;padding:5px;background: #0D334B;border: 1px solid rgba(71, 218, 255, 0.2);font-size: 14px;font-weight: 400;color: #0FD1E8;">
                   <p style="word-break:break-all">${element.name}
                  </p>
                   <span style="margin-left:5px;">${element.speed}<span/>
                  </div>
                  <img src="${src}" />
                </div>`,
          });

          markerList.push(marker);
          this.addHoverHandler(marker, element);
        }
      });
      // 点聚合
      const styles = [
        {
          url: 'https://a.amap.com/jsapi_demos/static/images/blue.png',
          size: new AMap.Size(32, 32),
          // offset: new AMap.Pixel(-16, -16),
        },
        {
          url: 'https://a.amap.com/jsapi_demos/static/images/green.png',
          size: new AMap.Size(32, 32),
          // offset: new AMap.Pixel(-16, -16),
        },
        {
          url: 'https://a.amap.com/jsapi_demos/static/images/orange.png',
          size: new AMap.Size(36, 36),
          // offset: new AMap.Pixel(-18, -18),
        },
        {
          url: 'https://a.amap.com/jsapi_demos/static/images/red.png',
          size: new AMap.Size(48, 48),
          // offset: new AMap.Pixel(-24, -24),
        },
        {
          url: 'https://a.amap.com/jsapi_demos/static/images/darkRed.png',
          size: new AMap.Size(48, 48),
          // offset: new AMap.Pixel(-24, -24),
        },
      ];
      this.map.plugin(['AMap.MarkerClusterer'], () => {
        // eslint-disable-next-line
        this.cluster = new AMap.MarkerClusterer(this.map, markerList, { styles });
        if (this.flag) this.map.setFitView(markerList);
        this.flag = false;
      });
    },
    // 添加标记物点击事件
    addHoverHandler(marker, element) {
      marker.on('click', () => {
        const { name } = this.$route;
        // 通过路由名称判断当前页面是在哪一个层级
        if (name === 'group') {
          this.$router.push({
            name: 'regional',
            query: {
              hierarchyId: element.hierarchyId,
              title: element.name,
            },
            params: {
              type: 'FACTORY',
              parentQuery: this.$route.query,
            },
          });
        }
        if (name === 'regional') {
          this.$router.push({
            name: 'farm',
            query: {
              hierarchyId: element.hierarchyId,
              title: element.name,
            },
            params: {
              type: 'WORKSHOP',
              parentQuery: this.$route.query,
            },
          });
        }
        if (name === 'farm') {
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
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
#screen-map {
  width: 100%;
  height: 100%;
  font-size: 14px;
  .tip-box {
    width: 25%;
    position: absolute;
    bottom: 2%;
    left: 2%;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    line-height: 12px;
    white-space: nowrap;
    z-index: 100;
    .tip-box-item {
      display: inline-block;
      margin-right: 10px;
      .status-circle {
        border-radius: 0;
      }
    }
  }
  .bg-screen-img {
    width: 314px;
    height: 44px;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-157px);
    z-index: 100;
    background: url(/images/map/bg-title.png);
    .bg-screen-title {
      font-size: 18px;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      line-height: 44px;
    }
  }
}
</style>
