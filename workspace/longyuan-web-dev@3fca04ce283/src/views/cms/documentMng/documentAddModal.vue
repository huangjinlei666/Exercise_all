<template>
  <div id="document-add-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="loading"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <el-form-item :label="$t('documentMng.title')" prop="title">
          <el-input class="width-300" v-model.trim="ruleForm.title" :placeholder="$t('documentMng.enterTitle')" />
        </el-form-item>
        <el-form-item :label="$t('documentMng.summary')" prop="summary">
          <el-input class="width-300" v-model.trim="ruleForm.summary" :placeholder="$t('documentMng.enterSummary')" />
        </el-form-item>
        <el-form-item :label="$t('documentMng.tags')" prop="tags">
          <el-input class="width-300" v-model.trim="ruleForm.tags" :placeholder="$t('documentMng.enterTags')" />
        </el-form-item>
        <el-form-item :label="$t('documentMng.category')" prop="category">
          <el-select
            class="width-300 d2-mr-10"
            v-model="ruleForm.category"
            :placeholder="$t('documentMng.enterCategory')"
            size="medium"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.categoryName"
              :label="item.categoryName"
              :value="item.categoryName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!id" :label="$t('documentMng.document')" prop="file">
          <el-upload
            class="upload-demo"
            action
            accept=".txt, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
            :limit="1"
            :file-list="fileList"
            :on-remove="removeFile"
            :on-exceed="fileExceed"
            :before-upload="beforeUpload"
          >
            <el-button v-if="fileList.length < 1" slot="trigger" size="medium" icon="el-icon-upload2">
              {{ $t('documentMng.importDocument') }}
            </el-button>
            <el-button v-else disabled slot="tip" size="medium" icon="el-icon-upload2">
              {{ $t('documentMng.importDocument') }}
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { NAME_32_REG } from '@/util/regExpService';
import { getFileMd5 } from '@/util/commonService';

export default {
  mixins: [modalMixin],
  name: 'documentAddModal',
  data() {
    const titleValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('documentMng.enterTitle')));
      }
      callback();
    };
    const summaryValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('documentMng.enterSummary')));
      }
      callback();
    };
    const tagsValidator = (rule, value, callback) => {
      if (!NAME_32_REG.test(value)) {
        return callback(new Error(this.$t('documentMng.enterTags')));
      }
      callback();
    };
    const categoryValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('documentMng.enterCategory')));
      }
      callback();
    };
    const fileValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('documentMng.uploadDocument')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      ruleForm: {
        title: '',
        summary: '',
        tags: '',
        category: '',
        file: '',
      },
      rules: {
        title: [{ required: true, validator: titleValidator, trigger: 'change' }],
        summary: [{ required: true, validator: summaryValidator, trigger: 'change' }],
        tags: [{ required: true, validator: tagsValidator, trigger: 'change' }],
        category: [{ required: true, validator: categoryValidator, trigger: 'change' }],
        file: [{ required: true, validator: fileValidator, trigger: 'change' }],
      },
      categoryList: [],
      fileList: [],
      // beforeUpload标识,选中文件上传的时候会先触发beforeUpload,之后会触发removeFile
      // 但是如果上传错文件想要替换的时候,只会触发removeFile
      beforeUploadFlag: false,
    };
  },
  mounted() {
    const { oper, item, categoryList } = this.options.winData;
    this.categoryList = categoryList || [];
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm = {
        title: item.title,
        summary: item.summary,
        tags: item.tags,
        category: item.category,
      };
    }
  },
  methods: {
    beforeUpload(file) {
      if (file.size > 100 * 1024 * 1024) {
        this.$msg.error(this.$t('documentMng.only100M'));
        return false;
      }
      this.beforeUploadFlag = true;
      this.fileList.push(file);
      this.$set(this.ruleForm, 'file', file);
      this.$refs.ruleForm.validateField('file');
      return false;
    },
    removeFile() {
      if (this.beforeUploadFlag) {
        this.beforeUploadFlag = false;
      } else {
        this.fileList = [];
        this.$set(this.ruleForm, 'file', '');
        this.$refs.ruleForm.validateField('file');
      }
    },
    fileExceed() {
      this.$msg.error(this.$t('documentMng.uploadDocumentOnly'));
    },
    async upload(file) {
      const md5 = await getFileMd5(file);
      const formData = new FormData();
      formData.append('md5', md5);
      formData.append('file', file);
      formData.append('type', 'JARVIS_KNOWLEDGEBASE');
      formData.append('fileName', file.name);
      return new Promise((resolve, reject) => {
        this.$api.upload
          .upload(formData)
          .then((res) => {
            if (!res || !res.id) {
              this.$msg.error(this.$t('documentMng.uploadDocumentFail'));
              return;
            }
            this.$msg.success(this.$t('documentMng.uploadDocumentSuccess'));
            resolve(res);
          })
          .catch((err) => {
            this.$msg.error(err);
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            this.update(this.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    async create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      const uploadedData = await this.upload(this.fileList[0]);
      const params = {
        category: formData.category,
        summary: formData.summary,
        tags: formData.tags,
        title: formData.title,
        fileId: uploadedData.id,
        fileName: uploadedData.name,
      };
      this.$api.database
        .createDocument(params)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('documentMng.createDocumentFail'));
            return;
          }
          this.$msg.success(this.$t('documentMng.createDocumentSuccess'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    update(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      const params = {
        id,
        ...formData,
        fileId: this.options.winData.item.fileId,
        fileName: this.options.winData.item.fileName,
      };
      this.$api.database
        .updateDocument(id, params)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('documentMng.updateDocumentFail'));
            return;
          }
          this.$msg.success(this.$t('documentMng.updateDocumentSuccess'));
          this.handleConfirm();
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
<style lang="less">
#document-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
}
</style>
