<template>
  <div id="sendStrategy">
    <div class="bearing-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('strategySend.strategySendDB') }}</div>
      <div class="bearing-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('strategySend.identifier')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom" :title="scope.row.identifier">{{
                scope.row.identifier
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strategySend.name')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strategySend.readWriteType')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{
                scope.row.readWriteType === 'READONLY' ? '只读' : '读写'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strategySend.dataType')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ dataType[scope.row.dataType] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('strategySend.remake')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.description }}</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" :label="$t('common.operation')" width="350">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleIssue(scope.row)">{{ $t('strategySend.issue') }}</a>
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

import issueModal from './issueModal.vue';

export default {
  name: 'sendStrategy',
  // components: { Detail },
  data() {
    return {
      searchValue: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      publicDetail: true,
      detailId: {},
      id: '',
      deviceId: '',
      dataType: {
        STRING: this.$t('publicStrategy.string'),
        INTEGER: this.$t('publicStrategy.integer'),
        DOUBLE: this.$t('publicStrategy.float'),
        BOOLEAN: this.$t('publicStrategy.boolean'),
      },
    };
  },
  computed: {
    ...mapState('cms/pass', ['passList', 'hierarchy', 'passThreshold']),
  },
  // 监听获取通道信息层级数据
  watch: {
    passThreshold: {
      handler(value) {
        if (!value.deviceId) {
          return;
        }
        console.log(value);
        this.deviceId = value.deviceId;
        this.fetchBearingList(value.deviceId);
      },
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    // 获取风机不同层级的下发值
    fetchBearingList(id) {
      this.loading = true;
      this.$api.strategySend
        .getCharacteristicList(id)
        .then((res) => {
          if (!res || res.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res;
          this.total = res.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 下发按钮操作，所需参数处理
    handleIssue: debounce(
      function handleIssue(item) {
        const winData = {
          deviceId: this.deviceId,
          item,
        };
        this.$modal.show(this.$t('strategySend.editExpectedValue'), issueModal, winData, '550px');
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.fetchBearingList(this.deviceId);
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchBearingList(this.deviceId);
    },
  },
};
</script>
<style lang="less" scoped>
#sendStrategy {
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
}
#strategy {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
}
</style>
