<template>
  <div id="frequencyCount">
    <div class="frequencyCount-table-box cms-card">
      <div class="top-box">
        <div class="top-title">
          {{ $t('frequencyCount.frequencyCountDB') }}
        </div>
        <div>
          <el-button size="medium" type="primary" @click="handleQuery()">
            {{ $t('common.query') }}
          </el-button>
        </div>
      </div>
      <div class="top-form">
        <el-form
          v-loading="loading"
          :model="ruleForm"
          ref="ruleForm"
          label-width="150px"
          :rules="rules"
          class="demo-ruleForm"
          autocomplete="off"
          size="medium"
          :inline-message="true"
        >
          <div class="formDiv">
            <el-form-item :label="$t('frequencyCount.sunGear') + ':'" prop="sunGear">
              <el-input
                class="width-200"
                v-model.number="ruleForm.sunGear"
                :placeholder="$t('frequencyCount.placeholder.sunGear') + ':'"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('frequencyCount.planetGear') + ':'" prop="planetGear">
              <el-input
                class="width-200"
                v-model.number="ruleForm.planetGear"
                :placeholder="$t('frequencyCount.placeholder.planetGear') + ':'"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('frequencyCount.internalGear') + ':'" prop="innerGear">
              <el-input
                class="width-200"
                v-model.number="ruleForm.innerGear"
                :placeholder="$t('frequencyCount.placeholder.internalGear') + ':'"
              ></el-input>
            </el-form-item>
          </div>
          <div class="formDiv">
            <el-form-item :label="$t('frequencyCount.planetaryGear') + ':'" prop="planet">
              <el-input
                class="width-200"
                v-model.number="ruleForm.planet"
                :placeholder="$t('frequencyCount.placeholder.planetaryGear') + ':'"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('frequencyCount.inputSpeed') + ':'" prop="inputSpeed">
              <el-input
                class="width-200 input-with-select"
                v-model.trim="ruleForm.inputSpeed"
                :placeholder="$t('frequencyCount.placeholder.inputSpeed') + ':'"
              >
                <template #append>
                  <el-select class="width-80" v-model.trim="ruleForm.units" placeholder="">
                    <el-option label="Hz" value="Hz"></el-option>
                    <el-option label="CPM" value="CPM"></el-option>
                  </el-select> </template
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('frequencyCount.harmonic') + ':'" prop="times">
              <el-input
                class="width-200"
                v-model.number="ruleForm.times"
                :placeholder="$t('frequencyCount.placeholder.inputHarmonic')"
              ></el-input>
            </el-form-item>
          </div>
          <div class="formDiv">
            <el-form-item :label="$t('frequencyCount.outputSpeed') + ':'"> {{ outputSpeed }}</el-form-item>
            <el-form-item :label="$t('frequencyCount.transmissionRatio') + ':'"> {{ transmissionRate }}</el-form-item>
            <!-- <el-form-item :label="$t('frequencyCount.series')"> - - </el-form-item> -->
          </div>
        </el-form>
      </div>
    </div>
    <div class="bearing-table-box cms-card">
      <p class="table-title" style="font-weight: bolder">
        {{ $t('frequencyCount.calculationResults') }}
      </p>
      <div class="bearing-table">
        <el-table
          :data="tableData.gearboxInfoList"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('frequencyCount.frequencyDoubling')" type="index" width="200"> </el-table-column>
          <el-table-column :label="$t('frequencyCount.gearEngagement')">
            <el-table-column label="">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.gearMeshing }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.sunGear') + '/' + $t('frequencyCount.planetGear')">
            <el-table-column :label="$t('frequencyCount.equipmentFrequency')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.sunAssemblyFrequency }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('frequencyCount.toothFrequency')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.sunGearRepeatFrequency }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.internalGear') + '/' + $t('frequencyCount.planetaryGear')">
            <el-table-column :label="$t('frequencyCount.equipmentFrequency')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetAssemblyFrequency }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('frequencyCount.toothFrequency')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetGearRepeatFrequency }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData.frequencieList"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('frequencyCount.frequencyDoubling')" type="index" width="200"> </el-table-column>
          <el-table-column :label="$t('frequencyCount.sunGearFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.sunGearFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.planetGearFrequenc')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom" style="color: red">{{ scope.row.planetGearFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.internalGearFrequenc')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.innerGearFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.planetaryGearFrequenc')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.planetFrameEdgeFrequency }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData.defectList"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('frequencyCount.frequencyDoubling')" type="index" width="200"> </el-table-column>
          <el-table-column :label="$t('frequencyCount.sunGearDefect')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.sunGearDefect }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.planetGearDefect')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.planetDefect }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.internalGearDefect')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.innerDefect }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData.gearEdgeList"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :span-method="arraySpanMethod"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column label="">
            <el-table-column :label="$t('frequencyCount.harmonic')" type="index" width="200" :index="indexMethod">
              <!-- <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.harmonic }}</span>
              </template> -->
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.gearEngagement')">
            <el-table-column :label="$t('frequencyCount.solarSideband')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.sunGearEdge }}</span>
              </template>
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.sunGearEdgeIncrease }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.gearEngagement')">
            <el-table-column :label="$t('frequencyCount.planetaryBeltF8')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetGearEdge }}</span>
              </template>
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetGearEdgeIncrease }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('frequencyCount.gearEngagement')">
            <el-table-column :label="$t('frequencyCount.planetaryBeltF1')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetFrameEdge }}</span>
              </template>
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.planetFrameEdgeIncrease }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';

