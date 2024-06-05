<template>
  <div id="pass-add-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="loading"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <!-- 集团 -->
        <span v-if="type === 'PROJECT'">
          <el-form-item :label="$t('pass.projectName')" prop="projectName">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.projectName"
              :placeholder="$t('pass.placeholder.projectName')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.projectDesc')" prop="description">
            <el-input
              type="textarea"
              :maxlength="32"
              class="width-300 cms-textarea"
              v-model.trim="ruleForm.description"
              :placeholder="$t('pass.placeholder.projectDesc')"
            ></el-input>
          </el-form-item>
        </span>
        <!-- 区域公司 -->
        <span v-if="type === 'FACTORY'">
          <el-form-item :label="$t('pass.factoryName')" prop="factoryName">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.factoryName"
              :placeholder="$t('pass.placeholder.factoryName')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.regionCode')" prop="regionCode">
            <el-cascader
              class="width-300"
              :options="regionOptions"
              v-model="ruleForm.regionCode"
              :placeholder="$t('pass.placeholder.regionCode')"
            ></el-cascader>
          </el-form-item>
          <el-form-item :label="$t('pass.location')" prop="location">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.location"
              :placeholder="$t('pass.placeholder.location')"
            ></el-input>
          </el-form-item>
        </span>
        <!-- 风场 -->
        <span v-if="type === 'WORKSHOP'">
          <el-form-item :label="$t('pass.workshopName')" prop="workshopName">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.workshopName"
              :placeholder="$t('pass.placeholder.workshopName')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.address')" prop="address">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.address"
              :placeholder="$t('pass.placeholder.address')"
            ></el-input>
          </el-form-item>
        </span>
        <!-- 风机 -->
        <span v-if="type === 'MACHINE'">
          <el-form-item :label="$t('pass.workGroupName')" prop="workGroupName">
            <el-select
              v-model="ruleForm.workGroupName"
              filterable
              class="width-300"
              @blur.native.capture="searchBlur"
              :placeholder="$t('pass.placeholder.workGroupName')"
            >
              <el-option v-for="item in fanList" :key="item.id" :label="item.machineName" :value="item.machineName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('pass.workGroupType')" prop="workGroupType">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.workGroupType"
              :placeholder="$t('pass.placeholder.workGroupType')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.workGroupModel')" prop="workGroupModel">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.workGroupModel"
              :placeholder="$t('pass.placeholder.workGroupModel')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.criticalSpeed1')" prop="criticalSpeed1">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.criticalSpeed1"
              :placeholder="$t('pass.placeholder.criticalSpeed1')"
            >
              <span slot="append">rpm</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.criticalSpeed2')" prop="criticalSpeed2">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.criticalSpeed2"
              :placeholder="$t('pass.placeholder.criticalSpeed2')"
            >
              <span slot="append">rpm</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.criticalSpeed')" prop="criticalSpeed">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.criticalSpeed"
              :placeholder="$t('pass.placeholder.criticalSpeed')"
            >
              <span slot="append">rpm</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.modelName')" prop="modelName">
            <el-radio-group v-model="ruleForm.modelName" :disabled="!!deviceNumber" @change="changeModelName">
              <el-radio label="direct">{{ $t('pass.directDrive') }}</el-radio>
              <el-radio label="nonDirect">{{ $t('pass.nonDirectDrive') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('pass.isReCalculateRP')" prop="isReCalculateRP">
            <el-radio-group v-model="ruleForm.isReCalculateRP">
              <el-radio :label="true">{{ $t('common.yes') }}</el-radio>
              <el-radio :label="false">{{ $t('common.no') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="this.oper === 'edit'" :label="$t('equipmentMng.speedRatio')" prop="speedRatio">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.speedRatio"
              :placeholder="$t('equipmentMng.placeholder.speedRatio')"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="this.oper === 'edit'" :label="$t('equipmentMng.speedPoint')" prop="speedMeasuringPoint">
            <el-select
              class="width-300 d2-mr-10"
              v-model="ruleForm.speedMeasuringPoint"
              :placeholder="$t('equipmentMng.placeholder.speedPoint')"
              size="medium"
            >
              <el-option
                v-for="item in speedMeasuringPointList"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictName"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="this.oper === 'edit'" :label="$t('equipmentMng.pulsesPerweek')" prop="pulseOfWeek">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.pulseOfWeek"
              :placeholder="$t('equipmentMng.placeholder.pulsesPerweek')"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="this.oper === 'edit'" :label="$t('equipmentMng.masterIp')" prop="masterIp">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.masterIp"
              :placeholder="$t('equipmentMng.placeholder.masterIp')"
            ></el-input>
          </el-form-item>
        </span>
        <!-- 经纬度：风场和风机 -->
        <span v-if="['WORKSHOP', 'MACHINE'].includes(type)">
          <el-form-item :label="$t('pass.longitude')" prop="longitude">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.longitude"
              :placeholder="$t('pass.placeholder.longitude')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('pass.latitude')" prop="latitude">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.latitude"
              :placeholder="$t('pass.placeholder.latitude')"
            ></el-input>
          </el-form-item>
        </span>
        <span v-if="type === 'MACHINE'">
          <el-form-item :label="$t('common.description')" prop="memo">
            <el-input class="width-300" type="textarea" v-model="ruleForm.memo"></el-input>
          </el-form-item>
        </span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disables="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import { regionData } from 'element-china-area-data';
import modalMixin from '@/plugins/modal/mixin';
import { NAME_32_REG, LONGITUDE_REG, LATITUDE_REG, FLOAT_REG } from '@/util/regExpService';
import { projectArr } from '@/util/selectTypes';

export default {
  mixins: [modalMixin],
  name: 'passAddModal',
  data() {
    const projectNameValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.projectName')));
      }
      callback();
    };
    const descriptionValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.description')));
      }
      callback();
    };
    //
    const factoryNameValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.factoryName')));
      }
      callback();
    };
    const locationValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.location')));
      }
      callback();
    };
    const longitudeValidator = (rule, value, callback) => {
      if (!value || !LONGITUDE_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.longitude')));
      }
      callback();
    };
    const laitudeValidator = (rule, value, callback) => {
      if (!value || !LATITUDE_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.latitude')));
      }
      callback();
    };
    //
    const workshopNameValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.workshopName')));
      }
      callback();
    };
    const addressValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.address')));
      }
      callback();
    };
    //
    const workGroupNameValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.workGroupName')));
      }
      callback();
    };
    const workGroupTypeValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.workGroupType')));
      }
      callback();
    };
    const workGroupModelValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.workGroupModel')));
      }
      callback();
    };
    const criticalSpeedValidator = (rule, value, callback) => {
      if (!value) {
        return callback();
      }
      if (!FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('pass.invalid.criticalSpeed')));
      }
      if (value < 0 || value > 9999) {
        return callback(new Error(this.$t('pass.invalid.criticalSpeed')));
      }
      callback();
    };

    return {
      loading: false,
      regionOptions: regionData,
      projectArr,
      type: '',
      id: '',
      oper: '',
      deviceNumber: '',
      speedMeasuringPointList: [],
      ruleForm: {
        // PROJECT
        projectName: '',
        description: '',
        // FACTORY
        factoryName: '',
        regionCode: '',
        location: '',
        // WORKSHOP
        workshopName: '',
        address: '',
        // MACHINE
        workGroupName: '',
        workGroupType: '',
        workGroupModel: '',
        criticalSpeed1: '',
        criticalSpeed2: '',
        criticalSpeed: '',
        modelName: 'nonDirect',
        isReCalculateRP: true,
        // WORKSHOP, MACHINE, 必填
        longitude: '',
        latitude: '',
        speedRatio: '',
        speedMeasuringPoint: '',
        pulseOfWeek: '',
        masterIp: '',
        memo: '', // 备注
      },
      rules: {
        //
        projectName: [{ required: true, validator: projectNameValidator, trigger: 'change' }],
        description: [{ required: false, validator: descriptionValidator, trigger: 'change' }],
        //
        factoryName: [{ required: true, validator: factoryNameValidator, trigger: 'change' }],
        regionCode: [{ required: true, message: this.$t('pass.placeholder.regionCode'), trigger: 'change' }],
        location: [{ required: false, validator: locationValidator, trigger: 'change' }],
        //
        workshopName: [{ required: true, validator: workshopNameValidator, trigger: 'change' }],
        address: [{ required: false, validator: addressValidator, trigger: 'change' }],
        //
        workGroupName: [{ required: true, validator: workGroupNameValidator, trigger: 'change' }],
        workGroupType: [{ required: false, validator: workGroupTypeValidator, trigger: 'change' }],
        workGroupModel: [{ required: false, validator: workGroupModelValidator, trigger: 'change' }],
        criticalSpeed1: [{ required: false, validator: criticalSpeedValidator, trigger: 'change' }],
        criticalSpeed2: [{ required: false, validator: criticalSpeedValidator, trigger: 'change' }],
        criticalSpeed: [{ required: false, validator: criticalSpeedValidator, trigger: 'change' }],
        modelName: [{ required: true, message: this.$t('pass.placeholder.modelName'), trigger: 'change' }],
        //
        longitude: [{ required: true, validator: longitudeValidator, trigger: 'change' }],
        latitude: [{ required: true, validator: laitudeValidator, trigger: 'change' }],
        speedMeasuringPoint: [
          { required: true, message: this.$t('equipmentMng.placeholder.speedPoint'), trigger: 'blur' },
        ],
        speedRatio: [{ required: true, message: this.$t('equipmentMng.placeholder.speedRatio'), trigger: 'blur' }],
        pulseOfWeek: [{ required: true, message: this.$t('equipmentMng.placeholder.pulsesPerweek'), trigger: 'blur' }],
        masterIp: [{ required: true, message: this.$t('equipmentMng.placeholder.masterIp'), trigger: 'blur' }],
        memo: [{ required: false }],
      },
      fanList: [],
    };
  },
  mounted() {
    const { type, id, oper, pass, hierarchy, metadata } = this.options.winData;
    console.log(pass);
    this.type = type;
    this.id = id;
    this.oper = oper;
    if (this.oper === 'edit') {
      if (metadata) {
        this.ruleForm.speedRatio = metadata.speedRatio;
        this.ruleForm.speedMeasuringPoint = metadata.speedMeasuringPoint;
        this.ruleForm.pulseOfWeek = metadata.pulseOfWeek;
        this.ruleForm.masterIp = metadata.masterIp;
        this.ruleForm.isReCalculateRP = metadata.isReCalculateRP !== false;
      }
      this.deviceNumber = pass.deviceNumber;
      this.processEditData(this.ruleForm, pass);
    }
    this.getUnboundFanList(this.id);
    this.getPointList(this.ruleForm.modelName);
  },
  methods: {
    processEditData(ruleForm, pass) {
      const type = this.type;
      switch (type) {
        case 'PROJECT':
          ruleForm.projectName = pass.name;
          ruleForm.description = pass.additionalInfo && pass.additionalInfo.description;
          break;
        case 'FACTORY':
          ruleForm.factoryName = pass.name;
          ruleForm.location = pass.additionalInfo && pass.additionalInfo.location;
          ruleForm.regionCode = pass.additionalInfo && pass.additionalInfo.regionCode;
          break;
        case 'WORKSHOP':
          ruleForm.workshopName = pass.name;
          ruleForm.address = pass.additionalInfo && pass.additionalInfo.address;
          ruleForm.longitude = pass.additionalInfo && pass.additionalInfo.longitude;
          ruleForm.latitude = pass.additionalInfo && pass.additionalInfo.latitude;
          break;
        case 'MACHINE':
          ruleForm.workGroupName = pass.name;
          ruleForm.workGroupType = pass.additionalInfo && pass.additionalInfo.workGroupType;
          ruleForm.workGroupModel = pass.additionalInfo && pass.additionalInfo.workGroupModel;
          ruleForm.criticalSpeed1 = pass.additionalInfo && pass.additionalInfo.criticalSpeed1;
          ruleForm.criticalSpeed2 = pass.additionalInfo && pass.additionalInfo.criticalSpeed2;
          ruleForm.criticalSpeed = pass.additionalInfo && pass.additionalInfo.criticalSpeed;
          ruleForm.longitude = pass.additionalInfo && pass.additionalInfo.longitude;
          ruleForm.latitude = pass.additionalInfo && pass.additionalInfo.latitude;
          ruleForm.modelName = (pass.additionalInfo && pass.additionalInfo.modelName) || 'nonDirect';
          ruleForm.memo = pass.memo || '';
          break;
        default:
          break;
      }
    },
    processParam(formData, oper) {
      const type = this.type;
      let param = {};
      switch (type) {
        case 'PROJECT':
          param = {
            name: formData.projectName,
            additionalInfo: {
              description: formData.description,
            },
          };
          break;
        case 'FACTORY':
          param = {
            name: formData.factoryName,
            regionCode: formData.regionCode[0],
            additionalInfo: {
              location: formData.location,
              regionCode: formData.regionCode,
            },
          };
          break;
        case 'WORKSHOP':
          param = {
            name: formData.workshopName,
            additionalInfo: {
              address: formData.address,
              longitude: formData.longitude,
              latitude: formData.latitude,
            },
          };
          break;
        case 'MACHINE':
          param = {
            name: formData.workGroupName,
            machineMetadata: {
              speedMeasuringPoint: formData.speedMeasuringPoint,
              pulseOfWeek: formData.pulseOfWeek,
              speedRatio: formData.speedRatio,
              masterIp: formData.masterIp,
              isReCalculateRP: formData.isReCalculateRP,
            },
            additionalInfo: {
              workGroupType: formData.workGroupType,
              workGroupModel: formData.workGroupModel,
              criticalSpeed1: formData.criticalSpeed1,
              criticalSpeed2: formData.criticalSpeed2,
              criticalSpeed: formData.criticalSpeed,
              longitude: formData.longitude,
              latitude: formData.latitude,
              modelName: formData.modelName,
            },
            memo: formData.memo,
          };
          break;
        default:
          break;
      }
      param = {
        ...param,
        type,
      };
      return param;
    },
    submitForm: debounce(
      function submitForm(formName) {
        if (this.oper === 'view') {
          this.handleCancel();
          return;
        }
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.oper === 'create') {
            this.createHierarchy(this.ruleForm);
          } else if (this.oper === 'edit') {
            this.updateUser(this.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    createHierarchy(formData) {
      if (!formData) {
        return;
      }
      const param = this.processParam(formData, this.oper);
      this.loading = true;
      this.$api.projectSet
        .createHierarchy(this.id, param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('pass.failure.createPass', { 0: param.name }));
            return;
          }
          this.$msg.success(this.$t('pass.success.createPass', { 0: param.name }));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateUser(id, formData) {
      if (!id || !formData) {
        return;
      }
      const param = this.processParam(formData, this.oper);
      this.loading = true;
      this.$api.projectSet
        .updateHierarchy(id, param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('pass.failure.updatePass', { 0: param.name }));
            return;
          }
          this.$msg.success(this.$t('pass.success.updatePass', { 0: param.name }));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    searchBlur(e) {
      this.ruleForm.workGroupName = e.target.value;
    },
    // 获取风机列表
    getUnboundFanList() {
      this.$api.projectSet
        .getUnboundFanList(this.id)
        .then((res) => {
          if (!res || !res.data) {
            return;
          }
          this.fanList = res.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    getPointList(dictKind) {
      const params = {
        dictKind,
      };
      this.$api.equipmentMng
        .getQueryByDictKind(params)
        .then((res) => {
          this.speedMeasuringPointList = res?.data || [];
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    changeModelName(type) {
      this.getPointList(type);
    },
  },
};
</script>
<style lang="less">
#pass-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
