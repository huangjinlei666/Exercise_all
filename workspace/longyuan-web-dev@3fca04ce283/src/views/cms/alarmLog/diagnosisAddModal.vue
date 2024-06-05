<template>
  <div id="diagnosis-add-modal">
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
        <el-form-item :label="$t('faultDiagnosis.faultCauseId')" prop="faultCauseId">
          <el-select
            :disabled="oper === 'view' || oper === 'edit'"
            class="width-300"
            :placeholder="$t('faultDiagnosis.placeholder.faultCauseId')"
            v-model="ruleForm.faultCauseId"
          >
            <el-option v-for="item in faultCauseList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.name')" prop="name">
          <el-input
            :disabled="oper === 'view' || oper === 'edit'"
            class="width-300"
            v-model.trim="ruleForm.name"
            :placeholder="$t('faultDiagnosis.placeholder.name')"
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.level')" prop="level">
          <el-select
            :disabled="oper === 'view' || oper === 'edit'"
            class="width-300"
            :placeholder="$t('faultDiagnosis.placeholder.level')"
            v-model="ruleForm.level"
          >
            <el-option
              v-for="item in alarmLevels"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.part')" prop="part">
          <el-select
            :disabled="oper === 'view' || oper === 'edit'"
            class="width-300"
            :placeholder="$t('faultDiagnosis.placeholder.part')"
            v-model="ruleForm.part"
          >
            <el-option
              v-for="item in diagnosisParts"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.suggest')" prop="suggest">
          <el-input
            type="textarea"
            :rows="3"
            :disabled="oper === 'view' || oper === 'edit'"
            class="width-300 cms-textarea"
            v-model.trim="ruleForm.suggest"
            :placeholder="$t('faultDiagnosis.placeholder.suggest')"
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.feedback')" prop="feedback">
          <el-input
            type="textarea"
            :rows="3"
            :disabled="oper === 'view'"
            class="width-300 cms-textarea"
            v-model.trim="ruleForm.feedback"
            :placeholder="$t('faultDiagnosis.placeholder.feedback')"
          />
        </el-form-item>
        <el-form-item :label="$t('common.file')" prop="fileIds">
          <div v-if="oper === 'view' && imageUrl.length === 0">
            <img src="../../../assets/images/pg-nopictures.png" alt="picture" />
          </div>
          <div class="avatar-uploader-container" v-else>
            <div v-for="(pic, index) in imageUrl" :key="index" class="avatar">
              <img :src="pic.icon || pic.url" alt="picture" />
              <div v-if="oper !== 'view'" class="cover">
                <i class="el-icon-delete-solid font-16" style="color: #fff" @click="handlePicRemove(pic.id)"></i>
              </div>
            </div>
            <el-upload
              v-if="oper !== 'view' && imageUrl.length < 9"
              class="avatar-uploader"
              action
              :show-file-list="false"
              accept=".jpg, .jpeg, .gif, .png, .pdf, .doc, .docx, .xls, .xlsx"
              :before-upload="beforeUpload"
            >
              <p class="avatar-uploader-icon">
                <i class="el-icon-plus"></i>
                <span>{{ $t('common.placeholder.file') }}</span>
              </p>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" v-if="oper !== 'view'">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button size="medium" :disabled="loading" type="primary" @click="submitForm('ruleForm')">{{
          $t('common.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { baseUrl } from '@/config/baseUrl';
import { getFileMd5, getFileDataURL } from '@/util/commonService';
import { alarmLevels, diagnosisParts, uploadFileTypes } from '@/util/selectTypes';
import { TRIM_500_REG, TRIM_50_REG } from '@/util/regExpService';
import fileWord from '@/assets/images/file-word.png';
import fileExcel from '@/assets/images/file-excel.png';
import filePdf from '@/assets/images/file-pdf.png';

export default {
  mixins: [modalMixin],
  name: 'DiagnosisAddModal',
  data() {
    const suggestValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('faultDiagnosis.placeholder.suggest')));
      }
      if (value && !TRIM_500_REG.test(value)) {
        return callback(new Error(this.$t('faultDiagnosis.invalid.suggest')));
      }
      callback();
    };
    const nameValidator = (rule, value, callback) => {
      if (!value || value.length > 50) {
        return callback(new Error(this.$t('faultDiagnosis.invalid.name')));
      }
      callback();
    };
    return {
      alarmLevels,
      diagnosisParts,
      faultCauseList: [],
      loading: false,
      originData: {},
      ruleForm: {
        faultCauseId: '',
        name: '',
        faultDiagnosisId: '',
        level: '',
        part: '',
        suggest: '',
        fileIds: [],
        feedback: '',
      },
      rules: {
        faultCauseId: [
          { required: true, message: this.$t('faultDiagnosis.placeholder.faultCauseId'), trigger: 'change' },
        ],
        name: [{ required: true, validator: nameValidator, trigger: 'change' }],
        level: [{ required: true, message: this.$t('faultDiagnosis.placeholder.level'), trigger: 'change' }],
        part: [{ required: true, message: this.$t('faultDiagnosis.placeholder.part'), trigger: 'change' }],
        suggest: [{ required: true, validator: suggestValidator, trigger: 'change' }],
        fileIds: [{ required: false, message: this.$t('common.placeholder.picture'), trigger: 'change' }],
      },
      imageUrl: [], // 图片数组
      oper: 'create',
    };
  },
  mounted() {
    const { oper, faultDiagnosisId } = this.options.winData;
    this.oper = oper;
    this.ruleForm.faultDiagnosisId = faultDiagnosisId;
    this.fetchFaultCauseList();
    if (this.oper !== 'create') {
      this.fetchFaultDiagnosisDetail(faultDiagnosisId);
    }
  },
  methods: {
    fetchFaultCauseList() {
      this.$api.faultReasonList
        .getReasonList()
        .then((res) => {
          if (!res || res.length === 0) {
            this.faultCauseList = [];
            return;
          }
          this.faultCauseList = res;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    getFileThumbnail(fileName) {
      const fileType = fileName.substr(fileName.lastIndexOf('.') + 1);
      switch (fileType) {
        case 'doc':
        case 'docx':
          return fileWord;
        case 'xls':
        case 'xlsx':
          return fileExcel;
        case 'pdf':
          return filePdf;
        default:
          return '';
      }
    },
    fetchFaultDiagnosisDetail(faultDiagnosisId) {
      if (!faultDiagnosisId) return;
      this.$api.faultDiagnosis.getDiagnosisDetail(faultDiagnosisId).then((res) => {
        if (res && res.id) {
          this.originData = res;
          this.$nextTick(() => {
            const { faultCauseId, name, level, part, suggest, feedback, fileIds, fileEntityList } = res;
            // fileIds: 旧版本以前是只有ID，没有文件详细信息，且ID只对应图片文件；
            // fileEntityList：新版本加了其它文件类型后，保存了文件完整信息，但老的数据只有ID，所以fileIds会跟fileEntityList有不同，fileIds > fileEntityList
            this.ruleForm.faultCauseId = faultCauseId;
            this.ruleForm.name = name;
            this.ruleForm.level = level;
            this.ruleForm.part = part;
            this.ruleForm.suggest = suggest;
            this.ruleForm.feedback = feedback;
            if (fileIds) {
              const idArr = fileIds.split(',');
              this.ruleForm.fileIds = idArr;
              this.imageUrl = idArr.map((id) => ({
                id,
                url: `${baseUrl}/api/v1/cms/files/${id}/show?type=JARVIS_ALARM&complete=1`,
              }));
              fileEntityList.forEach((item) => {
                this.imageUrl.forEach((img, i) => {
                  if (img.id === item.id) {
                    this.imageUrl[i] = {
                      ...img,
                      md5: item.md5,
                      name: item.name,
                      size: item.size,
                      icon: this.getFileThumbnail(item.name),
                    };
                  }
                });
              });
            }
          });
        }
      });
    },
    beforeUpload(file) {
      if (!uploadFileTypes.includes(file.type)) {
        this.$msg.error(this.$t('alarmLog.onlyAllowFileTypes'));
        return false;
      }
      this.upload(file);
      return false;
    },
    handlePicRemove(id) {
      this.imageUrl = this.imageUrl.filter((p) => p.id !== id);
      this.ruleForm.fileIds = this.ruleForm.fileIds.filter((item) => item !== id);
      this.$refs.ruleForm.validateField('fileIds');
    },
    async upload(file) {
      const md5 = await getFileMd5(file);
      const dataURL = await getFileDataURL(file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'JARVIS_ALARM');
      formData.append('fileName', file.name);
      formData.append('md5', md5);
      this.$api.upload
        .upload(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('alarmLog.failure.picture'));
            return;
          }
          this.$msg.success(this.$t('alarmLog.success.picture'));
          this.ruleForm.fileIds.push(res.id);
          this.$refs.ruleForm.validateField('fileIds');
          this.imageUrl.push({
            id: res.id,
            md5: res.md5,
            name: res.name,
            size: res.size,
            url: dataURL,
            icon: this.getFileThumbnail(file.name),
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    submitForm: debounce(
      function submitForm(formName) {
        if (this.oper === 'view') return;
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            let faultCauseName = this.originData.faultCauseName;
            const faultCause = this.faultCauseList.find((f) => f.id === this.ruleForm.faultCauseId);
            if (faultCause) {
              faultCauseName = faultCause.name;
            }
            const fileEntityList = [];
            this.imageUrl.forEach((item) => {
              if (item.name) {
                fileEntityList.push({
                  id: item.id,
                  md5: item.md5,
                  name: item.name,
                  size: item.size,
                });
              }
            });
            const fileIds = this.ruleForm.fileIds.join(',');
            const data = { ...this.originData, ...this.ruleForm, fileEntityList, fileIds };
            this.update(data);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    create(formData) {
      if (!formData) {
        return;
      }
      const param = { ...formData };
      this.loading = true;
      this.$api.faultDiagnosis
        .addDiagnosis(param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('faultDiagnosis.failure.addDiagnosis'));
            return;
          }
          this.$msg.success(this.$t('faultDiagnosis.success.addDiagnosis'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    update(formData) {
      if (!formData) {
        return;
      }
      const param = { ...formData };
      this.loading = true;
      this.$api.faultDiagnosis
        .editDiagnosis(param)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('faultDiagnosis.failure.editDiagnosis'));
            return;
          }
          this.$msg.success(this.$t('faultDiagnosis.success.editDiagnosis'));
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
#diagnosis-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .avatar-uploader-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    font-size: 24px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 2px;
    justify-content: center;
    &:hover {
      border-color: #409eff;
    }
    span {
      font-size: 12px;
      line-height: 18px;
    }
  }
  .avatar {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    margin: 2px;
    &:hover {
      border-color: #409eff;
      .cover {
        display: flex;
      }
    }
    img {
      width: auto;
      height: 100%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      cursor: pointer;
    }
    .cover {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 6px;
      i {
        cursor: pointer;
      }
    }
  }
}
.el-image-viewer__close {
  color: #fff;
  opacity: unset;
  top: 50px;
  right: 50px;
  width: 50px;
  height: 50px;
  font-size: 50px;
}
</style>
