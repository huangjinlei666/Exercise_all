<template>
  <div>
    <div class="clearfix d2-mb-10">
      <div class="pull-left">
        <el-select
          class="width-163 d2-mr-10"
          v-model="featureIdentifier"
          :placeholder="$t('alarmSet.placeholder.variates')"
          size="medium"
          clearable
          @change="fetchAlarmList('search')"
        >
          <template v-for="item in globleVariableTypes">
            <el-option :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </template>
        </el-select>
      </div>
      <div class="pull-right">
        <el-switch
          v-model="isSettingEnabled"
          :active-text="$t('common.enable') + $t('alarmSet.globalSetting')"
          class="switch-enabled"
          @change="enalbedChange"
        />
        <el-button size="medium" type="primary" @click="handleAdd">{{ $t('alarmSet.addAlarmSet') }}</el-button>
      </div>
    </div>
    <div class="alertSet-table">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
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
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { globleVariableTypes } from '@/util/selectTypes';
import alarmSetAddModal from './alarmSetAddModal.vue';
import alarmSetDeleteModal from '../alarmSetDeleteModal.vue';

export default {
  name: 'alarmSet',
  data() {
    return {
      loading: false,
      isSettingEnabled: false,
      globleVariableTypes,
      sensorId: '',
      sensorList: [],
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
  mounted() {
    this.getGlobleEnalbed();
    this.fetchAlarmList('search');
  },
  methods: {
    getGlobleEnalbed() {
      this.$api.alarmSet.getGlobalSetEnable().then((res) => {
        this.isSettingEnabled = !!res?.data;
      });
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
      }
      params.featureIdentifier = this.featureIdentifier;
      return params;
    },
    fetchAlarmList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = this.prepareParam();
      this.loading = true;
      this.$api.alarmSet
        .getAlarmSetListGlobal(params)
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
        const winData = {
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
    enalbedChange() {
      const param = { boolValue: this.isSettingEnabled };
      const msgkey = this.isSettingEnabled ? 'enable' : 'disable';
      this.$api.alarmSet.switchGlobalSetEnable(param).then((res) => {
        if (res.success) {
          this.$msg.success(this.$t(`alarmSet.success.${msgkey}`));
        } else {
          this.$msg.error(this.$t(`alarmSet.failure.${msgkey}`));
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
#alarm-set {
  .switch-enabled {
    margin-right: 24px;
  }
}
</style>
