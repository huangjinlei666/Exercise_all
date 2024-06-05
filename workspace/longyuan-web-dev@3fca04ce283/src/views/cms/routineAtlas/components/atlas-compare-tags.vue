<template>
  <div class="atlas-compare-tags">
    <!-- 现有对比参数tags -->
    <div class="mb-10" style="text-align: right">
      <el-tag
        size="medium"
        v-for="tag in compareParamList"
        :key="tag.sensorId"
        :closable="true"
        @close="handleTagClose(tag)"
      >
        {{ tag.sensorName + ' / ' + tag.identifierName }}
      </el-tag>
    </div>
    <!-- 图谱类型 -->
    <div class="mb-10" style="text-align: right">
      <el-select
        style="width: 100%"
        size="mini"
        v-model="chartType"
        :placeholder="$t('routineAtlas.selectTypes.chartType')"
      >
        <el-option v-for="ch in compareChartTypes" :key="ch.value" :label="$t(ch.label)" :value="ch.value"></el-option>
      </el-select>
    </div>
    <!-- 对比按钮 -->
    <AtlasButton style="width: 100%" :isSelect="true" :disabled="compareParamList.length === 0" @click="toCompare">{{
      $t('routineAtlas.compare')
    }}</AtlasButton>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { compareChartTypes } from '@/util/selectTypes';
import AtlasButton from './atlas-button.vue';
import CompareModal from '../modal/compareModal.vue';

export default {
  name: 'AtlasCompareTags',
  components: { AtlasButton },
  computed: {
    ...mapState('cms/chart', ['compareParamList']),
  },
  data() {
    return { compareChartTypes, chartType: 'Waveform' };
  },
  beforeDestroy() {
    this.saveCompareParamList([]);
  },
  methods: {
    ...mapMutations('cms/chart', ['saveCompareParamList']),
    handleTagClose(r) {
      if (!r.sensorId) {
        return;
      }
      const compareParamList = this.compareParamList.filter((i) => i.sensorId !== r.sensorId);
      this.saveCompareParamList(compareParamList);
    },
    toCompare() {
      const winData = {
        chartType: this.chartType,
        requestParamList: this.compareParamList,
      };
      this.$modal.show(this.$t('routineAtlas.compareData'), CompareModal, winData, '100%');
    },
  },
};
</script>

<style lang="less" scoped>
.atlas-compare-tags {
  position: relative;
  .title-box {
    width: 100%;
    height: 55px;
    padding: 15px 20px;
    box-sizing: border-box;
    .title {
      font-size: 16px;
      line-height: 25px;
      font-weight: bold;
    }
    .btn {
      font-size: 14px;
      line-height: 25px;
    }
  }
  .tag-box {
    padding: 10px 20px;
    .el-tag {
      display: block;
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
