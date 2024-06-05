<template>
  <div id="eigenvalue-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="box mb-20">
        <span class="mr-10">{{ $t('routineAtlas.filterAnalysis') }}</span>
        <section>
          <el-input
            :placeholder="$t('routineAtlas.placeholder.startFrequency')"
            v-model.number="startFrequency"
          ></el-input>
          -
          <el-input :placeholder="$t('routineAtlas.placeholder.endFrequency')" v-model.number="endFrequency"></el-input>
          <el-button size="mini" type="primary" icon="el-icon-search" @click="searchFrequency" class="search">{{
            $t('common.calculation')
          }}</el-button>
        </section>
      </div>
      <el-table
        ref="multipleTable"
        :data="valueList"
        v-loading="loading"
        :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
      >
        <el-table-column prop="paraName" :label="$t('routineAtlas.eigenvalue')" />
        <el-table-column :label="$t('routineAtlas.eigenvalueData')">
          <template slot-scope="scope">
            <span>{{ scope.row.value || '--' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'trendEigenvalue',
  data() {
    return {
      loading: false,
      valueList: [],
      sensorId: '',
      startAt: '',
      endAt: '',
      startFrequency: '50',
      endFrequency: '300',
    };
  },
  mounted() {
    const { sensorId, startAt, endAt } = this.options.winData;
    this.sensorId = sensorId;
    this.startAt = startAt;
    this.endAt = endAt;
    this.getValueList();
  },
  methods: {
    getValueList() {
      this.loading = true;
      const param = {
        startAt: this.startAt,
        endAt: this.endAt,
        pageOffset: '',
        lowCut: this.startFrequency,
        highCut: this.endFrequency,
      };
      this.$api.routineAtlas
        .getFilterEigenvalue(this.sensorId, param)
        .then((res) => {
          console.log(res);
          if (!res || !res.length) {
            this.valueList = [];
            return;
          }
          this.valueList = res;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 搜索频率
    searchFrequency() {
      if (this.endFrequency <= this.startFrequency) return;
      this.getValueList();
    },
  },
};
</script>
<style lang="less">
#eigenvalue-modal {
  .value-list {
    list-style: none;
  }
  .box {
    display: flex;
    align-items: center;
    section {
      display: flex;
      align-items: center;
      .search {
        margin-left: 20px;
      }
    }
    .el-input {
      width: auto;
    }
    .el-input__inner {
      width: 80px;
      height: 28px;
      box-sizing: border-box;
    }
  }
}
</style>
