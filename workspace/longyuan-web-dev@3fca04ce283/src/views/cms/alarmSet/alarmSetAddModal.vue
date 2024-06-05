<template>
  <div id="alarm-set-add-modal">
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
        <el-form-item :label="$t('alarmSet.workGroup')" prop="machineId">
          <el-select
            class="width-300"
            v-model="ruleForm.machineId"
            :placeholder="$t('projectSet.workGroup')"
            clearable
            :disabled="true"
            @visible-change="visibleChange"
          >
            <el-option v-for="item in machineList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('alarmSet.sensor')" prop="sensorId">
          <el-select
            class="width-300"
            v-model="ruleForm.sensorId"
            :placeholder="$t('projectSet.placeholder.sensor')"
            clearable
            @change="getFeatureIdentifierArr"
            :disabled="options.winData.oper === 'edit'"
            @visible-change="visibleChange"
          >
            <el-option v-for="item in sensorList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('alarmSet.variety')" prop="featureIdentifier">
          <el-select
            class="width-300"
            v-model="ruleForm.featureIdentifier"
            :placeholder="$t('alarmSet.placeholder.variates')"
            size="medium"
            clearable
            :disabled="options.winData.oper === 'edit'"
            @visible-change="visibleChange"
          >
            <template v-for="item in featureIdentifierArr">
              <el-option :key="item.identifier" :label="item.name" :value="item.identifier"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="13">
            <el-form-item :label="$t('alarmSet.frequencyBandSet')" prop="lowCut" class="">
              <el-input
                class="width-130"
                v-model.trim="ruleForm.lowCut"
                :placeholder="$t('alarmSet.placeholder.lowCut')"
                @blur="handleBlur"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="" label-width="10" prop="heightCut">
              <el-input
                prop="heightCut"
                class="width-130"
                v-model.trim="ruleForm.heightCut"
                :placeholder="$t('alarmSet.placeholder.heightCut')"
                @blur="handleBlur"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('alarmSet.attentionValue')" prop="attentionValue">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.attentionValue"
            :placeholder="$t('alarmSet.placeholder.attentionValue')"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('alarmSet.errorValue')" prop="errorValue">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.errorValue"
            :placeholder="$t('alarmSet.placeholder.errorValue')"
            @blur="handleBlur"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { FLOAT_REG } from '@/util/regExpService';
import { extractWorkshopId, getBrowserType } from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'alarmSetAddModal',
  data() {
    const attentionValueValidator = (rule, value, callback) => {
      if (!FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('alarmSet.invalid.attentionValue')));
      }
      const errorValue = this.ruleForm.errorValue;
      if (value && errorValue && parseFloat(value) >= parseFloat(errorValue)) {
        return callback(new Error(this.$t('alarmSet.invalid.attentionValue')));
      }
      callback();
    };
    const errorValueValidator = (rule, value, callback) => {
      if (!FLOAT_REG.test(value)) {
        return callback(new Error(this.$t('alarmSet.invalid.errorValue')));
      }
      const attentionValue = this.ruleForm.attentionValue;
      if (value && attentionValue && parseFloat(value) <= parseFloat(attentionValue)) {
        return callback(new Error(this.$t('alarmSet.invalid.errorValue')));
      }
      callback();
    };
    return {
      loading: true,
      id: '',
      machineList: [],
      sensorList: [],
      featureIdentifierArr: [],
      ruleForm: {
        machineId: '',
        sensorId: '',
        featureIdentifier: '',
        attentionValue: '',
        errorValue: '',
        lowCut: '',
        heightCut: '',
      },
      rules: {
        machineId: [
          {
            required: true,
            message: this.$t('projectSet.workGroup'),
            trigger: 'change',
          },
        ],
        sensorId: [
          {
            required: true,
            message: this.$t('projectSet.placeholder.sensor'),
            trigger: 'change',
          },
        ],
        featureIdentifier: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.variates'),
            trigger: 'change',
          },
        ],
        attentionValue: [
          {
            required: true,
            validator: attentionValueValidator,
            trigger: 'blur',
          },
        ],
        errorValue: [
          {
            required: true,
            validator: errorValueValidator,
            trigger: 'blur',
          },
        ],
        lowCut: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.lowCut'),
            trigger: 'change',
          },
        ],
        heightCut: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.heightCut'),
            trigger: 'change',
          },
        ],
      },
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList']),
  },
  mounted() {
    const { machine, oper, item } = this.options.winData;
    if (oper === 'create') {
      this.machineList = [{ id: machine.id, name: machine.name }];
      this.ruleForm.machineId = machine.id;
      this.fetchSensorList(machine.id);
    }
    if (oper === 'edit') {
      this.id = item.id;
      this.machineList = [{ id: item.machineId, name: item.machineName }];
      this.ruleForm = {
        machineId: item.machineId,
        sensorId: item.sensorId,
        featureIdentifier: item.featureIdentifier,
        attentionValue: item.attentionValue,
        errorValue: item.errorValue,
        lowCut: item.lowCut,
        heightCut: item.heightCut,
      };
      this.fetchSensorList(item.machineId, 'edit');
    }
  },
  methods: {
    handleBlur() {
      this.$refs.ruleForm.validateField(['attentionValue', 'errorValue']);
    },
    visibleChange(isVisible) {
      const isEdge = getBrowserType().type;
      if (isEdge === 'Edge' && !isVisible) {
        document.querySelectorAll('body > .el-select-dropdown.el-popper').forEach((it) => it.remove());
      }
    },
    fetchSensorList(machineId, oper) {
      if (!machineId) return;
      const workshopId = extractWorkshopId(this.passList, machineId);
      this.$api.projectSet
        .getSensorUnderHierarchy({ hierarchyId: machineId, workshopId })
        .then((res) => {
          if (!res) {
            this.sensorList = [];
            return;
          }
          this.sensorList = res;
          if (oper === 'edit') {
            this.getFeatureIdentifierArr(this.ruleForm.sensorId, oper);
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getFeatureIdentifierArr(value, oper) {
      if (!value || this.sensorList.length === 0) {
        this.featureIdentifierArr = [];
        this.ruleForm.featureIdentifier = '';
        return;
      }
      this.featureIdentifierArr = this.findFeatureIdentifier(this.sensorList, this.ruleForm.sensorId);
      if (this.featureIdentifierArr.length === 0) {
        this.ruleForm.featureIdentifier = '';
        return;
      }
      if (this.ruleForm.featureIdentifier) {
        const identifierArr = this.featureIdentifierArr.map((item) => item.identifier);
        if (!identifierArr.includes(this.ruleForm.featureIdentifier)) {
          this.ruleForm.featureIdentifier = '';
        }
      }
    },
    findFeatureIdentifier(arr, tid) {
      let array = [];
      arr.every((ele) => {
        if (ele.id === tid) {
          array = ele.variates;
          return false;
        }
        return true;
      });
      return array;
    },
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          }
          if (this.options.winData.oper === 'edit') {
            this.edit(this.id, this.ruleForm);
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
      this.$api.alarmSet
        .createAlarmSet(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('alarmSet.failure.create'));
            return;
          }
          this.$msg.success(this.$t('alarmSet.success.create'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    edit(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      this.$api.alarmSet
        .updateAlarmSet(id, formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('alarmSet.failure.update'));
            return;
          }
          this.$msg.success(this.$t('alarmSet.success.update'));
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
#alarm-set-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
