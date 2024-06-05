<template>
  <div id="vibration">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('vibrationMonitoring.vibrationDb') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-230"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchBearingList('search')"
            @clear="fetchBearingList"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchBearingList('search')"></el-button>
          </el-input>
        </div>
      </div>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :row-style="{ height: '48px' }"
          :cell-style="{ padding: '0px' }"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column type="expand">
            <template #default="props">
              <el-table
                :data="props.row.accelerationSensorDTOList"
                style="width: 100%"
                :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
              >
                <el-table-column :label="$t('vibrationMonitoring.acceleratorSensor')">
                  <el-table-column
                    :label="$t('vibrationMonitoring.serialNo')"
                    type="index"
                    width="50"
                  ></el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.manufactor')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.manufacture }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.type')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.model }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.factoryNo')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.factoryNo }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.factoryDate')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.productionDate }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.pointPosition')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.measurePosition }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('vibrationMonitoring.sensitivity')">
                    <template slot-scope="scope">
                      <span class="text-ellipsis vertical-bottom">{{ scope.row.sensitivity }}</span>
                    </template>
                  </el-table-column>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.serialNo')" type="index" width="50"></el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.windField')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.vibrationMonitorBaseDTO.factory }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.windFarm')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.vibrationMonitorBaseDTO.workshop }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.unitNumber')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.vibrationMonitorBaseDTO.equipmentNo }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.model')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.vibrationMonitorBaseDTO.equipmentModel }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('vibrationMonitoring.dataDevice')">
            <el-table-column :label="$t('vibrationMonitoring.manufactor')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.dataCollectorManufacture
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.type')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.dataCollectorModel
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.factoryNo')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.dataCollectorNo
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.factoryDate')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.dataCollectorProductionDate
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column :label="$t('vibrationMonitoring.speedSensor')">
            <el-table-column :label="$t('vibrationMonitoring.manufactor')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.speedSensorManufacture
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.type')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.speedSensorModel
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.factoryNo')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.speedSensorFactoryNo
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.factoryDate')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.speedSensorProductionDate
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('vibrationMonitoring.installPosition')">
              <template slot-scope="scope">
                <span class="text-ellipsis vertical-bottom">{{
                  scope.row.vibrationMonitorBaseDTO.speedSensorPosition
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column :label="$t('common.status')">
            <template slot-scope="scope">
              <div class="statusBox">
                <div
                  :class="
                    scope.row.vibrationMonitorBaseDTO.statusText == '通过'
                      ? 'blueStatus'
                      : scope.row.vibrationMonitorBaseDTO.statusText == '待审批'
                      ? 'grayStatus'
                      : 'redStatus'
                  "
                ></div>
                <span class="vertical-bottom">{{ scope.row.vibrationMonitorBaseDTO.statusText }}</span>
              </div>
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
  </div>
</template>
<script>
import { mapState } from 'vuex';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import { bearingStatuses } from '@/util/selectTypes';
import XLSX from 'xlsx';

export default {
  name: 'vibration',
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
    };
  },
  computed: {
    ...mapState('system/account', ['info']),
  },
  mounted() {
    this.fetchBearingList();
  },
  methods: {
    fetchBearingList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchValue,
        status: 'PASSED',
      };
      this.loading = true;
      this.$api.vibrationMonitoring
        .getVibrationMonitoringList(params)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.map((item) => {
            const sta = bearingStatuses.find((i) => i.value === item.vibrationMonitorBaseDTO.approvalStatus);
            item.vibrationMonitorBaseDTO.statusText = sta ? this.$t(sta.label) : '--';
            return item;
          });
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
      this.fetchBearingList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchBearingList();
    },
  },
};
</script>
<style lang="less" scoped>
#vibration {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .bearing-table-box {
    width: 100%;
    // height: 100%;
    min-height: 697px;
    .upload-demo {
      display: inline-block;
    }
  }
  .statusBox {
    display: flex;
    align-items: center;
  }
  .grayStatus {
    background: #d8d8d8;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .blueStatus {
    background: #1890ff;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .redStatus {
    background: #df3317;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
}
</style>
