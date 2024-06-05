<template>
  <div id="equipmentMng-add-modal">
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
        label-width="100px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <div class="formDiv div-group">
          <el-form-item :label="$t('equipmentMng.product')" prop="productTemplateId">
            <el-select
              class="width-300 d2-mr-10"
              v-model="ruleForm.productTemplateId"
              :placeholder="$t('equipmentMng.placeholder.product')"
              size="medium"
            >
              <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('equipmentMng.equipmentTemplateName')" prop="deviceTemplateId">
            <el-select
              class="width-300 d2-mr-10"
              v-model="ruleForm.deviceTemplateId"
              :placeholder="$t('equipmentMng.placeholder.equipmentTemplateName')"
              size="medium"
              @change="changeTemplate($event)"
            >
              <el-option v-for="item in equipmentTemplateList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </div>
        <!-- <div class="formDiv"> -->
        <!-- <el-form-item :label="$t('equipmentMng.equipmentTemplateName')" prop="deviceTemplateId">
            <el-select
              class="width-300 d2-mr-10"
              v-model="ruleForm.deviceTemplateId"
              :placeholder="$t('equipmentMng.placeholder.equipmentTemplateName')"
              size="medium"
              @change="changeTemplate($event)"
            >
              <el-option v-for="item in equipmentTemplateList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item> -->
        <!-- </div> -->
        <div class="formDiv div-group">
          <div>
            <el-form-item :label="$t('equipmentMng.mainControlNo')" prop="deviceNo">
              <el-input
                class="width-300"
                v-model.trim="ruleForm.deviceNo"
                :placeholder="$t('equipmentMng.placeholder.mainControlNo')"
                maxlength="32"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.mainControlName')" prop="deviceName">
              <el-input
                class="width-300"
                v-model.trim="ruleForm.deviceName"
                :placeholder="$t('equipmentMng.placeholder.mainControlName')"
                maxlength="32"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.masterIp')" prop="masterIp">
              <el-input
                class="width-300"
                v-model.trim="ruleForm.masterIp"
                :placeholder="$t('equipmentMng.placeholder.masterIp')"
                maxlength="32"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.speedPoint')" prop="speedMeasuringPoint">
              <!-- <el-input
                class="width-300"
                v-model.trim="ruleForm.speedMeasuringPoint"
                :placeholder="$t('equipmentMng.placeholder.speedPoint')"
                maxlength="32"
              ></el-input> -->
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
            <el-form-item :label="$t('equipmentMng.speedRatio')" prop="speedRatio">
              <el-input
                class="width-300"
                v-model.trim="ruleForm.speedRatio"
                :placeholder="$t('equipmentMng.placeholder.speedRatio')"
                oninput="value=value.replace(/[^0-9.]/g,'')"
                maxlength="32"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('equipmentMng.pulsesPerweek')" prop="pulseOfWeek">
              <el-input
                class="width-300"
                v-model.trim="ruleForm.pulseOfWeek"
                :placeholder="$t('equipmentMng.placeholder.pulsesPerweek')"
                oninput="value=value.replace(/[^0-9.]/g,'')"
                maxlength="32"
              ></el-input>
            </el-form-item>
          </div>
          <div>
            <div class="formDiv" v-for="(item, index) in ruleForm.snList" :key="item.key">
              <el-form-item
                :label="$t('equipmentMng.point') + (index + 1)"
                :prop="'snList.' + index + '.sensorName'"
                :rules="{
                  required: true,
                  message: $t('equipmentMng.placeholder.point'),
                  trigger: 'blur',
                }"
              >
                <el-input
                  class="width-150"
                  :placeholder="$t('equipmentMng.placeholder.point')"
                  v-model.trim="item.sensorName"
                ></el-input>
              </el-form-item>
              <el-form-item :label="$t('equipmentMng.snCode')" :prop="'snList.' + index + '.serialNumber'">
                <el-input
                  class="width-150"
                  :placeholder="$t('equipmentMng.placeholder.snCode')"
                  v-model="item.serialNumber"
                ></el-input>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { NAME_32_REG, CHINAESE } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'equipmentMngAddModal',
  data() {
    const deviceNoValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value) || CHINAESE.test(value)) {
        return callback(new Error(this.$t('equipmentMng.invalid.mainControlNo')));
      }
      callback();
    };
    const validateSpeedRatio = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('equipmentMng.placeholder.speedRatio')));
      } else if (value.indexOf('.') !== -1 && value.split('.').length > 2) {
        callback(new Error(this.$t('equipmentMng.invalid.enterNum'))); // 防止输入多个小数点
      } else {
        callback();
      }
    };
    const validatePulseOfWeek = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('equipmentMng.placeholder.pulsesPerweek')));
      } else if (value.indexOf('.') !== -1 && value.split('.').length > 2) {
        callback(new Error(this.$t('equipmentMng.invalid.enterNum'))); // 防止输入多个小数点
      } else {
        callback();
      }
    };
    return {
      loading: false,
      id: '',
      equipmentTemplateList: [],
      speedMeasuringPointList: [],
      productList: [],
      ruleForm: {
        deviceNo: '',
        deviceName: '',
        productTemplateId: '',
        deviceTemplateId: '',
        masterIp: '',
        speedMeasuringPoint: '',
        speedRatio: '',
        pulseOfWeek: '',
        snList: [],
      },
      rules: {
        deviceNo: [
          { required: true, validator: deviceNoValidator, trigger: 'change' },
          { min: 1, max: 32, message: this.$t('equipmentMng.mainControlNoLimit'), trigger: 'change' },
        ],
        deviceName: [
          { required: true, message: this.$t('equipmentMng.placeholder.mainControlName'), trigger: 'blur' },
          { min: 1, max: 49, message: this.$t('equipmentMng.mainControlNameLimit'), trigger: 'change' },
        ],
        productTemplateId: [{ required: true, message: this.$t('equipmentMng.placeholder.product'), trigger: 'blur' }],
        deviceTemplateId: [
          { required: true, message: this.$t('equipmentMng.placeholder.equipmentTemplateName'), trigger: 'blur' },
        ],
        masterIp: [
          { required: true, message: this.$t('equipmentMng.placeholder.masterIp'), trigger: 'blur' },
          { min: 1, max: 49, message: this.$t('equipmentMng.mainControlNameLimit'), trigger: 'change' },
        ],
        speedMeasuringPoint: [
          { required: true, message: this.$t('equipmentMng.placeholder.speedPoint'), trigger: 'blur' },
        ],
        speedRatio: [
          { required: true, validator: validateSpeedRatio, trigger: 'change' },
          // { min: 1, max: 49, trigger: 'change',  },
        ],
        pulseOfWeek: [
          { required: true, validator: validatePulseOfWeek, trigger: 'change' },
          // { min: 1, max: 49, message: this.$t('equipmentMng.mainControlNameLimit'), trigger: 'change' },
        ],
      },
    };
  },
  mounted() {
    this.getProduct();
    this.getEquipmentList();

    const { oper, item } = this.options.winData;
  },
  methods: {
    changeTemplate(id) {
      this.ruleForm.speedMeasuringPoint = '';
      this.ruleForm.snList = [];
      let positonPoient;
      let dictKind;
      this.equipmentTemplateList.map((item) => {
        if (item.id === id) {
          positonPoient = item;
          dictKind = item.machineDriven;
        }
        return item;
      });

      this.getPoint(positonPoient.content.children);
      this.getDictKind(dictKind);
      // console.log(this.ruleForm.snList);
    },
    getDictKind(dictKind) {
      const params = {
        dictKind,
      };
      this.loading = true;
      this.$api.equipmentMng
        .getQueryByDictKind(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.speedMeasuringPointList = [];
            return;
          }

          this.speedMeasuringPointList = res.data;
          // console.log(this.speedMeasuringPointList);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getPoint(data) {
      data.forEach((item) => {
        if (item.type === 'sensor') {
          // console.log(item);
          this.ruleForm.snList.push({ sensorName: item.deviceName, serialNumber: '' });
        }
        if (item.children && item.children.length > 0) {
          this.getPoint(item.children);
        }
      });
    },
    getProduct() {
      this.$api.productTemplate
        .getProductList()
        .then((res) => {
          if (!res || res.length === 0) {
            this.productList = [];
            return;
          }
          this.productList = res.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getEquipmentList() {
      const params = {
        pageIndex: 1,
        pageSize: 100,
      };
      this.loading = true;
      this.$api.templateMng
        .getTemplatesList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.equipmentTemplateList = [];

            return;
          }

          this.equipmentTemplateList = res.data;
          console.log(this.equipmentTemplateList);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            this.update(this.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.equipmentMng
        .addEquipment(formData)
        .then((res) => {
          if (!res || res.success === false) {
            this.$msg.error(this.$t('equipmentMng.failure.createEquipment'));
            return;
          }
          this.$msg.success(this.$t('equipmentMng.success.createEquipment'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
#equipmentMng-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .formDiv {
    display: flex;
    &.div-group {
      border: 1px solid #ccc;
      padding: 10px 10px 0 10px;
      margin-top: 10px;
      border-radius: 4px;
    }
  }
  .width-150 {
    width: 150px;
  }
}
</style>
