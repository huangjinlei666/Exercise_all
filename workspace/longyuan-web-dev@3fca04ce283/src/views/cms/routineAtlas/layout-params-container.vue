<template>
  <div class="layout-params-container">
    <img class="title-img" :src="`${$baseUrl}/images/screen/bg-module.png`" alt />
    <div class="variate-select-container">
      <AtlasTitle :title="$t('routineAtlas.variateSelect')"></AtlasTitle>
      <el-form :model="ruleForm" :rules="rules" size="mini" ref="ruleForm">
        <el-form-item prop="featureIdentifier">
          <template v-if="topIdentifierArr.length > 0">
            <div style="font-size: 0; margin-bottom: 5px">
              <template v-for="(top, index) in topIdentifierArr">
                <el-tooltip :content="top.label" :key="top.identifier" effect="light">
                  <AtlasButton
                    :style="{ width: index === 1 ? '32%' : '30%', marginLeft: index === 0 ? 0 : '10px' }"
                    :isSelect="ruleForm.featureIdentifier === top.identifier"
                    @click="featureIdentifierChange(top.identifier)"
                  >
                    {{ top.label }}
                  </AtlasButton>
                </el-tooltip>
              </template>
            </div>
          </template>
          <el-select
            style="width: 100%"
            :value="selectDisplayIdentifier"
            filterable
            @change="featureIdentifierChange"
            :placeholder="$t('alarmSet.placeholder.variates')"
            @visible-change="visibleChange"
          >
            <template v-for="item in featureIdentifierArr">
              <el-option :key="item.identifier" :label="item.name" :value="item.identifier"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item prop="timeRange">
          <el-date-picker
            style="width: 100%"
            class="date-range-wrapper"
            popper-class="date-range-wrapper"
            v-model="ruleForm.timeRange"
            type="datetimerange"
            :picker-options="pickerOptions"
            :range-separator="$t('common.to')"
            :start-placeholder="$t('common.beginDate')"
            :end-placeholder="$t('common.endDate')"
            align="right"
            :editable="false"
            @change="handleDateChange"
            v-show="ruleForm.featureIdentifier !== 'longOriginalData' || this.chartType === 'Waterfall'"
          ></el-date-picker>
          <el-date-picker
            v-model="timeRangeLong"
            type="date"
            :picker-options="pickerOptionsLong"
            :placeholder="$t('common.selectAt')"
            v-show="ruleForm.featureIdentifier === 'longOriginalData' && this.chartType !== 'Waterfall'"
            @change="timeChage"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item
          v-if="ruleForm.featureIdentifier === 'longOriginalData' && this.chartType !== 'Waterfall'"
          prop="longOriginalDate"
        >
          <el-select
            class="mt-5"
            style="width: 100%"
            v-model="ruleForm.longOriginalDate"
            clearable
            :placeholder="$t('routineAtlas.placeholder.timeRange')"
          >
            <template v-for="(item, index) in longWaveform">
              <el-option :key="index" :label="item.label" :value="item.createdAt"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <AtlasButton :isSelect="true" style="width: 100%" @click="configData()">{{ $t('common.query') }}</AtlasButton>
        </el-form-item>
      </el-form>
    </div>
    <div class="frequency-band-container">
      <AtlasTitle :title="$t('routineAtlas.frequencyBand')"></AtlasTitle>
      <div class="mb-20">
        <AtlasButton
          v-for="fre in frequencyBandList"
          :key="fre.id"
          :isSelect="frequencyBand === fre.value"
          style="width: 100%; margin-bottom: 10px; text-align: left"
          @click="handleFrequencyBandChange(fre.value)"
        >
          {{ fre.value + ' Hz' }}
        </AtlasButton>
      </div>
    </div>
    <div class="data-compare-container" v-show="ruleForm.featureIdentifier !== 'longOriginalData'">
      <AtlasTitle :title="$t('routineAtlas.dataCompare')"></AtlasTitle>
      <AtlasCompareTags />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { getBrowserType, datePickerOptions } from '@/util/commonService';
import cloneDeep from 'lodash/cloneDeep';
import AtlasTitle from './components/atlas-title.vue';
import AtlasButton from './components/atlas-button.vue';
import AtlasCompareTags from './components/atlas-compare-tags.vue';

