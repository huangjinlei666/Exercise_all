<template>
  <div id="dilution-rule">
    <div class="dilution-table cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('dilution.dataDilution') }}</div>
      <el-radio-group v-model="type" class="d2-mb-20">
        <el-radio v-for="item in dilutionTypes" :key="item.value" :label="item.value" @change="fetchDilution">
          {{ $t(item.label) }}
        </el-radio>
      </el-radio-group>
      <el-form
        v-loading="loading"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        class="d2-mb-20"
        label-width="130px"
        label-suffix=":"
        label-position="left"
        size="medium"
        :inline-message="true"
      >
        <el-form-item :label="$t('dilution.timeSelect')" prop="timeRange">
          <el-date-picker
            v-model="ruleForm.timeRange"
            type="datetimerange"
            :picker-options="pickerOptions"
            :range-separator="$t('common.to')"
            :start-placeholder="$t('common.beginDate')"
            :end-placeholder="$t('common.endDate')"
            align="right"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('dilution.dilutionStrategy')" prop="intervalUnit">
          <span>
            <span class="d2-mr-5">{{ $t('common.every') }}</span>
            <el-input-number
              class="d2-mr-5 width-100"
              v-model="ruleForm.interval"
              controls-position="right"
              :min="ruleForm.intervalUnit === 'SECOND' ? 10 : 0"
              :max="60"
            ></el-input-number>
            <el-select
              class="d2-mr-5 width-163"
              v-model="ruleForm.intervalUnit"
              :placeholder="$t('dilution.placeholder.unit')"
            >
              <el-option
                v-for="item in intervalUnitTypes"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
              ></el-option>
            </el-select>
            <span class="d2-mr-5">{{ $t('common.reserve') }}</span>
            <el-input-number
              class="d2-mr-5 width-100"
              v-model="ruleForm.saveDataCount"
              controls-position="right"
              :min="0"
              :max="100"
            ></el-input-number>
            <span>{{ $t('common.groupData') }}</span>
          </span>
        </el-form-item>
      </el-form>
      <div>
        <el-button size="medium" type="primary" @click="submitForm('ruleForm')" :disabled="loading">
          {{ $t('dilution.dilution') }}</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import { dilutionTypes, intervalUnitTypes } from '@/util/selectTypes';

export default {
  name: 'dilutionRule',
  data() {
    return {
      loading: false,
      dilutionTypes,
      intervalUnitTypes,
      type: 'VALUE',
      ruleForm: {
        timeRange: '',
        interval: '',
        intervalUnit: '',
        saveDataCount: '',
      },
      rules: {
        timeRange: [{ required: true, message: this.$t('dilution.invalid.timeRange'), trigger: 'change' }],
        intervalUnit: [{ required: true, message: this.$t('dilution.invalid.intervalUnit'), trigger: 'change' }],
      },
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() <= Date.now();
        },
        shortcuts: [
          {
            text: this.$t('common.futureWeek'),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: this.$t('common.futureMonth'),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            },
          },
          {
            text: this.$t('common.futureMonth3'),
            onClick(picker) {
              const start = new Date();
              const end = new Date();
              end.setTime(end.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
    };
  },
  mounted() {
    this.fetchDilution();
  },
  methods: {
    fetchDilution() {
      if (!this.type) return;
      this.$api.dilution
        .getDilutionById(this.type)
        .then((res) => {
          if (!res) {
            return;
          }
          this.ruleForm = {
            timeRange: res.startTime ? [new Date(res.startTime), new Date(res.endTime)] : '',
            interval: res.interval || '',
            intervalUnit: res.intervalUnit || '',
            saveDataCount: res.saveDataCount || '',
          };
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          const param = {
            type: this.type,
            startTime: this.ruleForm.timeRange[0].getTime(),
            endTime: this.ruleForm.timeRange[1].getTime(),
            interval: this.ruleForm.interval,
            intervalUnit: this.ruleForm.intervalUnit,
            saveDataCount: this.ruleForm.saveDataCount,
          };
          this.update(this.type, param);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    update(type, param) {
      if (!type || !param) {
        return;
      }
      this.loading = true;
      this.$api.dilution
        .updateDilution(type, param)
        .then((res) => {
          if (!res || !res.type) {
            this.$msg.error(this.$t('dilution.failure.update'));
            return;
          }
          this.$msg.success(this.$t('dilution.success.update'));
          this.fetchDilution();
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
<style lang="less" scoped>
#dilution-rule {
  height: 100% !important;
  padding-right: 20px;
  padding-bottom: 20px;
  min-width: 976px;
  .dilution-table {
    width: 100%;
    height: 100%;
    .el-form {
      .el-form-item {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
