<template>
  <div id="life-cycle-add-modal">
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
        <el-form-item :label="$t('device.deviceName')" prop="machineId" v-if="this.level === 'MACHINE'">
          <el-select
            class="width-300"
            :placeholder="this.$t('device.placeholder.deviceName')"
            v-model="ruleForm.machineId"
            :disabled="true"
          >
            <el-option v-for="item in deivceList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('device.deviceName')" prop="sensorId" v-if="this.level === 'SENSOR'">
          <el-select
            class="width-300"
            :placeholder="this.$t('device.placeholder.deviceName')"
            v-model="ruleForm.sensorId"
            :disabled="true"
          >
            <el-option v-for="item in deivceList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('device.LifeType')" prop="type">
          <el-select class="width-300" :placeholder="$t('device.placeholder.selectLifeType')" v-model="ruleForm.type">
            <el-option
              v-for="t in deiviceLifeCycleTypes"
              :key="t.value"
              :label="$t(t.label)"
              :value="t.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="occurTime" :label="$t('device.occurTime')">
          <el-date-picker
            style="width: 300px"
            v-model="ruleForm.occurTime"
            type="datetime"
            :placeholder="$t('device.placeholder.occurTime')"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('common.description')" prop="description">
          <el-input
            class="width-300 cms-textarea"
            type="textarea"
            :maxlength="512"
            v-model.trim="ruleForm.description"
            :placeholder="$t('user.placeholder.description')"
          ></el-input>
        </el-form-item>
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
import { deiviceLifeCycleTypes } from '@/util/selectTypes';
import { TRIM_512_REG } from '@/util/regExpService';

export default {
  mixins: [modalMixin],
  name: 'LifeCycleAddModal',
  data() {
    const descriptionValidator = (rule, value, callback) => {
      if (value && !TRIM_512_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.descriptionValid')));
      }
      callback();
    };
    return {
      deiviceLifeCycleTypes,
      loading: false,
      machineList: [],
      defaultDateValue: '',
      level: '',
      ruleForm: {
        id: '',
        machineId: '', // 风机id
        sensorId: '', // 设备id
        type: '',
        occurTime: '',
        description: '',
      },
      rules: {
        machineId: [
          {
            required: true,
            message: this.$t('device.placeholder.deviceName'),
            trigger: 'change',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('device.placeholder.selectLifeType'),
            trigger: 'change',
          },
        ],
        occurTime: [
          {
            required: true,
            message: this.$t('alarmSet.placeholder.variates'),
            trigger: 'change',
          },
        ],
        description: [{ validator: descriptionValidator, trigger: 'change' }],
      },
    };
  },
  mounted() {
    const { machine, oper, currentDeivce, info } = this.options.winData;
    console.log();
    if (oper === 'create') {
      this.deivceList = [{ id: currentDeivce.id, name: currentDeivce.name }];
      this.ruleForm.machineId = machine.id;
      this.level = currentDeivce.type;
      this.ruleForm.sensorId = currentDeivce.type === 'SENSOR' ? currentDeivce.id : '';
    }
    if (oper === 'edit') {
      const { machineId, machineName, type, occurTime, description, id, sensorId, sensorName } = info;
      this.level = sensorId ? 'SENSOR' : 'MACHINE';
      this.deivceList = sensorId ? [{ id: sensorId, name: sensorName }] : [{ id: machineId, name: machineName }];
      this.ruleForm.machineId = machineId;
      this.ruleForm.sensorId = sensorId;
      this.ruleForm.type = type;
      this.ruleForm.occurTime = occurTime;
      this.ruleForm.description = description;
      this.ruleForm.id = id;
    }
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          const formData = {
            ...this.ruleForm,
          };
          this.options.winData.oper === 'create' ? this.create(formData) : this.update(formData);
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
      this.$api.device
        .addDeviceLifeCycle(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('device.failure.create'));
            return;
          }
          this.$msg.success(this.$t('device.success.create'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    update(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.device
        .updateDeviceLifeCycle(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('device.failure.update'));
            return;
          }
          this.$msg.success(this.$t('device.success.update'));
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
#life-cycle-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
