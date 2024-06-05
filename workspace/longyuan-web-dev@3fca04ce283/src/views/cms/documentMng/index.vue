<template>
  <div id="document-mng">
    <div class="document-mng-table-box cms-card">
      <div class="cms-module-title d2-mb-20">{{ $t('menu.documentMng') }}</div>
      <div class="clearfix d2-mb-10">
        <div class="pull-left">
          <el-select
            class="width-163 d2-mr-10 vertical-middle"
            v-model="category"
            :placeholder="$t('documentMng.enterCategory')"
            size="medium"
            clearable
            @change="getDocumentsList('search')"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.categoryName"
              :label="item.categoryName"
              :value="item.categoryName"
            />
          </el-select>
          <el-input
            :placeholder="$t('documentMng.searchText')"
            class="width-230 vertical-middle"
            v-model="fuzzy"
            size="medium"
            clearable
            @keyup.enter.native="getDocumentsList('search')"
            @clear="getDocumentsList('search')"
          >
            <el-button slot="append" icon="el-icon-search" @click="getDocumentsList('search')"></el-button>
          </el-input>
        </div>
        <div class="pull-right">
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">
            {{ $t('common.add') }}
          </el-button>
        </div>
      </div>
      <div class="database-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column :label="$t('documentMng.documentName')" prop="fileName" show-overflow-tooltip />
          <el-table-column :label="$t('documentMng.title')" prop="title" show-overflow-tooltip />
          <el-table-column :label="$t('documentMng.tags')" prop="tags" show-overflow-tooltip />
          <el-table-column :label="$t('documentMng.summary')" prop="summary" show-overflow-tooltip />
          <el-table-column :label="$t('documentMng.category')" prop="category" show-overflow-tooltip />
          <!-- <el-table-column :label="$t('documentMng.downloadCount')" prop="downloadCount" show-overflow-tooltip /> -->
          <!-- <el-table-column prop="fileSize" :label="$t('documentMng.fileSize')">
            <template slot-scope="scope">
              {{ scope.row.fileSize | prettySize }}
            </template>
          </el-table-column> -->
          <el-table-column fixed="right" :label="$t('common.operation')" :width="lang === 'zh-CN' ? 220 : 250">
            <template slot-scope="scope">
              <a
                v-if="scope.row.fileName.split('.')[scope.row.fileName.split('.').length - 1] === 'pdf'"
                class="cms-a-btn"
                @click="handlePreview(scope.row.fileId)"
              >
                {{ $t('documentMng.preview') }}
              </a>
              <a class="cms-a-btn" @click="handleDownload(scope.row.fileId)">
                {{ $t('documentMng.download') }}
              </a>
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
import { baseUrl } from '@/config/baseUrl';
import CookieService from '@/util/CookieService';
import documentAddModal from './documentAddModal.vue';
import documentDeleteModal from './documentDeleteModal.vue';

export default {
  name: 'documentMng',
  data() {
    return {
      category: '',
      categoryList: [],
      fuzzy: '',
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      total: 10,
      tableData: [],
      baseUrl,
      lang: CookieService.getCookie('Fregata-Lang') || 'zh-CN',
    };
  },
  filters: {
    prettySize(size = 0, fixed = 2) {
      size *= 1;
      if (size > 1024 * 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(fixed)} TB`;
      }
      if (size > 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024 / 1024).toFixed(fixed)} GB`;
      }
      if (size > 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(fixed)} MB`;
      }
      if (size > 1024) {
        return `${(size / 1024).toFixed(fixed)} KB`;
      }
      return `${size.toString()} B`;
    },
  },
  mounted() {
    this.getCategoryList();
    this.getDocumentsList();
  },
  methods: {
    getCategoryList() {
      this.$api.database
        .getCategoriesList({ pageIndex: 1, pageSize: 999999 })
        .then((res) => {
          if (!res) {
            this.categoryList = [];
            return;
          }
          this.categoryList = res.data.map((i) => {
            i.createdAt = this.$dateFormat.formatLocalDateTime(i.createdAt);
            return i;
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    getDocumentsList(way) {
      if (way && way === 'search') {
        this.pageIndex = 1;
      }
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        category: this.category,
        fuzzy: this.fuzzy,
      };
      this.loading = true;
      this.$api.database
        .getDocumentsList(params)
        .then((res) => {
          if (!res) {
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
      this.getDocumentsList('search');
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.getDocumentsList();
    },
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          oper: 'create',
          categoryList: this.categoryList,
        };
        this.$modal.show(this.$t('documentMng.addDocument'), documentAddModal, winData, '550px', this.getDocumentsList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    handleEdit: debounce(
      function handleEdit(item) {
        const winData = {
          item,
          categoryList: this.categoryList,
          oper: 'edit',
        };
        this.$modal.show(
          this.$t('documentMng.updateDocument'),
          documentAddModal,
          winData,
          '550px',
          this.getDocumentsList
        );
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
            title: this.$t('documentMng.deleteDocument'),
            tip: this.$t('gearbox.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('documentMng.deleteDocument'),
          documentDeleteModal,
          winData,
          '550px',
          this.getDocumentsList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
    handlePreview: debounce(
      (fileId) => {
        const docWindow = window.open();
        docWindow.opener = null;
        docWindow.location = `${baseUrl}/api/v1/cms/files/${fileId}/show?type=JARVIS_KNOWLEDGEBASE&complete=1`;
        docWindow.target = '_blank';
      },
      300,
      { leading: true, trailing: false }
    ),
    handleDownload: debounce(
      (fileId) => {
        const aTag = document.createElement('a');
        aTag.href = `${baseUrl}/api/v1/cms/files/${fileId}/directdownload?type=JARVIS_KNOWLEDGEBASE&complete=1`;
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();
      },
      300,
      { leading: true, trailing: false }
    ),
  },
};
</script>
<style lang="less" scoped>
#document-mng {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  padding-bottom: 20px;
  .document-mng-table-box {
    min-height: 697px;
  }
}
</style>
