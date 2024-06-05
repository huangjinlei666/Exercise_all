<template>
  <div
    ref="boxDom"
    class="debug"
    :style="{ left: item.coordinate.x, top: item.coordinate.y, height: item.length === 2 ? '44%' : '28%' }"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <div class="grident-bar">
      <img src="../../assets/images/bg-head.png" alt="bg-head" />
    </div>
    <div class="location">
      <span class="location-title">{{ $t(item.name) }}</span>
    </div>
    <template v-if="sensorListMap && sensorListMap.length > 0">
      <better-scroll
        ref="wrapper"
        :data="sensorListMap"
        :scrollX="true"
        style="width: calc(100% - 20px); height: calc(100% - 36px); top: 26px; left: 10px; bottom: 10px"
      >
        <ul class="sensor-box">
          <li
            v-for="s in sensorListMap"
            :key="s.id"
            class="sensor"
            :class="{
              'color-ok': s.alarmLevel === 'OK',
              'color-attention': s.alarmLevel === 'ATTENTION',
              'color-error': s.alarmLevel === 'WARN' || s.alarmLevel === 'ERROR' || s.alarmLevel === 'EMERGENCY',
            }"
          >
            <el-row :gutter="2">
              <el-col :span="8" class="col-ellipsis">{{ s.sensorName }}</el-col>
              <el-col :span="8" class="col-ellipsis">{{ s.identifierName }}</el-col>
              <el-col :span="8" class="col-ellipsis">{{ s.valueUnit }}</el-col>
            </el-row>
          </li>
        </ul>
      </better-scroll>
    </template>
    <div v-else class="nodata">
      <span class="no-text">{{ $t('overview.noSensorData') }}</span>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { getFloat } from '@/util/commonService';
import betterScroll from '@/components/better-scroll/index.vue';

export default {
  name: 'textbox',
  components: {
    betterScroll,
  },
  props: {
    item: {
      type: Object,
      default: () => ({
        location: '',
        sensorList: [],
      }),
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    ...mapState('cms/atlas', ['globalFigurePrecision']),
    sensorListMap() {
      if (!this.item.sensorList || this.item.sensorList.length === 0) {
        return [];
      }
      const list = [];
      this.item.sensorList.forEach((it) => {
        if (it.identifierList && it.identifierList.length > 0) {
          it.identifierList.forEach((i) => {
            list.push({
              id: it.sensorId + i.identifier,
              sensorName: it.sensorName,
              identifierName: i.identifierName,
              valueUnit: i.identifier
                ? `${getFloat(i.value, this.globalFigurePrecision) || '--'} ${(i.metadata && i.metadata.unit) || '--'}`
                : '--',
              alarmLevel: i.alarmLevel,
            });
          });
        }
      });
      return list;
    },
  },
  mounted() {
    this.$emit('on-text-box-add', this);
  },
  beforeDestroy() {
    this.$emit('on-text-box-remove', this);
  },
  methods: {
    handleMouseOver() {
      this.hover = true;
    },
    handleMouseLeave() {
      this.hover = false;
    },
  },
};
</script>
<style lang="less">
.debug {
  width: 25%;
  position: absolute;
  background-color: rgba(24, 144, 255, 0.08);
  box-sizing: border-box;
  border: 1px solid rgba(71, 218, 255, 0.1);
  color: rgba(255, 255, 255, 0.35);
  user-select: none;
  text-align: left;
  cursor: pointer;
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .grident-bar {
    position: absolute;
    top: -8px;
    left: 0;
    width: 100%;
    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 8px;
    }
  }
  .location {
    height: 26px;
    padding: 0 10px;
    white-space: nowrap;
    box-sizing: border-box;
    .location-title {
      display: inline-block;
      line-height: 26px;
      font-size: 14px;
      font-weight: bold;
      vertical-align: middle;
      color: rgba(255, 255, 255, 0.85);
    }
  }
  .sensor-box {
    margin: 0;
    padding: 0;
    .sensor {
      padding: 5px;
      list-style: none;
      font-size: 12px;
      line-height: 16px;
      color: @color-ok;
      &:nth-of-type(odd) {
        background-color: rgba(255, 255, 255, 0.1);
      }
      &:nth-of-type(even) {
        background-color: rgba(255, 255, 255, 0.04);
      }
    }
  }
  .nodata {
    height: calc(100% - 36px);
    position: relative;
    .no-text {
      font-size: 12px;
      line-height: 12px;
      position: absolute;
      top: calc(50% - 20px);
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
