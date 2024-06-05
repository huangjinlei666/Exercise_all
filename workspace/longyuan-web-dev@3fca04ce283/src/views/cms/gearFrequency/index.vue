<template>
  <div id="gearFrequency">
    <div class="gearFrequency-table-box cms-card">
      <div class="title-box">
        <div class="top-title">
          {{ $t('frequencyCount.frequencyCountDB') }}
        </div>
      </div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane :label="$t('gearFrequency.titleOne')" name="first">
          <el-radio-group v-model="radio">
            <el-radio :label="1">{{ $t('gearFrequency.forwardPush') }}</el-radio>
            <el-radio :label="2">{{ $t('gearFrequency.pushBack') }}</el-radio>
          </el-radio-group>
          <div class="top-box">
            <div v-if="radio === 1">
              <el-button size="medium" type="primary" @click="handleQuery()">
                {{ $t('common.query') }}
              </el-button>
            </div>
            <div v-if="radio === 2">
              <el-button size="medium" type="primary" @click="unHandleQuery()">
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
              class="demo-ruleForm"
              autocomplete="off"
              size="medium"
              :inline-message="true"
            >
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.sunGear') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.sunGear"
                    :placeholder="$t('gearFrequency.placeholder.sunGear')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.planetGear') + ':'" v-if="radio === 1">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.planetGear"
                    :placeholder="$t('gearFrequency.placeholder.planetGear')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.internalGear') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.internalGear"
                    :placeholder="$t('gearFrequency.placeholder.internalGear')"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.lowSpeedLargr') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.lowSpeedLargr"
                    :placeholder="$t('gearFrequency.placeholder.lowSpeedLargr')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.middleSmall') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.middleSmall"
                    :placeholder="$t('gearFrequency.placeholder.middleSmall')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.middleLarge') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.middleLarge"
                    :placeholder="$t('gearFrequency.placeholder.middleLarge')"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.highSpeedSmall') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.highSpeedSmall"
                    :placeholder="$t('gearFrequency.placeholder.highSpeedSmall')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.inputSpeed') + ':'" v-if="radio === 1">
                  <el-input
                    class="width-200 input-with-select"
                    v-model="ruleForm.inputSpeed"
                    :placeholder="$t('gearFrequency.placeholder.inputSpeed')"
                  >
                    <template slot="append">rpm</template>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.harmonic') + ':'" v-if="radio === 1">
                  <el-input
                    class="width-200"
                    v-model.number="ruleForm.times"
                    :placeholder="$t('gearFrequency.placeholder.inputHarmonic')"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.outputSpeed') + ':'" v-if="radio === 1">
                  <el-input class="width-200" v-model.number="ruleForm.outputSpeed" :disabled="true">
                    <template slot="append">rpm</template>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.transmissionRatio') + ':'">
                  <el-input
                    class="width-200"
                    v-model="ruleForm.transmissionRatio"
                    :placeholder="$t('gearFrequency.placeholder.transmissionRatio')"
                  ></el-input
                ></el-form-item>
                <!-- <el-form-item :label="$t('gearFrequency.series')"> - - </el-form-item> -->
              </div>
            </el-form>
          </div></el-tab-pane
        >
        <el-tab-pane :label="$t('gearFrequency.titleTwo')" name="second">
          <el-radio-group v-model="radioTwo">
            <el-radio :label="3">{{ $t('gearFrequency.forwardPush') }}</el-radio>
            <el-radio :label="4">{{ $t('gearFrequency.pushBack') }}</el-radio>
          </el-radio-group>
          <div class="top-box">
            <div v-if="radioTwo === 3">
              <el-button size="medium" type="primary" @click="twoHandleQuery()">
                {{ $t('common.query') }}
              </el-button>
            </div>
            <div v-if="radioTwo === 4">
              <el-button size="medium" type="primary" @click="twoUnHandleQuery()">
                {{ $t('common.query') }}
              </el-button>
            </div>
          </div>
          <div class="top-form">
            <el-form
              v-loading="loading"
              :model="ruleFormTwo"
              ref="ruleFormTwo"
              label-width="150px"
              class="demo-ruleForm"
              autocomplete="off"
              size="medium"
              :inline-message="true"
            >
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.primarySun') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.sunGear"
                    :placeholder="$t('gearFrequency.placeholder.primarySun')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.primaryPlanet') + ':'" v-if="radioTwo === 3">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.planetGear"
                    :placeholder="$t('gearFrequency.placeholder.primaryPlanet')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.PrimaryInternal') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.internalGear"
                    :placeholder="$t('gearFrequency.placeholder.PrimaryInternal')"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.secondarySun') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.secondarySun"
                    :placeholder="$t('gearFrequency.placeholder.secondarySun')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.secondaryPlanet') + ':'" v-if="radioTwo === 3">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.secondaryPlanet"
                    :placeholder="$t('gearFrequency.placeholder.secondaryPlanet')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.secondInternal') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.secondInternal"
                    :placeholder="$t('gearFrequency.placeholder.secondInternal')"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.middleLarge') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.middleLarge"
                    :placeholder="$t('gearFrequency.placeholder.middleLarge')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.highSpeedSmall') + ':'">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.highSpeedSmall"
                    :placeholder="$t('gearFrequency.placeholder.highSpeedSmall')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.inputSpeed') + ':'" v-if="radioTwo === 3">
                  <el-input
                    class="width-200 input-with-select"
                    v-model="ruleFormTwo.inputSpeed"
                    :placeholder="$t('gearFrequency.placeholder.inputSpeed')"
                  >
                    <template slot="append">rpm</template>
                  </el-input>
                </el-form-item>
              </div>
              <div class="formDiv">
                <el-form-item :label="$t('gearFrequency.harmonic') + ':'" v-if="radioTwo === 3">
                  <el-input
                    class="width-200"
                    v-model.number="ruleFormTwo.times"
                    :placeholder="$t('gearFrequency.placeholder.inputHarmonic')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.outputSpeed') + ':'" v-if="radioTwo === 3">
                  <el-input class="width-200" v-model.number="ruleFormTwo.outputSpeed" :disabled="true">
                    <template slot="append">rpm</template>
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('gearFrequency.transmissionRatio') + ':'">
                  <el-input
                    class="width-200"
                    v-model="ruleFormTwo.transmissionRatio"
                    :placeholder="$t('gearFrequency.placeholder.transmissionRatio')"
                  ></el-input
                ></el-form-item>
                <!-- <el-form-item :label="$t('gearFrequency.series')"> - - </el-form-item> -->
              </div>
            </el-form>
          </div></el-tab-pane
        >
      </el-tabs>
    </div>
    <div class="bearing-table-box cms-card" v-if="activeName === 'first' && radio === 1">
      <p class="table-title" style="font-weight: bolder">
        {{ $t('gearFrequency.calculationResults') }}
      </p>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('gearFrequency.frequencyDoubling')" type="index" width="200"> </el-table-column>
          <el-table-column :label="$t('gearFrequency.PlanetaryMeshingFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.PlanetaryMeshingFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearFrequency.middleMeshingFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.middleMeshingFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearFrequency.highSpeedMeshingFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.highSpeedMeshingFrequency }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="bearing-table-box cms-card" v-if="activeName === 'second' && radioTwo === 3">
      <p class="table-title" style="font-weight: bolder">
        {{ $t('gearFrequency.calculationResults') }}
      </p>
      <div class="bearing-table">
        <el-table
          :data="tableDataTwo"
          :border="false"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('gearFrequency.frequencyDoubling')" type="index" width="200"> </el-table-column>
          <el-table-column :label="$t('gearFrequency.primaryPlanetaryMeshing')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.PlanetaryMeshingFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearFrequency.secondPlanetaryMeshing')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.middleMeshingFrequency }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearFrequency.highSpeedMeshingFrequency')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.highSpeedMeshingFrequency }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'gearFrequency',
  data() {
    return {
      loading: false,
      activeName: 'first',
      radio: 1,
      radioTwo: 3,
      tableData: [],
      tableDataTwo: [],
      outputSpeed: '- -',
      ruleForm: {
        sunGear: '',
        planetGear: '',
        internalGear: '',
        middleLarge: '',
        middleSmall: '',
        lowSpeedLargr: '',
        highSpeedSmall: '',
        times: '',
        inputSpeed: '',
        outputSpeed: '',
        transmissionRatio: '',
      },
      ruleFormTwo: {
        sunGear: '',
        planetGear: '',
        internalGear: '',
        secondarySun: '',
        secondaryPlanet: '',
        secondInternal: '',
        middleLarge: '',
        highSpeedSmall: '',
        times: '',
        inputSpeed: '',
        outputSpeed: '',
        transmissionRatio: '',
      },
      dataNum: 6,
    };
  },
  watch: {
    activeName(n, o) {
      console.log(n);
    },
    radio(n, o) {
      if (n !== o) {
        this.tableData = [];
        this.ruleForm.sunGear = '';
        this.ruleForm.planetGear = '';
        this.ruleForm.internalGear = '';
        this.ruleForm.middleLarge = '';
        this.ruleForm.middleSmall = '';
        this.ruleForm.lowSpeedLargr = '';
        this.ruleForm.highSpeedSmall = '';
        this.ruleForm.times = '';
        this.ruleForm.inputSpeed = '';
        this.ruleForm.outputSpeed = '';
        this.ruleForm.transmissionRatio = '';
      }
    },
    radioTwo(n, o) {
      if (n !== o) {
        this.tableDataTwo = [];
        this.ruleFormTwo.sunGear = '';
        this.ruleFormTwo.planetGear = '';
        this.ruleFormTwo.internalGear = '';
        this.ruleFormTwo.secondarySun = '';
        this.ruleFormTwo.secondaryPlanet = '';
        this.ruleFormTwo.secondInternal = '';
        this.ruleFormTwo.middleLarge = '';
        this.ruleFormTwo.highSpeedSmall = '';
        this.ruleFormTwo.times = '';
        this.ruleFormTwo.inputSpeed = '';
        this.ruleFormTwo.outputSpeed = '';
        this.ruleFormTwo.transmissionRatio = '';
      }
    },
  },
  methods: {
    twoUnHandleQuery() {
      // eslint-disable-next-line radix
      const Z1 = parseInt(this.ruleFormTwo.sunGear);
      // const Z2 = this.ruleFormTwo.planetGear;
      // eslint-disable-next-line radix
      const Z3 = parseInt(this.ruleFormTwo.internalGear);
      // eslint-disable-next-line radix
      const Z4 = parseInt(this.ruleFormTwo.secondarySun);
      // const Z5 = this.ruleFormTwo.secondaryPlanet;
      // eslint-disable-next-line radix
      const Z6 = parseInt(this.ruleFormTwo.secondInternal);
      // eslint-disable-next-line radix
      const Z7 = parseInt(this.ruleFormTwo.middleLarge);
      // eslint-disable-next-line radix
      const Z8 = parseInt(this.ruleFormTwo.highSpeedSmall);
      // eslint-disable-next-line radix
      const i = this.ruleFormTwo.transmissionRatio;
      // if (!i) {
      //   this.$message.error(this.$t('gearFrequency.placeholder.transmissionRatio'));
      //   return;
      // }

      if (i && !Number(i)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.transmissionRatioNum'),
          type: 'warning',
        });
        return;
      }
      if (Z1 && !Number(Z1)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primarySunNum'),
          type: 'warning',
        });

        return;
      }
      if (Z3 && !Number(Z3)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primaryPlanetNum'),
          type: 'warning',
        });

        return;
      }
      if (Z4 && !Number(Z4)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondarySunNum'),
          type: 'warning',
        });

        return;
      }
      if (Z6 && !Number(Z6)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondInternalNum'),
          type: 'warning',
        });

        return;
      }
      if (Z7 && !Number(Z7)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLargeNum'),
          type: 'warning',
        });

        return;
      }
      if (Z8 && !Number(Z8)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmallNum'),
          type: 'warning',
        });

        return;
      }
      if (!Z1 && Z3 && Z4 && Z6 && Z7 && Z8 && i) {
        this.ruleFormTwo.sunGear = Math.abs(((Z4 + Z6) * Z3 * Z7) / (i * Z4 * Z8 - (Z4 + Z6) * Z7)).toFixed(2);
        return;
      }
      if (!Z3 && Z1 && Z4 && Z6 && Z7 && Z8 && i) {
        this.ruleFormTwo.internalGear = Math.abs((i * Z1 * Z4 * Z8 - (Z4 + Z6) * Z7 * Z1) / ((Z4 + Z6) * Z7)).toFixed(
          2
        );
        return;
      }
      if (!Z4 && Z1 && Z3 && Z6 && Z7 && Z8 && i) {
        this.ruleFormTwo.secondarySun = Math.abs(((Z1 + Z3) * Z6 * Z7) / (i * Z1 * Z8 - (Z1 + Z3) * Z7)).toFixed(2);
        return;
      }
      if (!Z6 && Z1 && Z3 && Z4 && Z7 && Z8 && i) {
        this.ruleFormTwo.secondInternal = Math.abs((i * Z1 * Z4 * Z8 - (Z1 + Z3) * Z4 * Z7) / ((Z1 + Z3) * Z7)).toFixed(
          2
        );
        return;
      }
      if (!Z7 && Z1 && Z3 && Z4 && Z6 && Z8 && i) {
        this.ruleFormTwo.middleLarge = Math.abs((i * Z1 * Z4 * Z8) / ((Z1 + Z3) * (Z4 + Z6))).toFixed(2);
        return;
      }
      if (!Z8 && Z1 && Z3 && Z4 && Z6 && Z7 && i) {
        this.ruleFormTwo.highSpeedSmall = Math.abs(((Z1 + Z3) * (Z1 + Z6) * Z7) / (Z1 * Z4 * i)).toFixed(2);
        return;
      }
      if (!Z1 && !Z3 && !Z4 && !Z6 && !Z7 && !i && !Z8 && i) {
        this.$message({
          message: this.$t('gearFrequency.required'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.required'));
        return;
      }
      if (Z1 && Z3 && Z4 && Z6 && Z7 && i && Z8 && i) {
        this.$message({
          message: this.$t('gearFrequency.existence'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.existence'));
        return;
      }
      if (!Z1 || !Z3 || !Z4 || !Z6 || !Z7 || !Z8 || !i) {
        this.$message({
          message: this.$t('gearFrequency.required'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.required'));
        return;
      }
      console.log(1);
    },
    twoHandleQuery() {
      this.tableDataTwo = [];
      const Z1 = this.ruleFormTwo.sunGear;
      const Z2 = this.ruleFormTwo.planetGear;
      const Z3 = this.ruleFormTwo.internalGear;
      const Z4 = this.ruleFormTwo.secondarySun;
      const Z5 = this.ruleFormTwo.secondaryPlanet;
      const Z6 = this.ruleFormTwo.secondInternal;
      const Z7 = this.ruleFormTwo.middleLarge;
      const Z8 = this.ruleFormTwo.highSpeedSmall;
      const R = this.ruleFormTwo.inputSpeed;
      const N = this.ruleFormTwo.times;
      if (!Z1) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primarySun'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.primarySun'));
        return;
      }
      if (Z1 && !Number(Z1)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primarySunNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.primarySunNum'));
        return;
      }
      if (!Z2) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primaryPlanet'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.primaryPlanet'));
        return;
      }
      if (Z2 && !Number(Z2)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.primaryPlanetNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.primaryPlanetNum'));
        return;
      }
      if (!Z3) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.PrimaryInternal'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.PrimaryInternal'));
        return;
      }
      if (Z3 && !Number(Z3)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.PrimaryInternalNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.PrimaryInternalNum'));
        return;
      }
      if (!Z4) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondarySun'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondarySun'));
        return;
      }
      if (Z4 && !Number(Z4)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondarySunNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondarySunNum'));
        return;
      }
      if (!Z5) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondaryPlanet'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondaryPlanet'));
        return;
      }
      if (Z5 && !Number(Z5)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondaryPlanetNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondaryPlanetNum'));
        return;
      }
      if (!Z6) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondInternal'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondInternal'));
        return;
      }
      if (Z6 && !Number(Z6)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.secondInternalNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.secondInternalNum'));
        return;
      }
      if (!Z7) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLarge'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleLarge'));
        return;
      }
      if (Z7 && !Number(Z7)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLargeNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleLargeNum'));
        return;
      }
      if (!Z8) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmall'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.highSpeedSmall'));
        return;
      }
      if (Z8 && !Number(Z8)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmallNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.highSpeedSmallNum'));
        return;
      }
      if (!R) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputSpeed'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputSpeed'));
        return;
      }
      if (R && !Number(R)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputSpeedNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputSpeedNum'));
        return;
      }
      if (!N) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonic'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonic'));
        return;
      }
      if (N && !Number(N)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonicNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonicNum'));
        return;
      }
      if (N > 5) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonic5'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonic5'));
        return;
      }
      const i = (((Z1 + Z3) / Z1) * ((Z4 + Z6) / Z4) * (Z7 / Z8)).toFixed(2);
      const R1 = (i * R).toFixed(2);
      this.ruleFormTwo.transmissionRatio = i;
      this.ruleFormTwo.outputSpeed = R1;
      const f1 = (((Z1 + Z3) / Z1 - 1) * (R / 60) * Z1).toFixed(2);
      // const f2 = ((((Z1 + Z3) / Z1) * ((Z4 + Z6) / Z4) - 1) * ((Z1 + Z3) / Z1) * (R / 60) * Z4).toFixed(2);
      const f2 = (((((Z4 + Z6) / Z4 - 1) * (Z1 + Z3)) / Z1) * (R / 60) * Z4).toFixed(2);
      const f3 = i * (R / 60) * Z8;
      for (let j = 0; j < N; j += 1) {
        const obj = {};
        obj.PlanetaryMeshingFrequency = (f1 * (j + 1)).toFixed(2);
        obj.middleMeshingFrequency = (f2 * (j + 1)).toFixed(2);
        obj.highSpeedMeshingFrequency = (f3 * (j + 1)).toFixed(2);
        this.tableDataTwo.push(obj);
      }
    },
    handleQuery() {
      this.tableData = [];
      const Z1 = this.ruleForm.sunGear;
      const Z2 = this.ruleForm.planetGear;
      const Z3 = this.ruleForm.internalGear;
      const Z4 = this.ruleForm.lowSpeedLargr;
      const Z5 = this.ruleForm.middleSmall;
      const Z6 = this.ruleForm.middleLarge;
      const Z7 = this.ruleForm.highSpeedSmall;
      const R = this.ruleForm.inputSpeed;
      const N = this.ruleForm.times;
      if (!Z1) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.sunGear'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.sunGear'));
        return;
      }
      if (Z1 && !Number(Z1)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.sunGearNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.sunGearNum'));
        return;
      }
      if (!Z2) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.planetGear'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.planetGear'));
        return;
      }
      if (Z2 && !Number(Z2)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.planetGearNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.planetGearNum'));
        return;
      }
      if (!Z3) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.internalGear'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.internalGear'));
        return;
      }
      if (Z3 && !Number(Z3)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.internalGearNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.internalGearNum'));
        return;
      }
      if (!Z6) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLarge'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleLarge'));
        return;
      }
      if (Z6 && !Number(Z6)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLargeNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleLargeNum'));
        return;
      }
      if (!Z5) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleSmall'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleSmall'));
        return;
      }
      if (Z5 && !Number(Z5)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleSmallNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleSmallNum'));
        return;
      }
      if (!Z4) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.lowSpeedLargr'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.lowSpeedLargr'));
        return;
      }
      if (Z4 && !Number(Z4)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.lowSpeedLargrNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.lowSpeedLargrNum'));
        return;
      }
      if (!Z7) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmall'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.highSpeedSmall'));
        return;
      }
      if (Z7 && !Number(Z7)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmallNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.highSpeedSmallNum'));
        return;
      }
      if (!N) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonic'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonic'));
        return;
      }
      if (N && !Number(N)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonicNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonicNum'));
        return;
      }
      if (N > 5) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputHarmonic5'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputHarmonic5'));
        return;
      }
      if (!R) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputSpeed'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputSpeed'));
        return;
      }
      if (R && !Number(R)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.inputSpeedNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.inputSpeedNum'));
        return;
      }
      const i = (((Z1 + Z3) / Z1) * (Z4 / Z5) * (Z6 / Z7)).toFixed(2);
      const R1 = (i * R).toFixed(2);
      this.ruleForm.transmissionRatio = i;
      this.ruleForm.outputSpeed = R1;
      const f1 = (((Z1 + Z3) / Z1 - 1) * (R / 60) * Z1).toFixed(2);
      const f2 = (((Z1 + Z3) / Z1) * (R / 60) * Z4).toFixed(2);
      const f3 = (i * (R / 60) * Z7).toFixed(2);
      for (let j = 0; j < N; j += 1) {
        const obj = {};
        obj.PlanetaryMeshingFrequency = f1 * (j + 1);
        obj.middleMeshingFrequency = f2 * (j + 1);
        obj.highSpeedMeshingFrequency = f3 * (j + 1);
        this.tableData.push(obj);
      }
    },
    unHandleQuery() {
      // eslint-disable-next-line radix
      const Z1 = parseInt(this.ruleForm.sunGear);
      // eslint-disable-next-line radix
      const Z3 = parseInt(this.ruleForm.internalGear);
      // eslint-disable-next-line radix
      const Z4 = parseInt(this.ruleForm.lowSpeedLargr);
      // eslint-disable-next-line radix
      const Z5 = parseInt(this.ruleForm.middleSmall);
      // eslint-disable-next-line radix
      const Z6 = parseInt(this.ruleForm.middleLarge);
      // eslint-disable-next-line radix
      const Z7 = parseInt(this.ruleForm.highSpeedSmall);
      const i = this.ruleForm.transmissionRatio;

      // if (!i) {
      //   this.$message.error(this.$t('gearFrequency.placeholder.transmissionRatio'));
      //   return;
      // }
      if (i && !Number(i)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.transmissionRatioNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.transmissionRatioNum'));
        return;
      }
      if (Z1 && !Number(Z1)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.sunGearNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.sunGearNum'));
        return;
      }
      if (Z3 && !Number(Z3)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.internalGearNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.internalGearNum'));
        return;
      }
      if (Z4 && !Number(Z4)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.lowSpeedLargrNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.lowSpeedLargrNum'));
        return;
      }
      if (Z5 && !Number(Z5)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleSmallNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleSmallNum'));
        return;
      }
      if (Z6 && !Number(Z6)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.middleLargeNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.middleLargeNum'));
        return;
      }
      if (Z7 && !Number(Z7)) {
        this.$message({
          message: this.$t('gearFrequency.placeholder.highSpeedSmallNum'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.placeholder.highSpeedSmallNum'));
        return;
      }
      if (!Z1 && Z3 && Z4 && Z5 && Z6 && Z7) {
        this.ruleForm.sunGear = Math.abs((Z3 * Z4 * Z6) / (i * Z5 * Z7 - Z4 * Z6)).toFixed(2);
        return;
      }
      if (!Z3 && Z1 && Z4 && Z5 && Z6 && Z7) {
        this.ruleForm.internalGear = Math.abs((i * Z1 * Z7 * Z5 - Z1 * Z4 * Z6) / (Z4 * Z6)).toFixed(2);
        return;
      }
      if (!Z6 && Z3 && Z1 && Z5 && Z4 && Z7) {
        this.ruleForm.middleLarge = Math.abs((i * Z1 * Z5 * Z7) / ((Z1 + Z3) * Z4)).toFixed(2);
        return;
      }
      if (!Z5 && Z3 && Z4 && Z1 && Z6 && Z7) {
        this.ruleForm.middleSmall = Math.abs(((Z1 + Z3) * Z4 * Z6) / (i * Z1 * Z7)).toFixed(2);
        return;
      }
      if (!Z4 && Z3 && Z6 && Z5 && Z1 && Z7) {
        this.ruleForm.lowSpeedLargr = Math.abs((i * Z5 * Z1 * Z7) / ((Z1 + Z3) * Z6)).toFixed(2);
        return;
      }
      if (!Z7 && Z3 && Z4 && Z5 && Z6 && Z1) {
        this.ruleForm.highSpeedSmall = Math.abs(((Z1 + Z3) * Z4 * Z6) / (i * Z5 * Z1)).toFixed(2);
        return;
      }
      if (!Z1 && !Z3 && !Z4 && !Z5 && !Z6 && !Z7 && !i) {
        this.$message({
          message: this.$t('gearFrequency.required'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.required'));
        return;
      }
      if (Z1 && Z3 && Z4 && Z5 && Z6 && Z7 && i) {
        this.$message({
          message: this.$t('gearFrequency.existence'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.existence'));
        return;
      }
      if (!Z1 || !Z3 || !Z4 || !Z5 || !Z6 || !Z7 || !i) {
        this.$message({
          message: this.$t('gearFrequency.required'),
          type: 'warning',
        });
        // this.$message.error(this.$t('gearFrequency.required'));
        return;
      }
      console.log(1);
    },
  },
};
</script>
<style lang="less" scoped>
#gearFrequency {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .top-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .top-title {
      font-size: 16px;
      font-weight: bolder;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .title-box {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
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
