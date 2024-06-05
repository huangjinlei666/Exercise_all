<template>
  <div class="feature-value-table">
    <template v-if="sensorListMap && sensorListMap.length > 0">
      <better-scroll
        ref="wrapper"
        :data="sensorListMap"
        :scrollX="true"
        style="width: 100%; height: 100%; top: 0; left: 0; bottom: 0"
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
  name: 'FeatureValueTable',
  components: {
    betterScroll,
  },
  props: {
    sensorList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState('cms/atlas', ['globalFigurePrecision']),
    sensorListMap() {
      if (!this.sensorList || this.sensorList.length === 0) {
        return [];
      }
      const list = [];
      this.sensorList.forEach((it) => {
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
};
</script>
<style lang="less" scoped>
.feature-value-table {
  width: 100%;
  height: 100%;
  position: relative;
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
      color: hsla(0, 0%, 100%, 0.35);
      transform: translateX(-50%);
    }
  }
}
</style>
