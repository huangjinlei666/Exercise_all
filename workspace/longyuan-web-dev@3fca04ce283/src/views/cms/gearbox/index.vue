<template>
  <div id="gearbox">
    <div class="gearbox-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('gearbox.gearboxDb') }}</div>
      <div class="search-box d2-mb-10 clearfix">
        <div class="pull-left">
          <el-input
            :placeholder="$t('common.searchText')"
            class="width-230"
            v-model="searchValue"
            size="medium"
            clearable
            @keyup.enter.native="fetchGearboxList('search')"
            @clear="fetchGearboxList"
          >
            <el-button slot="append" icon="el-icon-search" @click="fetchGearboxList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">{{
            $t('common.add')
          }}</el-button>
          <el-upload
            class="upload-demo d2-ml-10"
            action
            :show-file-list="false"
            accept=".xls, .xlsx"
            :before-upload="beforeUpload"
          >
            <el-button size="medium" icon="el-icon-upload2">{{ $t('common.import') }}</el-button>
          </el-upload>
          <el-button class="cms-a-btn" style="margin: 0 10px" type="text" @click="downloadTemplate">
            {{ $t('gearbox.downloadTemplate') }}
          </el-button>
        </div>
      </div>
      <div class="gearbox-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('gearbox.factory')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.manufacturer" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.manufacturer }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearbox.gearType')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.gearType" placement="top-start" :open-delay="500">
                <span class="text-ellipsis vertical-bottom">{{ scope.row.gearType }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearbox.gearModel')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.gearModel }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('gearbox.ratio')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.gearRatio }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('gearbox.drawing')">
            <template slot-scope="scope">
              <a
                :class="scope.row.picture && scope.row.picture.name ? 'cms-a-btn' : 'cms-a-btn cms-delete-forbid'"
                @click="handleView(scope.row)"
                >{{ $t('common.view') }}</a
              >
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')" width="220">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleUpload(scope.row.id)">{{ $t('gearbox.uploadPic') }}</a>
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
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import XLSX from 'xlsx';
import gearboxAddModal from './gearboxAddModal.vue';
import gearboxDeleteModal from './gearboxDeleteModal.vue';
import picViewModal from './picViewModal.vue';
import picUploadModal from './picUploadModal.vue';

export default {
  name: 'gearbox',
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
  mounted() {
    this.fetchGearboxList();
  },
  methods: {
    fetchGearboxList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchValue,
      };
      this.loading = true;
      this.$api.gearbox
        .getGearboxList(params)
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
      this.fetchGearboxList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.fetchGearboxList();
    },
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
        };
        this.$modal.show(this.$t('gearbox.addGearbox'), gearboxAddModal, winData, '550px', this.fetchGearboxList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleView: debounce(
      function handleView(item) {
        if (!item.picture || !item.picture.name) {
          return;
        }
        const winData = {
          id: item.id,
        };
        this.$modal.show(this.$t('gearbox.viewDrawing'), picViewModal, winData, '700px');
      },
      300,
      { leading: true, trailing: false }
    ),
    handleUpload: debounce(
      function handleUpload(id) {
        const winData = {
          id,
        };
        this.$modal.show(this.$t('gearbox.uploadPic'), picUploadModal, winData, '700px', this.fetchGearboxList);
      },
      300,
      { leading: true, trailing: false }
    ),
    handleEdit: debounce(
      function handleEdit(item) {
        const winData = {
          item,
          oper: 'edit',
        };
        this.$modal.show(this.$t('gearbox.editGearbox'), gearboxAddModal, winData, '550px', this.fetchGearboxList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleDelete: debounce(
      function handleDelete(data) {
        const winData = {
          list: [cloneDeep(data)],
          text: {
            title: this.$t('gearbox.deleteTitle'),
            tip: this.$t('gearbox.deleteTip'),
          },
        };
        this.$modal.show(this.$t('gearbox.deleteGearbox'), gearboxDeleteModal, winData, '550px', this.fetchGearboxList);
      },
      300,
      { leading: true, trailing: false }
    ),
    beforeUpload(file) {
      this.upload(file);
      return false;
    },
    upload(file) {
      const formData = new FormData();
      formData.append('file', file);
      this.$api.gearbox
        .batchImportGearbox(formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('bearing.failure.importBearing'));
            return;
          }
          this.$msg.success(this.$t('bearing.success.importBearing'));
          this.fetchGearboxList();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    downloadTemplate: debounce(
      () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
          ['序号', '厂商', '齿轮类型', '齿轮型号', '传动比', '图纸'],
          [1, 'hblTest', '行星齿轮', 'X21', '3:26', ''],
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'ws_name');
        XLSX.writeFile(wb, '齿轮箱导入模板.xlsx');
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#gearbox {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .gearbox-table-box {
    width: 100%;
    min-height: 697px;
    .upload-demo {
      display: inline-block;
    }
  }
}
</style>
