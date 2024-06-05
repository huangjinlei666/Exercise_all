<template>
  <div id="historyDataTemplate">
    <div class="bearing-table-box cms-card">
      <el-page-header @back="goBack" :content="title"> </el-page-header>
      <div class="top-button pull-right">
        <el-button size="small" type="primary" @click="handleAddTemplate">{{ $t('history.addTemplate') }}</el-button>
      </div>
      <div class="history-table">
        <el-table
          :data="tableData"
          v-loading="loading"
          style="width: 100%; margin-top: 30px"
          :header-cell-style="{ background: '#EFEFEF', border: '1px solid #fff' }"
        >
          <el-table-column fixed :label="$t('history.templateName')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed :label="$t('common.createTime')">
            <template slot-scope="scope">
              <span class="text-ellipsis vertical-bottom">
                {{ scope.row.createdAt }}
              </span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.operation')">
            <template slot-scope="scope">
              <a class="cms-a-btn" @click="handleViewTemplate(scope.row)">{{ $t('common.view') }}</a>
              <a class="cms-a-btn" @click="handleEditTemplate(scope.row)">{{ $t('common.edit') }}</a>
              <a class="cms-a-btn" @click="handleDelete(scope.row.id)">{{ $t('common.delete') }}</a>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          class="d2-mt-10"
          v-if="total > 1"
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
import TemplateAddModal from './templateAddModal.vue';

export default {
  name: 'dataTemplate',
  data() {
    return {
      title: this.$t('history.templateManage'),
      btnDisabled: false,
      loading: false,
      tableData: [],
      pageSize: 2,
      pageIndex: 1,
      total: 0,
    };
  },
  computed: {},
  mounted() {
    this.getTemplateList();
  },
  methods: {
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getTemplateList();
    },
    handleCurrentChange(pageIndex) {
      this.pageIndex = pageIndex;
      this.getTemplateList();
    },
    /**
     * 返回上一页
     */
    goBack() {
      this.$router.go(-1);
    },
    /**
     * 删除模板
     */
    handleDelete: debounce(
      function handleDelete(id) {
        if (!id) {
          return;
        }
        this.$api.history
          .deleteHistoryTemplate(id)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('history.failure.delete'));
              return;
            }
            this.$msg.success(this.$t('history.success.delete'));
            this.getTemplateList();
          })
          .catch((err) => {
            this.$msg.error(err);
          })
          .finally(() => {
            this.loading = false;
          });
      },
      300,
      { leading: true, trailing: false }
    ),
    /**
     * 新增模板
     */
    handleAddTemplate: debounce(
      function handleAddTemplate() {
        this.$modal.show(
          this.$t('history.addTemplate'),
          TemplateAddModal,
          { oper: 'create' },
          '800px',
          this.getTemplateList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    /**
     * 编辑模板
     */
    handleEditTemplate: debounce(
      function handleEditTemplate(info) {
        this.$modal.show(
          this.$t('history.editTemplate'),
          TemplateAddModal,
          { oper: 'edit', info },
          '800px',
          this.getTemplateList
        );
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),

    /**
     * 查看模板
     */
    handleViewTemplate: debounce(
      function handleViewTemplate(info) {
        this.$modal.show(this.$t('history.viewTemplate'), TemplateAddModal, { oper: 'view', info }, '800px', null);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    /**
     *获取模板列表
     */
    getTemplateList() {
      this.loading = true;
      const params = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      };
      this.$api.history
        .getTemplateList(params)
        .then((res) => {
          console.log(res);
          if (!res || !res.data || res.data.length === 0) {
            this.tableData = [];
            this.total = 0;
            return;
          }
          this.tableData = res.data.data;
          this.total = res.data.totalRecords;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less" scoped>
#historyDataTemplate {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .history-container {
    .history-table {
      width: 100%;
      min-height: 636px;
    }
  }
  .top-button {
    position: absolute;
    right: 40px;
    top: 36px;
  }
}
</style>