export default {
  name: 'LayoutParamsContainer',
  components: { AtlasTitle, AtlasButton, AtlasCompareTags },
  props: {
    chartType: {
      type: String,
      default: 'Trend',
    },
    sensorList: {
      type: Array,
      default: () => [],
    },
    // 转速传感器列表，龙源只有1个
    orderSensorList: {
      type: Array,
      default: () => [],
    },
    // 振动传感器列表，瀑布图需要
    vibrationSensorList: {
      type: Array,
      default: () => [],
    },
    machineId: {
      type: String,
      default: '',
    },
  },
  data() {
    const timeValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('routineAtlas.placeholder.timeRange')));
      }
      if (this.chartTypeVuex === 'Waterfall') {
        const [startAt, endAt] = value;
        const difference = endAt.getTime() - startAt.getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (difference > sevenDays) {
          return callback(new Error(this.$t('routineAtlas.invalid.noMore7Days')));
        }
      }
      callback();
    };
    return {
      topIdentifierArr: [],
      featureIdentifierArr: [],
      ruleForm: {
        featureIdentifier: '', // 必填选项：变量类型id
        timeRange: '', // 选填选项：时间范围
        longOriginalDate: '',
      },
      timeRangeLong: new Date().getTime(), // 长波形时间选择
      rules: {
        featureIdentifier: [{ required: true, message: this.$t('alarmSet.placeholder.variates'), trigger: 'change' }],
        timeRange: [
          {
            required: true,
            validator: timeValidator,
            message: this.$t('routineAtlas.placeholder.timeRange'),
            trigger: 'change',
          },
        ],
        longOriginalDate: [
          {
            required: true,
            message: this.$t('routineAtlas.invalid.selectRange'),
            trigger: 'change',
          },
        ],
      },
      min: '', // 选中时间段后，靠前的时间
      pickerOptions: datePickerOptions(this),
      pickerOptionsLong: {
        onPick: ({ maxDate, minDate }) => {
          if (!maxDate && minDate) {
            this.min = minDate && minDate.getTime();
          }
          if (maxDate && minDate) {
            // this.min = '';
          }
        },
        disabledDate: (date) => {
          const twoMonth = 60 * 24 * 60 * 60 * 1000; // 设定两个月  60天 * 24小时 * 60分钟 * 60秒 * 1000 = 3天的时间戳
          // 如果开始日期已选中，则返回需求中需要禁用的时间
          if (this.min !== '') {
            // 大于选中时间后60天 || 小于选中时间后60天 || 大于今天 的所有日期都禁用
            return (
              date.getTime() > this.min + twoMonth ||
              date.getTime() < this.min - twoMonth ||
              date.getTime() > Date.now()
            );
          }
          // 什么都没选，只禁用大于今天的所有日期
          return date.getTime() > Date.now();
        },
      }, // 长波形
      frequencyBandList: [],
      longWaveform: [], // 长波形数据
      isTimeRangeLongChanged: false,
    };
  },
  computed: {
    ...mapState('cms/pass', ['passSensor', 'hierarchy']),
    ...mapState('cms/chart', ['frequencyBand']),
    ...mapState('cms/screen', ['chartTypeVuex']),
    selectDisplayIdentifier() {
      if (
        this.featureIdentifierArr.length > 0 &&
        this.featureIdentifierArr.find((i) => i.identifier === this.ruleForm.featureIdentifier)
      ) {
        return this.ruleForm.featureIdentifier;
      }
      return '';
    },
    displaySensorList() {
      if (this.chartType === 'Trend') {
        return this.sensorList;
      }
      return this.vibrationSensorList;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.handleDefaultValue(this.displaySensorList, this.passSensor.id);
    });
  },
  watch: {
    displaySensorList: {
      handler(value) {
        this.$emit('paramsChange', { clear: true });
        this.resetFields();
        this.$nextTick(() => {
          this.handleDefaultValue(value, this.passSensor);
          this.$refs.ruleForm?.clearValidate();
        });
      },
    },
    passSensor: {
      handler(v) {
        this.$nextTick(() => {
          this.handleDefaultValue(this.displaySensorList, v);
          this.$refs.ruleForm?.clearValidate();
        });
        // 查询频段列表
        this.fetchFrequencyBandList(v.id);
      },
    },
  },
  methods: {
    ...mapMutations('cms/chart', ['saveFrequencyBand']),
    fetchFrequencyBandList(sensorId) {
      if (!sensorId) return;
      this.$api.routineAtlas
        .getFrequencyBand(sensorId)
        .then((res) => {
          if (!res || res.length === 0) {
            this.frequencyBandList = [];
            this.saveFrequencyBand('');
            return;
          }
          this.frequencyBandList = res.map((item) => {
            item.value = `${item.lower}-${item.upper}`;
            return item;
          });
          if (this.frequencyBand) {
            const fre = this.frequencyBandList.find((f) => f.value === this.frequencyBand);
            if (!fre) {
              this.saveFrequencyBand('');
            }
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleDateChange(value) {
      this.timeRangeLong = value[1].getTime();
    },
    visibleChange(isVisible) {
      const isEdge = getBrowserType().type;
      if (isEdge === 'Edge' && !isVisible) {
        document.querySelectorAll('body > .el-select-dropdown.el-popper').forEach((it) => it.remove());
      }
    },
    // 获取长波形数据下拉
    getLongOriginalData() {
      const selDate = this.getNowTime(new Date(this.timeRangeLong));
      const selDateBefore3 = new Date(selDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      this.ruleForm.timeRange = [selDateBefore3, selDate];
      const param = {
        identifier: 'longOriginalData',
        // 选择天开始时间
        startAt: new Date(this.timeRangeLong).setHours(0, 0, 0, 0),
        // 选择天结束时间
        endAt: new Date(this.timeRangeLong).setHours(23, 59, 59, 999),
        pageSize: '10',
      };
      this.$api.routineAtlas
        .getLongOriginalDate(this.passSensor.id, param)
        .then((res) => {
          // this.ruleForm.longOriginalDate = '';
          if (res && res.length) {
            this.longWaveform = cloneDeep(res);
            const date = res.find((item) => item.createdAt === this.ruleForm.longOriginalDate);
            if (!date) {
              this.$nextTick(() => {
                this.ruleForm.longOriginalDate = this.longWaveform[0].createdAt;
                if (!this.isTimeRangeLongChanged) {
                  this.isTimeRangeLongChanged = false;
                  this.$nextTick(() => {
                    this.configData();
                    // this.$emit('paramsChange', { clear: true });
                  });
                }
              });
            }
            this.longWaveform.forEach((item, index) => {
              item.label = this.$dateFormat.formatLocalDateTime(item.createdAt);
            });
            return;
          }
          this.ruleForm.longOriginalDate = '';
          this.longWaveform = [];
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    featureIdentifierChange(identifier) {
      this.ruleForm.featureIdentifier = identifier;
      if (identifier === 'longOriginalData') {
        this.getLongOriginalData();
      }
    },
    resetFields() {},
    // 长波形时间选择
    timeChage(val) {
      this.timeRangeLong = val.getTime();
      this.isTimeRangeLongChanged = true;
      this.getLongOriginalData();
    },
    handleDefaultValue(list, passSensor) {
      if (!list || list.length === 0 || !passSensor.id) {
        this.resetFields();
        this.topIdentifierArr = [];
        this.featureIdentifierArr = [];
        return;
      }

      // 从传感器列表中筛选出当前点击的传感器，取出这个传感器的特征值列表，转速传感器需要过滤（只要展示转速值）
      const identifierArr = this.findFeatureIdentifier(list, passSensor);
      const [topIdentifierArr, featureIdentifierArr] = this.separateIdentifier(identifierArr);
      this.topIdentifierArr = topIdentifierArr;
      this.featureIdentifierArr = featureIdentifierArr;
      // 默认设置近三天的历史时间
      if (!this.ruleForm.timeRange) {
        const end = new Date();
        const start = new Date();
        if (this.chartType === 'Waterfall') {
          start.setTime(start.getTime() - 3600 * 1000 * 2);
        } else {
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
        }
        this.ruleForm.timeRange = [start, end];
      }
      // 设置 featureIdentifier 默认值
      this.$nextTick(() => {
        const identifier = this.topIdentifierArr
          .concat(this.featureIdentifierArr)
          .find((t) => t.identifier === this.ruleForm.featureIdentifier);
        if (identifier) {
          this.configData();
          return;
        }
        if (this.topIdentifierArr.length > 0) {
          this.ruleForm.featureIdentifier = this.topIdentifierArr[0].identifier;
          this.configData();
          return;
        }
        if (this.featureIdentifierArr.length > 0) {
          this.ruleForm.featureIdentifier = this.featureIdentifierArr[0].identifier;
          this.configData();
          return;
        }
        this.configData();
      });
    },
    findFeatureIdentifier(arr, passSensor) {
      let array = [];
      arr.every((ele) => {
        if (ele.id === passSensor.id) {
          array = ele.variates;
          return false;
        }
        return true;
      });
      // 判断是不是转速传感器
      let isSpeed = false;
      let info;
      try {
        info = JSON.parse(passSensor.additionalInfo);
      } catch (error) {
        info = {};
      }
      if (info && info.deviceType && info.deviceType[0]) {
        if (info.deviceType[0] === 'speed') {
          isSpeed = true;
        }
      }
      // 如果点击的是转速传感器，特征值只要转速值 "RotatingVelocity"
      if (isSpeed) {
        return array.filter((item) => item.identifier.toLowerCase() === 'rotatingvelocity');
      }
      return array;
    },
    separateIdentifier(arr) {
      const topIdentifierList = ['accelerationeffective', 'accelerationpeak'];
      const topIdentifierNameList = ['有效值', '峰值'];
      const topIdentifierArr = [];
      const featureIdentifierArr = [];
      const hasLongWave =
        arr.length > 0 &&
        this.passSensor.additionalInfo &&
        JSON.parse(this.passSensor.additionalInfo).deviceType &&
        JSON.parse(this.passSensor.additionalInfo).deviceType[0] === 'vibration';
      arr.forEach((item) => {
        const idx = topIdentifierList.indexOf(item.identifier.toLowerCase());
        if (idx !== -1) {
          topIdentifierArr.push({ ...item, label: topIdentifierNameList[idx] });
        } else if (!(hasLongWave && item.identifier === 'longOriginalData')) {
          featureIdentifierArr.push(item);
        }
      });
      if (hasLongWave) {
        // 新增长波形数据
        topIdentifierArr.push({
          alarmLevel: 'OK',
          identifier: 'longOriginalData',
          metadata: { hasOriginalData: true, unit: '' },
          name: '长波形',
          value: '[]',
          label: '长波形',
        });
        featureIdentifierArr.forEach((v, i) => {
          if (v.identifier === 'longOriginalData') {
            featureIdentifierArr.slice(i, 1);
          }
        });
      }
      return [topIdentifierArr, featureIdentifierArr];
    },
    handleFrequencyBandChange(fre) {
      this.saveFrequencyBand(fre);
    },
    configData() {
      this.isTimeRangeLongChanged = false;
      console.log('configData');
      if (this.ruleForm.featureIdentifier === 'longOriginalData') {
        this.getLongOriginalData();
      }
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        const sensor = this.displaySensorList.find((i) => i.id === this.passSensor.id);
        let identifier = {};
        const topIdentifier = this.topIdentifierArr.find((i) => i.identifier === this.ruleForm.featureIdentifier);
        const selectIdentifier = this.featureIdentifierArr.find(
          (i) => i.identifier === this.ruleForm.featureIdentifier
        );
        if (topIdentifier) {
          identifier = topIdentifier;
        } else if (selectIdentifier) {
          identifier = selectIdentifier;
        }
        let velocitySensorId = '';
        if (this.orderSensorList && this.orderSensorList.length > 0) {
          velocitySensorId = this.orderSensorList[0].id;
        }
        const params = {
          machineId: this.machineId, // 机组id
          sensorId: sensor && sensor.id, // 传感器id
          sensorName: sensor && sensor.name, // 传感器名称
          identifier: this.ruleForm.featureIdentifier, // 变量类型标识符
          identifierName: identifier && identifier.name, // 变量类型名称
          unit: identifier && identifier.metadata && identifier.metadata.unit, // 变量类型单位
          xAxisUnit: 'Hz', // 横坐标单位，默认hz，可切换为order
          extensionType: 'accelerated', // 查询的原始数据类型，默认加速度，可切换为速度
          velocitySensorId, // 倍频时-转速传感器id
          identifierOriginalDataType:
            this.ruleForm.featureIdentifier === 'longOriginalData' ? 'longOriginalData' : 'originalData',
        };
        if (this.ruleForm.timeRange && this.ruleForm.timeRange.length > 0) {
          params.startAt = this.ruleForm.timeRange[0].getTime();
          params.endAt = this.ruleForm.timeRange[1].getTime();
        }
        if (this.ruleForm.featureIdentifier === 'longOriginalData' && this.chartType !== 'Waterfall') {
          if (this.timeRangeLong) {
            params.startAt = this.ruleForm.longOriginalDate - 0;
            params.endAt = this.ruleForm.longOriginalDate - 0 + 1;
          }
        }
        this.$emit('paramsChange', params);
      });
    },
    getNowTime(dt) {
      const y = dt.getFullYear();
      const m = dt.getMonth();
      const d = dt.getDate();
      const now = new Date();
      const h = now.getHours();
      const M = now.getMinutes();
      const s = now.getSeconds();
      return new Date(y, m, d, h, M, s);
    },
  },
};
</script>

<style lang="less" scoped>
.layout-params-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-sizing: border-box;
  font-size: 14px;
  background-color: #07172d;
  padding: 10px;
  .title-img {
    width: 100%;
    height: 2px;
    position: absolute;
    top: 0;
    left: 0;
  }
  .title {
    height: 20px;
    margin-bottom: 10px;
    .title-text {
      font-size: 16px;
      line-height: 20px;
      font-weight: bold;
      text-align: left;
      vertical-align: top;
      color: rgba(255, 255, 255, 0.85);
    }
  }
  .el-input {
    width: 100% !important;
    /deep/.el-input__inner {
      background-color: #0d334b;
      border-color: rgba(71, 218, 255, 0.2);
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
<style lang="less">
.el-picker-panel {
  z-index: 10000 !important;
}
</style>
