<template>
  <el-form labelWidth="200px" autocomplete="off" size="medium" ref="ruleForm" :inlineMessage="true">
    <template v-for="(itemA, indexA) in showlist">
      <el-card v-bind:key="indexA" style="margin-bottom: 20px">
        <template v-for="(itemB, indexB) in paramsCheckList">
          <el-form-item :label="itemB.zhKey" :key="indexA + indexB">
            <template v-if="itemB.type === 'selector'">
              <el-select :disabled="disabled" style="width: 300px" v-model="itemA[itemB.enKey]">
                <template v-if="itemB.optionItems">
                  <template v-for="itemO in itemB.optionItems">
                    <el-option :key="itemO.enKey" :label="itemO.zhKey" :value="itemO.enKey"></el-option>
                  </template>
                </template>
              </el-select>
            </template>
            <template v-else>
              <el-input
                :disabled="disabled"
                style="width: 300px"
                v-bind:value="Array.isArray(itemA[itemB.enKey]) ? itemA[itemB.enKey].join(',') : itemA[itemB.enKey]"
                v-on:input="(v) => onChange(v, itemA, itemB.enKey, itemB.type)"
              ></el-input>
            </template>
          </el-form-item>
        </template>
      </el-card>
    </template>
    <el-form-item>
      <el-button type="primary" @click="handleConfirm" id="save" class="pull-right">
        {{ this.$t('common.save') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import { NORMAL_FLOAT_REG } from '@/util/regExpService';

export default {
  name: 'GenerateForm',
  props: {
    showFormList: {
      type: Array,
      default: () => [],
    },
    paramsCheckList: {
      type: Array,
      default: () => [],
    },
    deleteId: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      showlist: [],
      disabled: false,
      flag: false,
    };
  },
  watch: {
    showFormList(v) {
      v.map((val) => {
        this.paramsCheckList.forEach((pVal) => {
          if (!val.hasOwnProperty(pVal.enKey)) {
            val[pVal.enKey] = '';
          }
        });
        return val;
      });
      this.showlist = cloneDeep(v);
    },
  },
  mounted() {
    const { oper } = this.$route.query;
    const save = document.querySelector('#save');
    if (oper === 'detail' || oper === 'issue') {
      save.style.display = 'none';
      this.disabled = true;
    } else {
      save.style.display = 'block';
      this.disabled = false;
    }
  },
  methods: {
    onChange(v, item, key, type) {
      item[key] = v;
      this.flag = false;
      if (type === 'integer' || type === 'number') {
        this.flag = !NORMAL_FLOAT_REG.test(v);
      }
      if (this.flag) {
        item[key] = item[key].replace(/[^\d]/g, '');
        this.$msg.error(this.$t('publicStrategy.enterNum'));
      }

      // if ((type === 'integer' || type === 'number') && NORMAL_FLOAT_REG.test(v)) {
      //   this.flag = false;
      // }
      // if (this.flag) return;
      // if ((type === 'integer' || type === 'number') && !NORMAL_FLOAT_REG.test(v)) {
      //   this.flag = true;
      //   this.$msg.error(this.$t('publicStrategy.enterNum'));
      // }
    },
    handleConfirm() {
      if (this.flag) return this.$msg.error(this.$t('publicStrategy.enterNum'));
      const formData = {};
      formData.setValues = JSON.stringify(this.showlist);
      this.loading = true;
      this.$api.publicStrategy
        .updateStrategyValue(this.deleteId, formData)
        .then((res) => {
          this.$emit('getParameterValue', this.deleteId);
          this.$msg.success(this.$t('publicStrategy.success.updateStrategyPamars'));
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.detail {
  display: none;
}
/deep/.el-input {
  width: 300px !important;
}
</style>
