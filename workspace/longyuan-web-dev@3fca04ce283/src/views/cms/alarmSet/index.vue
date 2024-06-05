<template>
  <div id="alarm-set">
    <div class="alarm-table cms-card">
      <div class="d2-mb-20">
        <span class="cms-module-title">{{ $t('alarmSet.alertSet') }}</span>
        <span class="d2-ml-10">
          (
          <span v-if="hierarchy && hierarchy.id && hierarchy.type === 'MACHINE'" class="color-primary">{{
            $t('common.selectedMachine') + hierarchy.name
          }}</span>
          <span v-else class="color-error">{{ $t('common.noSelectedMachine') }}</span>
          )
        </span>
      </div>
      <div class="alarm-set-tab">
        <el-radio-group v-if="isShowGlobal" v-model="isGlobalEdit" size="medium">
          <el-radio-button :label="$t('alarmSet.factoryLevel')"></el-radio-button>
          <el-radio-button :label="$t('alarmSet.globalSetting')"></el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="isGlobalEdit === $t('alarmSet.factoryLevel')">
        <div class="clearfix d2-mb-10">
          <div class="pull-left">
            <el-select
              class="width-163 d2-mr-10"
              v-model="sensorId"
              :placeholder="$t('alarmSet.placeholder.sensor')"
              size="medium"
              clearable
              @change="getFeatureIdentifierArr"
            >
              <el-option v-for="item in sensorList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-select
              class="width-163 d2-mr-10"
              v-model="featureIdentifier"
              :placeholder="$t('alarmSet.placeholder.variates')"
              size="medium"
              clearable
              @change="fetchAlarmList('search')"
            >
              <template v-for="item in featureIdentifierArr">
                <el-option :key="item.identifier" :label="item.name" :value="item.identifier"></el-option>
              </template>
            </el-select>
          </div>
          <div class="pull-right">
            <el-button size="medium" type="primary" :disabled="hierarchy.type !== 'MACHINE'" @click="handleAdd">{{
              $t('alarmSet.addAlarmSet')
            }}</el-button>
          </div>
        </div>
        <div class="alertSet-table">
          <el-table
            :data="tableData"
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
          >
            <el-table-column :label="$t('alarmSet.workGroup')">
              <template slot-scope="scope">
                <el-tooltip effect="dark" :content="scope.row.machineName" placement="top-start" :open-delay="500">
                  <span class="text-ellipsis vertical-bottom">{{ scope.row.machineName }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.sensor')" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <span>{{ scope.row.sensorName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.variety')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.featureName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.attentionValue')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.attentionValue }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.lowCut')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.lowCut }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.heightCut')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.heightCut }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('alarmSet.errorValue')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.errorValue }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.operation')" width="220">
              <template slot-scope="scope">
                <a class="cms-a-btn" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</a>
                <a class="cms-a-btn" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</a>
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
        </div>
      </div>
      <global-set v-else />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { extractWorkshopId } from '@/util/commonService';
import alarmSetAddModal from './alarmSetAddModal.vue';
import alarmSetDeleteModal from './alarmSetDeleteModal.vue';
import globalSet from './globalSet/index.vue';

export default {
  name: 'alarmSet',
  components: {
    globalSet,
  },
  data() {
    return {
      loading: false,
      isShowGlobal: false,
      isGlobalEdit: this.$t('alarmSet.factoryLevel'),
      sensorId: '',
      sensorList: [],
      featureIdentifierArr: [],
      featureIdentifier: '',
      pageIndex: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
    };
  },
  computed: {
    ...mapState('cms/pass', ['hierarchy', 'passList']),
  },
  watch: {
    hierarchy: {
      handler(value, oldValue) {
        if (!value || !value.id) {
          return;
        }
        this.isShowGlobal = false;
        this.sensorList = [];
        this.sensorId = '';
        this.featureIdentifier = '';
        this.featureIdentifierArr = [];
        this.fetchAlarmList('search');
        if (value.type !== 'MACHINE') {
          this.isShowGlobal = true;
          return;
        }
        this.isGlobalEdit = this.$t('alarmSet.factoryLevel');
        const workshopId = extractWorkshopId(this.passList, value.id);
        this.$api.projectSet
          .getSensorUnderHierarchy({ hierarchyId: value.id, workshopId })
          .then((res) => {
            if (!res) {
              this.sensorList = [];
              return;
            }
            this.sensorList = res;
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      immediate: true,
    },
  },
  methods: {
    getFeatureIdentifierArr(value) {
      if (!value || !this.hierarchy.id || this.sensorList.length === 0) {
        this.featureIdentifier = '';
        this.featureIdentifierArr = [];
        this.fetchAlarmList('search');
        return;
      }
      this.featureIdentifierArr = this.findFeatureIdentifier(this.sensorList, this.sensorId);
      if (this.featureIdentifierArr.length === 0) {
        this.featureIdentifier = '';
      }
      if (this.featureIdentifier) {
        const identifierArr = this.featureIdentifierArr.map((item) => item.identifier);
        if (!identifierArr.includes(this.featureIdentifier)) {
          this.featureIdentifier = '';
        }
      }
      this.fetchAlarmList('search');
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
    prepareParam() {
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      if (!this.sensorId) {
        if (this.hierarchy.type !== 'MACHINE') {
          params.hierarchyId = this.hierarchy.id;
        } else {
          params.machineId = this.hierarchy.id;
        }
      } else {
        params.machineId = this.hierarchy.id;
        params.sensorId = this.sensorId;
        params.featureIdentifier = this.featureIdentifier;
      }
      return params;
    },
    fetchAlarmList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = this.prepareParam();
      this.loading = true;
      this.$api.alarmSet
        .getAlarmSetList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data;
          this.total = res.totalRecords;
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
      this.fetchAlarmList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchAlarmList();
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
        };
        this.$modal.show(this.$t('alarmSet.addAlarmSet'), alarmSetAddModal, winData, '600px', this.fetchAlarmList);
      },
      300,
      { leading: true, trailing: false }
    ),
    handleEdit: debounce(
      function handleEdit(item) {
        if (!item) {
          return;
        }
        const winData = {
          item,
          oper: 'edit',
        };
        this.$modal.show(this.$t('alarmSet.editAlarmSet'), alarmSetAddModal, winData, '600px', this.fetchAlarmList);
      },
      300,
      { leading: true, trailing: false }
    ),
    handleDelete: debounce(
      function handleDelete(item) {
        const winData = {
          list: [cloneDeep(item)],
          text: {
            title: this.$t('alarmSet.deleteTitle'),
            tip: this.$t('alarmSet.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('alarmSet.deleteAlarmSet'),
          alarmSetDeleteModal,
          winData,
          '550px',
          this.fetchAlarmList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
    globalChange() {},
  },
};
</script>
<style lang="less" scoped>
#alarm-set {
  height: 100% !important;
  min-height: 697px;
  padding-right: 20px;
  min-width: 976px;
  .alarm-table {
    width: 100%;
    // height: 100%;
    min-height: 697px;
  }
  .alarm-set-tab {
    margin-bottom: 8px;
  }
}
</style>
