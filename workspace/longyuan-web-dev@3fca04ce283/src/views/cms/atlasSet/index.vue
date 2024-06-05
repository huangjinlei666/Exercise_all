<template>
  <div id="atlas-set">
    <div class="atlas-table cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('atlasSet.atlasSet') }}</div>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        label-position="left"
        label-suffix=":"
        size="medium"
        autocomplete="off"
        v-loading="loading"
        :inline-message="true"
      >
        <el-row>
          <div class="cms-item-title d2-mb-10">{{ $t('atlasSet.refresh') }}</div>
          <el-form-item :label="$t('atlasSet.refresh')" prop="refreshTime">
            <span>
              <el-input-number
                class="width-300"
                :min="1"
                v-model="ruleForm.refreshTime"
                :placeholder="$t('atlasSet.placeholder.second')"
              ></el-input-number>
              <span class="atlas-unit d2-ml-5">{{ $t('common.seconds') }}</span>
            </span>
          </el-form-item>
        </el-row>
        <el-row>
          <div class="cms-item-title d2-mb-10">{{ $t('atlasSet.speed') }}</div>
          <el-form-item :label="$t('atlasSet.decimal')" prop="rotateSpeedPrecision">
            <span>
              <el-input-number
                class="width-300"
                :min="0"
                :max="50"
                v-model="ruleForm.rotateSpeedPrecision"
                :placeholder="$t('atlasSet.placeholder.place')"
              ></el-input-number>
              <span class="atlas-unit d2-ml-5">{{ $t('common.places') }}</span>
            </span>
          </el-form-item>
        </el-row>
        <el-row>
          <div class="cms-item-title d2-mb-10">{{ $t('atlasSet.process') }}</div>
          <el-form-item :label="$t('atlasSet.significant')" prop="processSignificantDigit">
            <span>
              <el-input-number
                class="width-300"
                :min="0"
                :max="50"
                v-model="ruleForm.processSignificantDigit"
                :placeholder="$t('atlasSet.placeholder.place')"
              ></el-input-number>
              <span class="atlas-unit d2-ml-5">{{ $t('common.places') }}</span>
            </span>
          </el-form-item>
        </el-row>
        <el-row>
          <div class="cms-item-title d2-mb-10">{{ $t('atlasSet.global') }}</div>
          <el-form-item :label="$t('atlasSet.decimal')" prop="globalFigurePrecision">
            <span>
              <el-input-number
                class="width-300"
                :min="0"
                :max="20"
                v-model="ruleForm.globalFigurePrecision"
                :placeholder="$t('atlasSet.placeholder.place')"
              ></el-input-number>
              <span class="atlas-unit d2-ml-5">{{ $t('common.places') }}</span>
            </span>
          </el-form-item>
        </el-row>
        <el-row>
          <el-button size="medium" :disabled="loading" type="primary" @click="submit('ruleForm')">{{
            $t('common.save')
          }}</el-button>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import { mapMutations } from 'vuex';

export default {
  name: 'atlasSet',
  data() {
    return {
      loading: false,
      ruleForm: {
        refreshTime: '10',
        rotateSpeedPrecision: '2',
        processSignificantDigit: '2',
        globalFigurePrecision: '2',
      },
      rules: {
        refreshTime: [{ required: true, message: this.$t('atlasSet.placeholder.second'), trigger: 'change' }],
        rotateSpeedPrecision: [{ required: true, message: this.$t('atlasSet.placeholder.place'), trigger: 'change' }],
        processSignificantDigit: [
          { required: true, message: this.$t('atlasSet.placeholder.place'), trigger: 'change' },
        ],
        globalFigurePrecision: [{ required: true, message: this.$t('atlasSet.placeholder.place'), trigger: 'change' }],
      },
    };
  },
  mounted() {
    this.fetchAtlas();
  },
  methods: {
    ...mapMutations({
      saveRefreshTime: 'cms/atlas/saveRefreshTime',
      saveGlobalFigurePrecision: 'cms/atlas/saveGlobalFigurePrecision',
    }),
    fetchAtlas() {
      this.loading = true;
      this.$api.atlas
        .getAtlas()
        .then((res) => {
          if (!res) {
            return;
          }
          this.ruleForm = res;
          // 图谱刷新时间
          this.saveRefreshTime(res.refreshTime);
          // 总貌图小数点位数
          this.saveGlobalFigurePrecision(res.globalFigurePrecision);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    submit: debounce(
      function submit(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.saveAtlas(this.ruleForm);
        });
      },
      300,
      { leading: true, trailing: false }
    ),
    saveAtlas(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.atlas
        .updateAtlas(formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('atlasSet.failure.failure'));
            return;
          }
          this.$msg.success(this.$t('atlasSet.success.success'));
          this.fetchAtlas();
        })
        .catch((err) => this.$msg.error(err))
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less" scoped>
#atlas-set {
  height: 100% !important;
  padding-right: 20px;
  min-width: 976px;
  .atlas-table {
    width: 100%;
    height: 100%;
    .el-form {
      .el-form-item {
        margin-bottom: 10px;
        .atlas-unit {
          display: inline-block;
          background-color: #f5f7fa;
          color: #909399;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          padding: 0 20px;
          white-space: nowrap;
          box-sizing: border-box;
          line-height: 34px;
          vertical-align: bottom;
        }
      }
    }
  }
}
</style>