export default {
  name: 'frequencyCount',
  data() {
    const validateSungear = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('frequencyCount.placeholder.gearsNo')));
      }
      if (!Number.isInteger(value)) {
        callback(new Error(this.$t('frequencyCount.placeholder.numValue')));
      } else if (value > 2000) {
        callback(new Error(this.$t('frequencyCount.placeholder.numGears')));
      } else {
        callback();
      }
      callback();
    };
    const validateTimes = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('frequencyCount.placeholder.inputHarmonic')));
      }
      if (!Number.isInteger(value)) {
        callback(new Error(this.$t('frequencyCount.placeholder.numValue')));
      } else if (value > 100) {
        callback(new Error(this.$t('frequencyCount.placeholder.multiple')));
      } else {
        callback();
      }
      callback();
    };
    const validateSpeed = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('frequencyCount.placeholder.inputSpeed')));
      }
      if (!Number(value)) {
        callback(new Error(this.$t('frequencyCount.placeholder.numValue')));
      } else if (this.ruleForm.units === 'Hz') {
        if (value > 50) {
          callback(new Error(this.$t('frequencyCount.placeholder.speed50')));
        }
      } else if (this.ruleForm.units === 'CPM') {
        if (value > 6000) {
          callback(new Error(this.$t('frequencyCount.placeholder.speed6000')));
        }
      } else {
        callback();
      }
      callback();
    };
    return {
      loading: false,
      tableData: {},
      transmissionRate: '- -',
      outputSpeed: '- -',
      ruleForm: {
        sunGear: '',
        planetGear: '',
        innerGear: '',
        planet: '',
        units: 'CPM',
        times: '',
        inputSpeed: '',
      },
      rules: {
        sunGear: [{ required: true, validator: validateSungear, trigger: 'blur' }],
        planetGear: [{ required: true, validator: validateSungear, trigger: 'blur' }],
        innerGear: [{ required: true, validator: validateSungear, trigger: 'blur' }],
        planet: [{ required: true, validator: validateSungear, trigger: 'blur' }],
        inputSpeed: [{ required: true, validator: validateSpeed, trigger: 'blur' }],
        times: [{ required: true, validator: validateTimes, trigger: 'blur' }],
        units: [{ required: true }],
      },
      dataNum: 6,
    };
  },
  mounted() {
    // 获取列表数据
  },
  methods: {
    // 合并列表行
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex % this.dataNum === 0) {
        if (columnIndex === 1) {
          return [1, 2];
        }
        if (columnIndex === 2) {
          return [1, 2];
        }
        if (columnIndex === 3) {
          return [1, 2];
        }
      }
      if (columnIndex === 0) {
        if (rowIndex % this.dataNum === 0) {
          return {
            rowspan: this.dataNum,
            colspan: 1,
          };
        }
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
    },
    // 列表查询接口
    fetchBladeList(params) {
      this.loading = true;
      this.$api.frequencyCount
        .getFrequencyCount(params)
        .then((res) => {
          if (!res) {
            this.tableData = [];
            return;
          }
          this.tableData = res;
          this.transmissionRate = res.transmissionRate;
          this.outputSpeed = res.outputSpeed;
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleQuery() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid) {
          return;
        }

        this.dataNum = this.ruleForm.times + 1;
        this.fetchBladeList(this.ruleForm);
      });
    },
    indexMethod(index) {
      const num = this.dataNum;
      const numDate = index / num;
      return numDate + 1;
    },
  },
};
</script>
<style lang="less" scoped>
#frequencyCount {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .top-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .top-title {
      font-size: 16px;
      font-weight: bolder;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .top-form {
    margin-top: 20px;
  }
  .formDiv {
    display: flex;
    .el-form-item {
      width: 30%;
    }
    .width-80 {
      width: 80px;
    }
  }
  .bearing-table-box {
    width: 100%;
    // height: 100%;
    min-height: 697px;
    margin-top: 20px;
    .bearing-table {
      margin-top: 20px;
    }
    .upload-demo {
      display: inline-block;
    }
  }
}
</style>
