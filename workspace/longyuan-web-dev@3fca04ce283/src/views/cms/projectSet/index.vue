<template>
  <div id="project-set">
    <div class="cms-card d2-mb-10">
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <span class="cms-module-title">{{ $t('pass.passInfo') }}</span>
        </div>
        <div class="pull-right">
          <!-- 添加按钮 -->
          <el-button
            v-if="hierarchy.type && hierarchy.type !== 'MACHINE' && hierarchy.type !== 'SENSOR'"
            type="primary"
            size="medium"
            @click="handleAdd"
          >
            <!-- 新增集团 -->
            <span v-if="hierarchy.type === 'ROOT'">{{ $t('projectSet.addProject') }}</span>
            <!-- 新增区域公司 -->
            <span v-if="hierarchy.type === 'PROJECT'">{{ $t('projectSet.addFactory') }}</span>
            <!-- 新增风场 -->
            <span v-if="hierarchy.type === 'FACTORY'">{{ $t('projectSet.addWorkshop') }}</span>
            <!-- 新增风机 -->
            <span v-if="hierarchy.type === 'WORKSHOP'">{{ $t('projectSet.addMachine') }}</span>
          </el-button>
          <!-- 编辑按钮 -->
          <el-button
            v-if="!isShowSensor && hierarchy.type && hierarchy.type !== 'ROOT' && hierarchy.type !== 'SENSOR'"
            type="primary"
            size="medium"
            @click="handleEdit"
            >{{ $t('common.edit') }}</el-button
          >
          <el-button v-if="isShowSensor" type="primary" size="medium" @click="editSensor">{{
            $t('common.edit')
          }}</el-button>
          <el-button
            v-if="hierarchy.type && ['MACHINE'].includes(hierarchy.type)"
            type="primary"
            size="medium"
            @click="handleShowLog"
            >{{ $t('projectSet.onlineHistory') }}</el-button
          >
          <!-- 删除按钮 -->
          <el-button
            v-if="
              (hierarchy.type &&
                hierarchy.type !== 'SENSOR' &&
                hierarchy.type !== 'ROOT' &&
                hierarchy.type !== 'WORKSHOP' &&
                (!hierarchy.hierarchies || hierarchy.hierarchies.length === 0)) ||
              hierarchy.type === 'MACHINE'
            "
            type="primary"
            size="medium"
            @click="handleDelete"
            >{{ $t('common.delete') }}</el-button
          >
          <!-- 同步数据到集团按钮 -->
          <el-button
            v-if="info && info.roleName === 'Administrator' && hierarchy.type && hierarchy.type === 'WORKSHOP'"
            type="primary"
            size="medium"
            @click="handleSync"
            >{{ $t('common.sync') }}</el-button
          >
        </div>
      </div>
      <el-form label-suffix=":" label-width="80px" label-position="left">
        <!-- 根目录 -->
        <span v-if="hierarchy.type === 'ROOT'" class="color-primary">{{ $t('projectSet.rootTip') }}</span>
        <!-- 项目 -->
        <span v-if="hierarchy.type === 'PROJECT'">
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.projectName')">
                <span>{{ hierarchy.name || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.customerName')">
                <template
                  v-if="
                    hierarchy.additionalInfo &&
                    projectSelectArr.find((i) => i.value === hierarchy.additionalInfo.customerName)
                  "
                >
                  <span>{{
                    $t(projectSelectArr.find((i) => i.value === hierarchy.additionalInfo.customerName).label)
                  }}</span>
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.projectDesc')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.description) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
        <!-- 厂站 -->
        <span v-if="hierarchy.type === 'FACTORY'">
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.factoryName')">
                <span>{{ hierarchy.name || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.location')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.location) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
        <!-- 车间 -->
        <span v-if="!isShowSensor && hierarchy.type === 'WORKSHOP'">
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.workshopName')">
                <span>{{ hierarchy.name || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.address')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.address) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.longitude')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.longitude) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.latitude')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.latitude) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
        <!-- 机组 -->
        <span v-if="!isShowSensor && hierarchy.type === 'MACHINE'">
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.workGroupName')">
                <span>{{ hierarchy.name || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.workGroupType')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.workGroupType) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.workGroupModel')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.workGroupModel) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('pass.criticalSpeed1')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.criticalSpeed1) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.criticalSpeed2')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.criticalSpeed2) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('pass.criticalSpeed')">
                <span>{{ (hierarchy.additionalInfo && hierarchy.additionalInfo.criticalSpeed) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('projectSet.gatewayDeviceNumber')">
                <span>{{ hierarchy.deviceNumber || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('equipmentMng.speedRatio')">
                <span>{{ (hierarchy.metadata && hierarchy.metadata.speedRatio) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('equipmentMng.speedPoint')">
                <span>{{ (hierarchy.metadata && hierarchy.metadata.speedMeasuringPoint) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('equipmentMng.pulsesPerweek')">
                <span>{{ (hierarchy.metadata && hierarchy.metadata.pulseOfWeek) || '--' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('equipmentMng.masterIp')">
                <span>{{ (hierarchy.metadata && hierarchy.metadata.masterIp) || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
        <span v-if="isShowSensor">
          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('equipmentMng.snCode')">
                <span>{{ snCode }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
      </el-form>
    </div>
    <div id="config-info-box" class="cms-card">
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <span class="cms-module-title">{{ $t('projectSet.configInfo') }}</span>
          <span class="d2-ml-10">
            (
            <span v-if="hierarchy && hierarchy.id && hierarchy.type === 'MACHINE'" class="color-primary">{{
              $t('common.selectedMachine') + hierarchy.name
            }}</span>
            <span v-else class="color-error">{{ $t('common.noSelectedMachine') }}</span>
            )
          </span>
        </div>
        <div class="pull-right">
          <!-- 绑定数采 -->
          <el-tooltip
            class="item"
            effect="dark"
            :content="hierarchy.type !== 'MACHINE' ? $t('projectSet.workGroup') : $t('projectSet.noSupportChange')"
            placement="top-end"
            :disabled="!hierarchy.deviceNumber && hierarchy.type === 'MACHINE'"
            :open-delay="500"
          >
            <el-button
              type="primary"
              size="medium"
              :class="{ 'btn-disable': hierarchy.deviceNumber || hierarchy.type !== 'MACHINE' }"
              @click="openDataAcquisitionModal"
              >{{ $t('projectSet.bindDataAcquisition') }}</el-button
            >
          </el-tooltip>
          <!-- 从塔斯云同步风机下的设备信息 -->
          <el-tooltip
            class="item"
            effect="dark"
            :content="
              hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber ? '' : $t('projectSet.syncDeviceInfoFromTass')
            "
            placement="top-end"
            :disabled="syncLoading || hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber"
            :open-delay="500"
          >
            <el-button
              type="primary"
              size="medium"
              :class="{ 'btn-disable': syncLoading || hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber }"
              @click="syncDeviceInfoFromTass"
              >{{ $t('projectSet.syncDeviceInfo') }}
            </el-button>
          </el-tooltip>
          <!-- 同步设备配置信息到集团 -->
          <el-tooltip
            class="item"
            effect="dark"
            :content="hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber ? '' : $t('projectSet.syncConfigToGroup')"
            placement="top-end"
            :disabled="syncLoading || hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber"
            :open-delay="500"
          >
            <el-button
              type="primary"
              size="medium"
              :class="{ 'btn-disable': syncLoading || hierarchy.type !== 'MACHINE' || !hierarchy.deviceNumber }"
              @click="syncConfigToGroup"
              >{{ $t('projectSet.syncConfig') }}
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="config-box clearfix">
        <div class="sensor-container" v-loading="showSensorList">
          <d2-container better-scroll>
            <template v-if="sensorList.length > 0">
              <div v-for="item in sensorList" :key="item.id">
                <div class="factory-name d2-mb-10">{{ item.name }}</div>
                <div class="factory-list-box d2-mb-15" v-if="item.variates && item.variates.length > 0">
                  <template v-for="subItem in item.variates">
                    <cms-status-card
                      :key="subItem.identifier"
                      :item="subItem"
                      :sensorId="item.id"
                      @handleRelease="handleReleaseSensor"
                    ></cms-status-card>
                  </template>
                </div>
              </div>
            </template>
          </d2-container>
          <cms-nodata v-if="sensorList.length === 0" :message="$t('overview.noSensorData')"></cms-nodata>
        </div>
        <div class="model-box">
          <GeneralChart />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { passTypes, projectArr } from '@/util/selectTypes';
import { extractWorkshopId, processConfig } from '@/util/commonService';
import d2Container from '@/components/d2-container/index';
import CmsNodata from '@/components/cms-nodata/index.vue';
import CmsStatusCard from '@/components/cms-status-card/index.vue';
import GeneralChart from '@/components/general/index.vue';
import passDeleteModal from './passDeleteModal.vue';
import passAddModal from './passAddModal.vue';
import sensorEditModal from './sensorEditModal.vue';
import onlineHistoryModalVue from './onlineHistoryModal.vue';

// import ModelSelectModal from './modelSelectModal.vue';
import DataAcquisitionModal from './bindDataAcquisitionModal.vue';

export default {
  name: 'projectSet',
  components: {
    d2Container,
    CmsNodata,
    CmsStatusCard,
    GeneralChart,
  },
  data() {
    return {
      showSensorList: false,
      sensorList: [],
      configParam: [],
      // modelList: [], // 模型列表
      // modelName: '', // 所选模型
      projectSelectArr: projectArr,
      syncLoading: false,
      deviceData: {},
      snCode: '',
      id: '',
      isShowSensor: false,
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
    ...mapState('cms/pass', ['passList', 'hierarchy', 'passSensor']),
    ...mapState('cms/general', ['configReceived', 'sensorId', 'identifier', 'location']),
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        // this.getModelName(value);
        if (!value || !value.id) {
          return;
        }
        console.log(value, oldValue);
        // this.deviceData = value;
        // this.id = value.id;
        if (value.type !== 'MACHINE') {
          // this.getSensor();
          this.sensorList = [];
          this.saveConfig([]);
          return;
        }
        // if (value.type === 'SENSOR') {
        //   alert(1);
        // }
        this.initFetch(value.id);
      },
      immediate: true,
    },
    configReceived: {
      handler(value, oldValue) {
        if (this.hierarchy.type !== 'MACHINE') {
          this.saveGeneralInit();
          return;
        }
        if (!value) {
          this.saveGeneralInit();
          return;
        }

        const flag = this.judgeToPutConfig(this.location, this.sensorId, this.identifier);
        if (!flag) {
          this.saveGeneralInit();
          return;
        }

        this.configParam.push({
          location: this.location,
          sensorId: this.sensorId,
          identifier: this.identifier,
        });
        this.putGeneralConfig(this.hierarchy.id, this.configParam);
      },
    },
    // 监测选中的是否是传感器
    passSensor: {
      handler(val) {
        this.deviceData = val;
        this.id = val.id;
        this.isShowSensor = !!(val && val.type === 'SENSOR');
        if (this.id) {
          this.getSensor();
        }
      },
    },
  },
  mounted() {
    // console.log(this.deviceData);
    // if (this.deviceData.type === 'SENSOR') {
    //   this.getSensor(this.deviceData.id);
    // }
  },
  methods: {
    ...mapMutations({
      saveGeneralInit: 'cms/general/saveGeneralInit',
      saveConfig: 'cms/general/saveConfig',
    }),
    ...mapActions('cms/pass', ['fetchPassInfo']),
    // 同个传感器下的变量，不能绑定不同的位置
    judgeToPutConfig(location, sensorId) {
      const locationArr = this.configParam.filter((e) => e.sensorId === sensorId).map((i) => i.location);
      if (locationArr.some((i) => i !== location)) {
        this.$msg.error(this.$t('projectSet.noDifferentLocation'));
        return false;
      }
      return true;
    },
    getSensor() {
      const id = this.id;
      this.$api.screen
        .getMachineDevice(id)
        .then((res) => {
          if (!res) {
            return;
          }
          console.log(res);
          if (!res.data.metadata || !res.data.metadata.snCode || !res.data) {
            this.snCode = '--';
            return;
          }
          this.snCode = res.data.metadata.snCode;
          // data.metadata = res.data.metadata;
        })
        .catch((err) => {
          // this.$msg.error(err);
        })
        .finally(() => {});
    },
    openDataAcquisitionModal() {
      if (this.hierarchy.type !== 'MACHINE' || this.hierarchy.deviceNumber) {
        return;
      }
      const title = this.$t('projectSet.bindDataAcquisition');
      const winData = {
        machineId: this.hierarchy.id,
        deviceNumber: this.hierarchy.deviceNumber,
      };
      this.$modal.show(title, DataAcquisitionModal, winData, '700px', this.getTreeList);
    },
    handleReleaseSensor($event) {
      if (this.hierarchy.type !== 'MACHINE') {
        return;
      }
      if (!$event) {
        return;
      }
      this.configParam = this.configParam.filter(
        (item) => item.sensorId !== $event.sensorId || item.identifier !== $event.identifier
      );
      this.putGeneralConfig(this.hierarchy.id, this.configParam);
    },
    putGeneralConfig(machineId, param) {
      if (!machineId || !param) {
        return;
      }
      this.$api.projectSet
        .putGeneralMapConfig(machineId, param)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('projectSet.failure.config'));
            return;
          }
          this.$msg.success(this.$t('projectSet.success.config'));
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.saveGeneralInit();
          if (this.hierarchy.type !== 'MACHINE') {
            return;
          }
          this.initFetch(this.hierarchy.id);
        });
    },
    initFetch(machineId) {
      this.showSensorList = true;
      const workshopId = extractWorkshopId(this.passList, machineId);
      Promise.all([
        this.$api.projectSet.getSensorUnderHierarchy({ hierarchyId: machineId, workshopId }),
        this.$api.projectSet.getGeneralMapConfig(machineId),
      ])
        .then(([sensors, generals]) => {
          if (!sensors || sensors.length === 0) {
            this.sensorList = [];
          } else {
            this.sensorList = sensors;
          }
          if (!generals || generals.length === 0) {
            this.configParam = [];
          } else {
            this.configParam = generals;
          }
          if (this.sensorList.length > 0 && this.configParam.length > 0) {
            this.processSensorList(this.sensorList, this.configParam);
          }
        })
        .catch((err) => {
          this.$msg.error(err);
          this.sensorList = [];
          this.configParam = [];
        })
        .finally(() => {
          this.showSensorList = false;
          this.processConfigInfo(this.configParam, this.sensorList);
        });
    },
    processSensorList(sensorArr, configParamArr) {
      const sensorList = configParamArr.map((item) => item.sensorId);
      sensorArr.forEach((ele) => {
        if (sensorList.includes(ele.id) && ele.variates && ele.variates.length > 0) {
          const identifierList = configParamArr.filter((i) => i.sensorId === ele.id).map((item) => item.identifier);
          ele.variates.forEach((e) => {
            if (identifierList.includes(e.identifier)) {
              e.disable = true;
            }
          });
        }
      });
    },
    processConfigInfo(configParamArr, sensorArr) {
      const config = processConfig(configParamArr, sensorArr);
      this.saveConfig(config);
    },
    getTreeList() {
      this.fetchPassInfo().catch((err) => {
        this.$msg.error(err);
      });
    },
    computedType(type) {
      return passTypes[passTypes.indexOf(type) + 1];
    },
    handleAdd: debounce(
      function handleAdd() {
        const type = this.computedType(this.hierarchy.type);
        const winData = {
          oper: 'create',
          type,
          id: this.hierarchy.id,
        };
        let title = '';
        if (this.hierarchy.type === 'ROOT') {
          title = this.$t('projectSet.addProject');
        } else if (this.hierarchy.type === 'PROJECT') {
          title = this.$t('projectSet.addFactory');
        } else if (this.hierarchy.type === 'FACTORY') {
          title = this.$t('projectSet.addWorkshop');
        } else if (this.hierarchy.type === 'WORKSHOP') {
          title = this.$t('projectSet.addMachine');
        }
        this.$modal.show(title, passAddModal, winData, '600px', this.getTreeList);
      },
      300,
      { leading: true, trailing: false }
    ),
    editSensor() {
      const winData = {
        oper: 'edit',
        item: this.deviceData,
        snCode: this.snCode,
      };
      this.$modal.show(this.$t('projectSet.editSncode'), sensorEditModal, winData, '600px', this.getSensor);
    },
    handleEdit: debounce(
      function handleEdit() {
        this.$api.projectSet
          .getHierarchy(this.hierarchy.id)
          .then((res) => {
            if (!res || !res.id) {
              return;
            }
            const type = res.type;
            const winData = {
              oper: 'edit',
              type,
              id: res.id,
              pass: res,
              hierarchy: this.deviceData,
              metadata: this.hierarchy.metadata || {},
            };
            let title = '';
            if (this.hierarchy.type === 'PROJECT') {
              title = this.$t('projectSet.editProject');
            } else if (this.hierarchy.type === 'FACTORY') {
              title = this.$t('projectSet.editFactory');
            } else if (this.hierarchy.type === 'WORKSHOP') {
              title = this.$t('projectSet.editWorkshop');
            } else if (this.hierarchy.type === 'MACHINE') {
              title = this.$t('projectSet.editMachine');
            }
            this.$modal.show(title, passAddModal, winData, '600px', this.getTreeList);
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      300,
      { leading: true, trailing: false }
    ),
    handleDelete: debounce(
      function handleDelete() {
        const winData = {
          list: [cloneDeep(this.hierarchy)],
          text: {
            title: this.$t('pass.deleteTitle'),
            tip: this.$t('pass.deleteTip'),
          },
        };
        let title = '';
        if (this.hierarchy.type === 'PROJECT') {
          title = this.$t('projectSet.deleteProject');
        } else if (this.hierarchy.type === 'FACTORY') {
          title = this.$t('projectSet.deleteFactory');
        } else if (this.hierarchy.type === 'WORKSHOP') {
          title = this.$t('projectSet.deleteWorkshop');
        } else if (this.hierarchy.type === 'MACHINE') {
          title = this.$t('projectSet.deleteMachine');
        }
        this.$modal.show(title, passDeleteModal, winData, '550px', this.getTreeList);
      },
      300,
      { leading: true, trailing: false }
    ),
    handleShowLog() {
      const workshopId = extractWorkshopId(this.passList, this.hierarchy.id);
      const hierarchy = cloneDeep(this.hierarchy);
      const passSensor = cloneDeep(this.passSensor);
      const winData = { workshopId, hierarchy, passSensor };
      this.$modal.show(this.$t('projectSet.onlineHistory'), onlineHistoryModalVue, winData, '550px');
    },
    handleSync: debounce(
      async function handleSync() {
        const { success } = await this.$api.projectSet.syncDataToGroup();
        if (!success) {
          this.$msg.error(this.$t('projectSet.failure.sync'));
          return;
        }
        this.$msg.success(this.$t('projectSet.success.sync'));
      },
      300,
      { leading: true, trailing: false }
    ),
    syncDeviceInfoFromTass() {
      if (this.syncLoading || this.hierarchy.type !== 'MACHINE' || !this.hierarchy.deviceNumber) {
        return;
      }
      this.syncLoading = true;
      this.$api.projectSet
        .syncDeviceInfoFromTass(this.hierarchy.id)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('projectSet.failure.sync'));
            return;
          }
          this.$msg.success(this.$t('projectSet.success.sync'));
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.syncLoading = false;
        });
    },
    syncConfigToGroup() {
      if (this.syncLoading || this.hierarchy.type !== 'MACHINE' || !this.hierarchy.deviceNumber) {
        return;
      }
      this.syncLoading = true;
      const formData = new FormData();
      formData.append('hierarchyId', this.hierarchy.id);
      this.$api.projectSet
        .syncConfigToGroup(formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('projectSet.failure.sync'));
            return;
          }
          this.$msg.success(this.$t('projectSet.success.sync'));
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.syncLoading = false;
        });
    },
  },
};
</script>
<style lang="less">
#project-set {
  min-width: 1250px;
  padding-right: 20px;
  height: 100% !important;
  box-sizing: border-box;
  position: relative;
  .el-form {
    .el-form-item__label {
      width: auto !important;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-form-item {
      margin-bottom: 0;
    }
  }
  #config-info-box {
    position: relative;
    height: calc(100% - 176px);
    min-height: 653px;
    .btn-disable {
      background-color: #a0cfff;
      border-color: #a0cfff;
      cursor: not-allowed;
    }
    .config-box {
      height: 567px;
      box-sizing: border-box;
      .sensor-container {
        width: 300px;
        height: 100%;
        overflow-y: auto;
        border: 1px solid #e4e4e4;
        border-radius: 3px;
        background-color: #fff;
        float: left;
        padding: 10px;
        box-sizing: border-box;
        position: relative;
        .container-component {
          .d2-container-full-bs {
            border: none !important;
            right: 0 !important;
            .d2-container-full-bs__body {
              .d2-container-full-bs__body-wrapper-inner {
                padding: 10px !important;
              }
            }
          }
        }
        .factory-name {
          font-size: 16px;
          font-weight: bold;
          text-align: left;
        }
        .factory-list-box {
          text-align: left;
        }
      }
      .model-box {
        width: calc(100% - 310px);
        height: 100%;
        margin-left: 10px;
        float: left;
        box-sizing: border-box;
      }
    }
  }
}
</style>
