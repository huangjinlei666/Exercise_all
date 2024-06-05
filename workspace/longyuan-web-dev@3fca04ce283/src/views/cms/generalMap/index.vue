<template>
  <div id="general-map" class="cms-card">
    <div class="d2-mb-20">
      <div class="clearfix d2-mb-20">
        <div class="pull-left">
          <span class="cms-module-title">{{ $t('menu.routineAtlas') }}</span>
          <span class="d2-ml-10">
            (
            <span v-if="hierarchy && hierarchy.id && hierarchy.type === 'MACHINE'" class="color-primary">
              {{ $t('common.selectedMachine') + hierarchy.name }}
            </span>
            <span v-else class="color-error">{{ $t('common.noSelectedMachine') }}</span>
            )
          </span>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" @click="toAtlas">{{ $t('routineAtlas.diagnosis') }}</el-button>
          <!-- <el-button :disabled="!hierarchy.id" size="mini" type="primary" @click="getAnalysisReport">
            {{
              hierarchy.type
                ? hierarchy.type === 'MACHINE'
                  ? `${hierarchy.name}${$t('routineAtlas.analysisReport')}`
                  : `${hierarchy.name}${$t('routineAtlas.globalAnalysisReport')}`
                : `${$t('routineAtlas.analysisReport')}`
            }}
          </el-button> -->
          <el-button size="medium" type="primary" @click="getVibrationAnalysisReport">{{
            $t('routineAtlas.vibrationAnalysisReport')
          }}</el-button>
        </div>
      </div>
    </div>
    <div class="chart-area">
      <div class="chart-box">
        <div class="chartBox" v-if="hierarchy && hierarchy.id && hierarchy.type === 'MACHINE'">
          <GeneralChart />
        </div>
        <div v-else class="noData">
          <div class="imgBox">
            <img src="/images/img_noFan.png" alt="" />
            <p class="noMessage">{{ $t('common.noMachine') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import { extractWorkshopId, processConfig } from '@/util/commonService';
import JSZipUtils from 'jszip-utils';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import GeneralChart from '@/components/general/index.vue';

export default {
  name: 'GeneralMap',
  components: { GeneralChart },
  data() {
    return {
      timer: null,
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy', 'passList']),
    ...mapState('cms/atlas', ['refreshTime']),
  },
  mounted() {
    const { hierarchyId } = this.$route.params;
    if (hierarchyId) {
      this.$nextTick(() => {
        this.saveReverseHierarchy({ machineId: hierarchyId });
      });
    }
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer);
    this.timer = null;
  },
  watch: {
    hierarchy: {
      // 机组发生变化时，请求
      handler(value, oldValue) {
        this.timer && clearInterval(this.timer);
        this.timer = null;
        if (!value || !value.id) {
          return;
        }
        if (value.type !== 'MACHINE') {
          this.saveConfig([]);
          return;
        }
        this.initData(value);
        this.timer = setInterval(() => {
          this.initData(value);
        }, this.refreshTime * 1000);
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations('cms/general', ['saveConfig']),
    ...mapMutations('cms/pass', ['saveReverseHierarchy']),
    getAnalysisReport() {
      if (!this.hierarchy || !this.hierarchy.type) {
        return;
      }
      const flag = this.hierarchy.type === 'MACHINE';
      const params = {
        beginTime: dayjs().subtract(1, 'month').unix(),
        endTime: dayjs().unix(),
      };
      this.$set(params, flag ? 'machineId' : 'hierarchyId', this.hierarchy.id);
      this.$api.routineAtlas[flag ? 'getReport' : 'getReportSummary'](params)
        .then((res) => {
          if (!res) {
            return;
          }
          const reportAlarms = [];
          if (res && res.reportAlarms && res.reportAlarms.length > 0) {
            res.reportAlarms.forEach((i) => {
              const obj = {
                sensorName: i.sensorName || '',
                featureName: i.featureName || '',
                featureValue: i.featureValue || '',
                level: i.level || '',
                occurTime: i.occurTime || '',
                verifyStatus: i.verifyStatus
                  ? i.verifyStatus === 'UNVERIFIED'
                    ? this.$t('routineAtlas.unverified')
                    : this.$t('routineAtlas.verified')
                  : '',
                remark: i.remark || '',
              };
              reportAlarms.push(obj);
            });
          }
          const reportData = flag
            ? {
                alarmCount: res.alarmCount || 0,
                endTime: res.endTime || '',
                machineName: res.machineName || '',
                reportAlarms,
                startTime: res.startTime || '',
                title: res.title || '',
              }
            : {
                alarmCount: res.alarmCount || 0,
                faultRate: res.faultRate || '',
                hierarchyName: res.hierarchyName || '',
                title: res.title || '',
              };
          this.exportWord(
            flag,
            reportData,
            dayjs(params.beginTime * 1000).format('YYYY-MM-DD HH:mm:ss'),
            dayjs(params.endTime * 1000).format('YYYY-MM-DD HH:mm:ss')
          );
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    // 点击导出word
    exportWord(flag, reportData, startTime, endTime) {
      const that = this;
      const docData = { ...reportData, startTime, endTime };
      JSZipUtils.getBinaryContent(flag ? '/doc.docx' : '/docs.docx', (error, content) => {
        const zip = new PizZip(content);
        const doc = new Docxtemplater();
        doc.loadZip(zip);
        doc.setData(docData);
        try {
          doc.render();
        } catch (error1) {
          const e = {
            message: error1.message,
            name: error1.name,
            stack: error1.stack,
            properties: error1.properties,
          };
          throw error;
        }
        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        // 将目标文件对象保存为目标类型的文件，并命名
        FileSaver.saveAs(
          out,
          `${reportData[flag ? 'machineName' : 'hierarchyName']}${that.$t('routineAtlas.analysisReport')}.docx`
        );
      });
    },
    getVibrationAnalysisReport() {
      this.$api.routineAtlas
        .getVibrationAnalysisReport()
        .then((res) => {
          const name = res.headers['content-disposition'].split('filename=')[1];
          const filename = window.decodeURIComponent(name);
          const blob = new Blob([res.data], { type: res.data.type });
          FileSaver.saveAs(blob, filename);
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    initData(value) {
      if (!value || !value.id || value.type !== 'MACHINE') {
        this.saveConfig([]);
        return;
      }
      this.initFetch(value.id);
    },
    initFetch(machineId) {
      const workshopId = extractWorkshopId(this.passList, machineId);
      // 全部传感器
      // 筛选左侧震动传感器, 'TrendDoubling', 'Waveform', 'Spectrum', 'CepstrumSpectrum', 'Envelope', 'Waterfall'
      // const params1 = { hierarchyId: machineId, workshopId, deviceType: 'vibration' };
      // 筛选转速传感器, 'Spectrum', 'Envelope', 'Waterfall'
      // const params2 = { hierarchyId: machineId, workshopId, deviceType: 'speed' };

      let sensorList = [];
      let configParamArr = [];

      Promise.all([
        this.$api.projectSet.getSensorUnderHierarchy({ hierarchyId: machineId, workshopId }),
        this.$api.projectSet.getGeneralMapConfig(machineId, workshopId),
      ])
        .then(([sensors, generals]) => {
          if (!sensors || sensors.length === 0) {
            sensorList = [];
          } else {
            sensorList = sensors;
          }
          if (!generals || generals.length === 0) {
            configParamArr = [];
          } else {
            configParamArr = generals;
          }
        })
        .catch((err) => {
          sensorList = [];
          configParamArr = [];
        })
        .finally(() => {
          this.processConfigInfo(configParamArr, sensorList);
        });
    },
    processConfigInfo(configParamArr, sensorArr) {
      const config = processConfig(configParamArr, sensorArr);
      this.saveConfig(config);
    },
    toAtlas() {
      this.$router.push({
        name: 'routineAtlas',
        params: {
          hierarchyId: this.hierarchy && this.hierarchy.id,
        },
      });
    },
  },
};
</script>
<style lang="less">
#general-map {
  min-width: 1250px;
  min-height: 869px;
  position: relative;
  margin-right: 20px;
  .el-form {
    .el-form-item {
      margin-bottom: 10px;
      margin-right: 5px;
    }
  }
  .chart-area {
    position: relative;
    height: 781px;
    .chart-box {
      position: relative;
      height: 100%;
      .chartBox {
        height: 100%;
      }
    }
  }
  .noData {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url(/images/bg2.png);
    .imgBox {
      text-align: center;
      padding-top: 10%;
      .noMessage {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }
}
</style>
