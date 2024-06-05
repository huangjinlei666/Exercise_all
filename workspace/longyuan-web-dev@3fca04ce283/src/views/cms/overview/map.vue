<template>
  <div id="myMap">
    <template v-if="!showMap">
      <template v-if="mapMachineList.length > 0">
        <better-scroll
          :data="mapMachineList"
          style="width: calc(100% - 20px); height: calc(100% - 20px); top: 10px; left: 10px"
        >
          <ul class="machine-box">
            <li v-for="(item, index) in mapMachineList" :key="index">
              <cms-factory-status-rect :statusForm="item"></cms-factory-status-rect>
            </li>
          </ul>
        </better-scroll>
      </template>
      <cms-nodata v-if="mapMachineList.length === 0" :message="$t('overview.noWorkshopData')"></cms-nodata>
    </template>
  </div>
</template>
<script>
import isNumber from 'lodash/isNumber';
import { loadMP } from '@/util/commonService';
import CmsNodata from '@/components/cms-nodata/index.vue';
import BetterScroll from '@/components/better-scroll/index.vue';
import CmsFactoryStatusRect from '@/components/cms-status-rect/factory-status-rect.vue';

export default {
  name: 'overviewMap',
  components: {
    CmsNodata,
    BetterScroll,
    CmsFactoryStatusRect,
  },
  props: {
    mapMachineList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      map: null,
      cluster: null,
      showMap: false,
    };
  },
  mounted() {
    loadMP().then((res) => {
      if (res && res.v) {
        console.info(this.$t('common.mapLoadSuccess'));
        this.showMap = true;
        this.initMap();
      }
      if (res && res.type === 'error') {
        console.error(this.$t('common.mapLoadError'));
        this.showMap = false;
      }
    });
  },
  watch: {
    mapMachineList: {
      handler(value, oldValue) {
        if (!this.map) {
          return;
        }
        if (this.map.clearMap) {
          this.map.clearMap();
        }

        if (this.cluster) {
          this.cluster.setMap(null);
        }
        if (!value || value.length === 0) {
          return;
        }
        this.drawMachineList(value);
      },
      immediate: true,
    },
    map: {
      handler(value) {
        if (value && this.mapMachineList) {
          if (this.map.clearMap) {
            this.map.clearMap();
          }
          if (this.cluster) {
            this.cluster.setMap(null);
          }
          this.drawMachineList(this.mapMachineList);
        }
      },
    },
  },
  beforeDestroy() {
    this.map && this.map.destroy();
    this.map = null;
  },
  methods: {
    initMap() {
      // 初始化地图
      this.map = new AMap.Map('myMap', {
        mapStyle: 'amap://styles/blue', // 设置地图显示样式
        resizeTnable: true,
        zoom: 6,
      });
      // this.getLocation();
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
    drawMachineList(mapMachineList) {
      if (!mapMachineList || mapMachineList.length === 0) {
        this.getLocation();
        return;
      }
      const markerList = [];
      mapMachineList.forEach((element) => {
        if (
          element.additionalInfo &&
          element.additionalInfo.longitude &&
          isNumber(+element.additionalInfo.longitude) &&
          element.additionalInfo.latitude &&
          isNumber(+element.additionalInfo.latitude)
        ) {
          let src = '/images/map/icon_factory_ok.png';
          if (element.attentionTotal) {
            src = '/images/map/icon_factory_attention.png';
          }
          if (element.warnTotal) {
            src = '/images/map/icon_factory_warn.png';
          }
          if (element.errorTotal) {
            src = '/images/map/icon_factory_error.png';
          }
          if (element.emergencyTotal) {
            src = '/images/map/icon_factory_emergency.png';
          }
          const marker = new AMap.Marker({
            position: new AMap.LngLat(element.additionalInfo.longitude, element.additionalInfo.latitude),
            content: `<img style="width:32px; height:32px" src=${src} />`,
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
        this.map.setFitView(markerList);
      });
    },
    addHoverHandler(marker, element) {
      let w = null;
      marker.on('mouseover', () => {
        const okTitle = this.$t('overview.ok');
        const attentionTitle = this.$t('overview.attention');
        const warnTitle = this.$t('overview.warn');
        const errorTitle = this.$t('overview.error');
        const emergencyTitle = this.$t('overview.emergency');
        const content = `<div style="position: relative;">
          <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; background: rgba(0, 0, 0, 0.6); z-index: -1; border-radius: 3px;"></div>
          <div style="padding: 10px 10px 5px;">
            <div style="font-size: 14px; color: #fff; margin-bottom: 5px;">${element.name} ( ${element.total} )</div>
            <div style="white-space: nowrap;">
              <div style="font-size: 12px; line-height: 16px; margin: 0 5px 5px 0; display: inline-block; vertical-align: middle">
                <span style="color: #64c42d; font-weight: bold;">${okTitle}: ${element.okTotal}</span>
              </div>
              <div style="font-size: 12px; line-height: 16px; margin: 0 5px 5px 0; display: inline-block; vertical-align: middle">
                <span style="color: #47a0f5; font-weight: bold;">${attentionTitle}: ${element.attentionTotal}</span>
              </div>
              <div style="font-size: 12px; line-height: 16px; margin: 0 5px 5px 0; display: inline-block; vertical-align: middle">
                <span style="color: #f8cf00; font-weight: bold;">${warnTitle}: ${element.warnTotal}</span>
              </div>
              <div style="font-size: 12px; line-height: 16px; margin: 0 5px 5px 0; display: inline-block; vertical-align: middle">
                <span style="color: #ff7d00; font-weight: bold;">${errorTitle}: ${element.errorTotal}</span>
              </div>
              <div style="font-size: 12px; line-height: 16px; margin: 0 5px 5px 0; display: inline-block; vertical-align: middle">
                <span style="color: #df3317; font-weight: bold;">${emergencyTitle}: ${element.emergencyTotal}</span>
              </div>
            </div>
          </div>
        <div>`;
        w = new AMap.InfoWindow({
          content,
          offset: new AMap.Pixel(0, -32),
        });
        w.open(this.map, marker.getPosition());
      });
      marker.on('mouseout', () => {
        w.close();
      });
    },
  },
};
</script>
<style lang="less" scoped>
#myMap {
  height: 535px;
  position: relative;
  .machine-box {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      margin: 0;
      padding: 0;
      list-style: none;
      display: inline;
    }
  }
}
</style>
