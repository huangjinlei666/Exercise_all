<template>
  <div id="fan-report-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="center-content">
        <PassTree class="select-tree" @sensorList="sensorListChild" />
        <div class="atlas">
          <p class="title">{{ $t('routineAtlas.selectMap') }}</p>
          <MapModal
            @waveformData="waveformData"
            @spectrogramData="spectrogramData"
            @envelopeData="envelopeData"
            @cepstrumData="cepstrumData"
          />
        </div>
      </div>
      <p class="tip">{{ $t('routineAtlas.createTip') }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import modalMixin from '@/plugins/modal/mixin';
import PassTree from './passTree.vue';
import MapModal from './mapModal.vue';

export default {
  mixins: [modalMixin],
  name: 'FanReportModal',
  components: {
    PassTree,
    MapModal,
  },
  data() {
    return {
      loading: false,
      params: {
        machineId: '',
        sensorIdList: [],
        atlasItemList: [],
      },
      isSelectedMap: false,
    };
  },
  mounted() {
    const params = this.options.winData;
    this.params.machineId = this.hierarchy.id;
  },
  computed: {
    ...mapState('cms/pass', ['passList', 'hierarchy']),
    ...mapState('cms/chart', ['sensorList']),
  },
  methods: {
    submitForm() {
      // 条件校验开始
      if (this.params.sensorIdList.length === 0) {
        return this.$msg.error(this.$t('routineAtlas.downloadReport.selectOnce'));
      }
      if (this.params.atlasItemList.length === 0 && !this.isSelectedMap) {
        return this.$msg.error(this.$t('routineAtlas.downloadReport.selectOnceMap'));
      }
      if (this.isSelectedMap) {
        return this.$msg.error(this.$t('routineAtlas.downloadReport.selectOnceExtensionAndType'));
      }
      if (this.params.atlasItemList.length) {
        this.params.atlasItemList.map((item) => {
          if (item.extensionTypeList.length === 0) {
            item.flag = false;
            return this.$msg.error(this.$t('routineAtlas.downloadReport.selectOnceExtension'));
          }
          if ((item.atlasType === '2' || item.atlasType === '3') && item.typeList.length === 0) {
            item.flag = false;
            return this.$msg.error(this.$t('routineAtlas.downloadReport.selectOnceType'));
          }
          item.flag = true;
          return item;
        });
      }
      const result = this.params.atlasItemList.every((item) => item.flag === true);
      if (!result) return;
      this.params.atlasItemList.map((item) => delete item.flag);
      // 条件校验结束

      this.$api.projectSet
        .createFanReprot(this.params)
        .then((res) => {
          this.$msg.success(this.$t('routineAtlas.creatReportSuccess'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    sensorListChild(val) {
      this.params.sensorIdList = val.slice(0);
    },
    // 判断图谱数组里面是否存在已选图谱
    isHasAtlas(data) {
      const arr = this.params.atlasItemList;
      if (arr.length === 0) return false;
      return arr.some((item) => item.atlasType === data);
    },
    // 储存参数
    saveItemData(param, type) {
      this.isSelectedMap = false;
      // 创建一个基础对象
      const obj = {
        atlasType: '',
        extensionTypeList: [],
        typeList: [],
      };
      // 设置对象图谱数据
      obj.atlasType = type;
      if (param.extensionTypeList && param.extensionTypeList.length > 0) {
        obj.extensionTypeList = param.extensionTypeList.slice(0);
      }
      if (param.typeList && param.typeList.length > 0) obj.typeList = param.typeList.slice(0);
      // 选中的项如果已经勾选则把数据合并，否则为新图谱，添加为一组新数据
      const result = this.isHasAtlas(type);
      if (!result) {
        this.params.atlasItemList.push(obj);
      } else {
        const ind = this.params.atlasItemList.findIndex((item) => item.atlasType === type);
        this.params.atlasItemList[ind].extensionTypeList = param.extensionTypeList.slice(0);
        this.params.atlasItemList[ind].typeList = param.typeList.slice(0);
      }
    },
    waveformData(val) {
      if (val.waveformCheck && val.extensionTypeList.length === 0) {
        this.isSelectedMap = true;
        return;
      }
      this.saveItemData(val, '1');
    },
    spectrogramData(val) {
      if (val.spectrogramCheck && val.extensionTypeList.length === 0 && val.typeList.length === 0) {
        this.isSelectedMap = true;
        return;
      }
      this.saveItemData(val, '2');
    },
    envelopeData(val) {
      if (val.envelopeCheck && val.extensionTypeList.length === 0 && val.typeList.length === 0) {
        this.isSelectedMap = true;
        return;
      }
      this.saveItemData(val, '3');
    },
    cepstrumData(val) {
      if (val.cepstrumCheck && val.extensionTypeList.length === 0) {
        this.isSelectedMap = true;
        return;
      }
      this.saveItemData(val, '4');
    },
  },
};
</script>
<style lang="less">
#fan-report-modal {
  .el-dialog__wrapper {
    .el-dialog__header {
      border-bottom: 1px solid #ebebeb;
    }
    .el-dialog__body {
      height: 300px;
      .center-content {
        display: flex;
        width: 100%;
        height: 100%;
        .atlas {
          width: 65%;
          margin-left: 5%;
          .title {
            font-size: 16px;
            font-weight: bold;
            line-height: 32px;
          }
        }
        .select-tree {
          height: calc(100% - 20px) !important;
          flex: 1;
        }
        .d2-container-full-bs {
          border: 1px solid #ebebeb !important;
        }
      }
      .tip {
        margin-top: 5px;
        color: red;
      }
    }
    .el-dialog__footer {
      padding: 20px;
      border-top: 1px solid #ebebeb;
    }
  }
}
</style>
