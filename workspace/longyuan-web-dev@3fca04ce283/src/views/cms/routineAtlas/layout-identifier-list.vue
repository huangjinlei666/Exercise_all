<template>
  <div class="layout-identifier-list">
    <img class="identifier-list--title-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <AtlasTitle :title="$t('routineAtlas.currentDataCollectionInfo')"></AtlasTitle>
    <template v-if="identifierList && identifierList.length > 0">
      <div class="bs-wrapper">
        <better-scroll ref="wrapper" :data="identifierList" :scrollX="true">
          <ul>
            <li>
              <AtalsIdentifierElement
                v-for="identifier in identifierList"
                :key="identifier.id"
                :name="identifier.name"
                :value="identifier.value"
                :unit="identifier.unit"
              />
            </li>
          </ul>
        </better-scroll>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BetterScroll from '@/components/better-scroll/index.vue';
import { identifierSort, extractWorkshopId } from '@/util/commonService';
import AtlasTitle from './components/atlas-title.vue';
import AtalsIdentifierElement from './components/atlas-identifier-element.vue';

export default {
  name: 'LayoutIdentifierList',
  components: {
    BetterScroll,
    AtlasTitle,
    AtalsIdentifierElement,
  },
  props: {
    requestParam: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      identifierList: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  watch: {
    requestParam(v) {
      if (!v || !v.machineId || !v.sensorId) {
        this.identifierList = [];
        return;
      }
      const workshopId = extractWorkshopId(this.passList, v.machineId);
      this.fetchSensorList(v.sensorId, workshopId);
    },
  },
  methods: {
    fetchSensorList(sensorId, workshopId) {
      this.$api.projectSet
        .getVariatesBySensorId(sensorId, workshopId)
        .then((res) => {
          if (!res || !res.variates || res.variates.length === 0) {
            this.identifierList = [];
            return;
          }
          const ret = [];
          res.variates.forEach((i) => {
            const { identifier, name, value, metadata } = i;
            if (value !== undefined && value !== null && value !== '') {
              ret.push({
                id: identifier.toLowerCase(),
                name,
                value,
                unit: metadata && metadata.unit,
              });
            }
          });
          this.identifierList = identifierSort(ret);
        })
        .catch(() => {
          this.identifierList = [];
        });
    },
  },
};
</script>

<style lang="less" scoped>
.layout-identifier-list {
  position: relative;
  width: 100%;
  height: 35%;
  margin-top: 10px;
  box-sizing: border-box;
  border-radius: 3px;
  font-size: 14px;
  background-color: #07172d;
  padding: 10px;
  ul {
    margin: 0;
    padding: 0;
    width: 100%;
    min-width: max-content;
  }
  li {
    list-style: none;
  }
  .identifier-list--title-img {
    width: 100%;
    height: 2px;
    position: absolute;
    top: 0;
    left: 0;
  }
  .bs-wrapper {
    position: relative;
    width: 100%;
    height: calc(100% - 30px);
  }
}
</style>
