<template>
  <div id="device-manage">
    <div class="cms-card d2-mb-10">
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <span class="cms-module-title">{{ $t('device.deviceInfo') }}</span>
        </div>
      </div>
      <el-form label-suffix=":" label-width="150px" label-position="left">
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
        <span v-if="hierarchy.type === 'WORKSHOP'">
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
        <span v-if="hierarchy.type === 'MACHINE'">
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
          <el-row v-if="hierarchy.deviceNumber">
            <el-col :span="8">
              <el-form-item :label="$t('projectSet.gatewayDeviceNumber')">
                <span>{{ hierarchy.deviceNumber || '--' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </span>
      </el-form>
    </div>
    <div class="cms-card">
      <div class="cms-module-title">{{ $t('device.lifeCycle') }}</div>
      <div class="display_box d2-mb-10 mt-10">
        <div class="box-left">
          <el-select
            style="margin-right: 7px"
            class="width-200"
            size="small"
            :placeholder="$t('device.placeholder.selectLifeType')"
            v-model="type"
            clearable
            @change="resetToRequest"
          >
            <el-option
              v-for="t in deiviceLifeCycleTypes"
              :key="t.value"
              :label="$t(t.label)"
              :value="t.value"
            ></el-option>
          </el-select>
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            size="small"
            :range-separator="$t('common.to')"
            :start-placeholder="$t('common.beginDate')"
            :end-placeholder="$t('common.endDate')"
            align="right"
            @change="resetToRequest"
            clearable
            :picker-options="pickerOptions"
            :default-time="['00:00:00', $dateFormat.formatLocalDateTime(Date.now(), 'time')]"
          ></el-date-picker>
        </div>
        <div class="box-right">
          <template v-if="showStatus === 'list'">
            <span class="oper-btn list-icon-active" @click="changeShowStatus('list')"></span>
            <span class="oper-btn tree-icon" @click="changeShowStatus('tree')"></span>
          </template>
          <template v-if="showStatus === 'tree'">
            <span class="oper-btn list-icon" @click="changeShowStatus('list')"></span>
            <span class="oper-btn tree-icon-active" @click="changeShowStatus('tree')"></span>
          </template>
          <el-button size="medium" :disabled="hierarchy.type !== 'MACHINE'" @click="handleAdd">
            <i class="el-icon-plus"></i>{{ $t('common.add') }}
          </el-button>
          <el-upload
            class="upload-demo d2-ml-10"
            action
            :show-file-list="false"
            accept=".xls, .xlsx"
            :before-upload="beforeUpload"
            :disabled="hierarchy.type !== 'MACHINE'"
          >
            <el-button type="primary" size="medium" icon="el-icon-upload2" :disabled="hierarchy.type !== 'MACHINE'">{{
              $t('common.import')
            }}</el-button>
          </el-upload>
          <el-button class="cms-a-btn" style="margin: 0 10px" type="text" @click="downloadTemplate">
            {{ $t('gearbox.downloadTemplate') }}
          </el-button>
        </div>
      </div>
      <div class="table-box" :class="{ 'padding-limit': showStatus === 'tree' }">
        <template v-if="showStatus === 'list'">
          <el-table
            :data="tableData"
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
          >
            <el-table-column :label="$t('device.deviceName')" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">
                  {{ scope.row.sensorName ? scope.row.sensorName : scope.row.machineName || '--' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('device.deviceId')" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <span>
                  {{ scope.row.sensorId ? scope.row.sensorId : scope.row.machineId || '--' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('device.LifeType')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.typeText }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('device.occurTime')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.occurTimeText }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.description')" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.description" placement="top" effect="dark" :open-delay="500">
                  <span class="text-ellipsis vertical-bottom">{{ scope.row.description || '--' }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('common.operation')" width="220">
              <template slot-scope="scope">
                <el-button type="text" @click="handleEdit(scope.row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-popconfirm
                  :confirm-button-text="$t('common.confirm')"
                  :cancel-button-text="$t('common.cancel')"
                  icon="el-icon-info"
                  icon-color="red"
                  :title="$t('common.deleteSure')"
                  @confirm="handleDelete(scope.row.id)"
                >
                  <el-button type="text" :disabled="loading" slot="reference">
                    {{ $t('common.delete') }}
                  </el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            v-if="total > 10"
            class="d2-mt-10"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageIndex"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </template>
        <template v-if="showStatus === 'tree'">
          <template v-if="listData.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="(d, index) in listData"
                :key="d.occurTime + index"
                :timestamp="d.occurTimeText"
                :color="d.color"
                placement="top"
                size="large"
              >
                <el-card>
                  <div class="title">{{ d.typeText }}</div>
                  <div class="description">{{ d.description }}</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div v-if="showMoreBtn">
              <a class="cms-a-btn fs-14" @click="fetchData(true)">>> {{ $t('common.more') }}</a>
            </div>
          </template>
          <cms-nodata v-if="listData.length === 0" :message="$t('common.nodata')"></cms-nodata>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import XLSX from 'xlsx';
import { mapState, mapMutations } from 'vuex';
import debounce from 'lodash/debounce';
import CmsNodata from '@/components/cms-nodata/index.vue';
import { deiviceLifeCycleTypes, projectArr } from '@/util/selectTypes';
import LifeCycleAddModal from './lifeCycleAddModal.vue';

export default {
  name: 'DeviceManage',
  components: {
    CmsNodata,
  },
  data() {
    return {
      deiviceLifeCycleTypes,
      loading: false,
      type: '',
      timeRange: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      listData: [],
      showStatus: 'list', // list, tree
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      projectSelectArr: projectArr,
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy', 'passList', 'passThreshold']),
    ...mapState('system/permission', ['permissionArr']),
    showMoreBtn() {
      if (this.listData.length && this.total && this.listData.length < this.total) {
        return true;
      }
      return false;
    },
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        if (!value || !value.id || value.type === 'MACHINE') {
          return;
        }
        this.resetToRequest();
      },
      immediate: true,
    },
    passThreshold: {
      handler(value) {
        if (!value) {
          return;
        }
        this.currentDeivce = value;
        this.sensorId = '';
        if (value.type === 'SENSOR') {
          this.sensorId = value.id;
        }
        this.resetToRequest();
      },
    },
  },
  beforeMount() {
    this.savePassThreshold({ passThreshold: null });
    this.saveHierarchy({ hierarchy: {} });
  },
  mounted() {
    if (this.hierarchy && this.hierarchy.id) {
      this.fetchData();
    }
  },
  methods: {
    ...mapMutations('cms/pass', ['saveBreadCrumb', 'saveHierarchy', 'savePassThreshold']),
    resetToRequest() {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.fetchData();
    },
    changeShowStatus(status) {
      if (status === this.showStatus) return;
      this.showStatus = status;
      this.resetToRequest();
    },
    fetchData(more) {
      let machineId = this.hierarchy && this.hierarchy.id;
      const sensorId = this.sensorId;
      if (!machineId) {
        machineId = this.passList && this.passList.length > 0 && this.passList[0].id;
      }
      if (!machineId) {
        return;
      }
      if (more) {
        this.pageIndex += 1;
      }
      const params = {
        machineId,
        sensorId,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      if (this.type) {
        params.type = this.type;
      }
      if (this.timeRange && this.timeRange.length > 0) {
        params.startTime = this.timeRange[0].getTime();
        params.endTime = this.timeRange[1].getTime();
      }
      this.loading = true;
      this.$api.device
        .getDeviceLifeCycleList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.listData = [];
            this.total = 0;
            return;
          }
          this.total = res.totalRecords;
          const resList = res.data.map((item, index) => {
            const t = deiviceLifeCycleTypes.find((i) => i.value === item.type);
            item.typeText = t ? this.$t(t.label) : '--';
            item.occurTimeText = this.$dateFormat.formatLocalDateTime(item.occurTime);
            if (index === 0 && !more) {
              item.color = '#1890ff';
            }
            return item;
          });
          if (this.showStatus === 'list') {
            this.tableData = resList;
          }
          if (this.showStatus === 'tree') {
            if (more) {
              this.listData = this.listData.concat(resList);
            } else {
              this.listData = resList;
            }
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchData();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchData();
    },
    handleAdd: debounce(
      function handleAdd() {
        if (this.hierarchy.type !== 'MACHINE') {
          this.$msg.error(this.$t('alarmSet.invalid.selectParams'));
          return;
        }
        const winData = {
          machine: this.hierarchy,
          oper: 'create',
          currentDeivce: this.currentDeivce,
        };
        this.$modal.show(this.$t('device.addRecord'), LifeCycleAddModal, winData, '600px', this.fetchData);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    beforeUpload(file) {
      this.upload(file);
      return false;
    },
    upload(file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('machineId', this.hierarchy.id);
      this.$api.device
        .importDeviceLifeCycle(formData)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('device.failure.import'));
            return;
          }
          this.$msg.success(this.$t('device.success.import'));
          this.fetchData();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    downloadTemplate: debounce(
      () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
          ['type', 'desc', 'date'],
          ['DEVICE_DELIVERY', '设备出厂', '2021/1/22 10:00'],
          ['DEVICE_UPGRADE', '设备升级', '2021/1/23 10:00'],
          ['DEVICE_REPLACE', '传感器更换', '2021/1/24 10:00'],
          ['DEVICE_MAINTAIN', '设备维修', '2021/1/25 10:00'],
          ['DEVICE_SCRAPPING', '设备报废', '2021/1/26 10:00'],
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'ws_name');
        XLSX.writeFile(wb, '设备生命周期导入模板.xlsx');
      },
      300,
      { leading: true, trailing: false }
    ),
    // 编辑生命周期事件
    handleEdit: debounce(
      function handleEdit(info) {
        const winData = {
          oper: 'edit',
          info,
        };
        this.$modal.show(this.$t('device.addRecord'), LifeCycleAddModal, winData, '600px', this.fetchData);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 删除生命周期事件
    handleDelete: debounce(function handleDelete(id) {
      this.loading = true;
      this.$api.device
        .deleteDeviceLifeCycle(id)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('device.failure.delete'));
            return;
          }
          this.$msg.success(this.$t('device.success.delete'));
          this.fetchData();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }),
  },
};
</script>
<style lang="less">
#device-manage {
  position: relative;
  min-width: 967px;
  padding-right: 20px;
  height: 100% !important;
  box-sizing: border-box;
  .display_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
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
  .upload-demo {
    display: inline-block;
  }
  .table-box {
    height: 571px;
    overflow-y: auto;
    ul {
      margin: 0;
      padding: 0;
    }
    .title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: @color-text-normal;
    }
    .description {
      font-size: 12px;
      color: @color-text-sub;
    }
  }
  .padding-limit {
    padding: 0 20%;
  }
  .oper-btn {
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    cursor: pointer;
  }
  .list-icon {
    margin-right: 5px;
    background: url(../../../assets/images/icon-list-normal.png) no-repeat;
  }
  .list-icon-active {
    margin-right: 5px;
    background: url(../../../assets/images/icon-list-selected.png) no-repeat;
  }
  .tree-icon {
    margin-right: 10px;
    background: url(../../../assets/images/icon-timeline-normal.png) no-repeat;
  }
  .tree-icon-active {
    margin-right: 10px;
    background: url(../../../assets/images/icon-timeline-selected.png) no-repeat;
  }
}
</style>
