<template>
  <div id="machine-view-modal">
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
        <el-form-item :label="$t('faultDiagnosis.machineName')" prop="machineName">
          <el-input
            class="width-300"
            maxlength="50"
            v-model.trim="ruleForm.machineName"
            :placeholder="$t('faultDiagnosis.placeholder.name')"
            disabled
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.diagnosisName')" prop="name">
          <el-input
            class="width-300"
            maxlength="50"
            v-model.trim="ruleForm.name"
            :placeholder="$t('faultDiagnosis.placeholder.name')"
            disabled
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.faultCauseName')" prop="name">
          <el-input
            class="width-300"
            maxlength="50"
            v-model.trim="ruleForm.faultCauseName"
            :placeholder="$t('faultDiagnosis.placeholder.name')"
            disabled
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.level')" prop="level">
          <el-select
            class="width-300"
            :placeholder="$t('faultDiagnosis.placeholder.level')"
            v-model="ruleForm.level"
            disabled
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
            class="width-300"
            :placeholder="$t('faultDiagnosis.placeholder.part')"
            v-model="ruleForm.part"
            disabled
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
            maxlength="255"
            class="width-300 cms-textarea"
            v-model.trim="ruleForm.suggest"
            :placeholder="$t('faultDiagnosis.placeholder.suggest')"
            disabled
          />
        </el-form-item>
        <el-form-item :label="$t('faultDiagnosis.feedback')" prop="feedback">
          <el-input
            type="textarea"
            :rows="3"
            maxlength="255"
            class="width-300 cms-textarea"
            v-model.trim="ruleForm.feedback"
            :placeholder="$t('faultDiagnosis.placeholder.feedback')"
            disabled
          />
        </el-form-item>
        <el-form-item :label="$t('common.file')" prop="fileIds">
          <div v-if="imageUrl.length === 0">
            <img src="../../../assets/images/pg-nopictures.png" alt="picture" />
          </div>
          <div class="avatar-uploader-container" v-else>
            <div v-for="(pic, index) in imageUrl" :key="index" class="avatar">
              <img :src="pic.icon || pic.url" @click="onPreview(index)" />
              <div v-if="pic.icon" class="cover" :title="pic.name">
                <i class="el-icon-download font-16" style="color: #fff" @click="handleDownload(pic.id)"></i>
              </div>
            </div>
            <el-image-viewer
              style="z-index: 999999"
              v-if="showViewer"
              :initialIndex="startIndex"
              :on-close="closeViewer"
              :url-list="imageUrl.map((i) => i.icon || i.url)"
            />
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';
import { baseUrl } from '@/config/baseUrl';
import { alarmLevels, diagnosisParts } from '@/util/selectTypes';
import { downloadFile } from '@/util/commonService';
import fileWord from '@/assets/images/file-word.png';
import fileExcel from '@/assets/images/file-excel.png';
import filePdf from '@/assets/images/file-pdf.png';
import ElImageViewer from '@/components/el-image-viewer/index.vue';

export default {
  mixins: [modalMixin],
  name: 'MachineViewModal',
  components: { ElImageViewer },
  data() {
    return {
      alarmLevels,
      startIndex: 0,
      diagnosisParts,
      loading: false,
      id: '',
      ruleForm: {
        machineName: '',
        name: '',
        faultCauseName: '',
        level: '',
        part: '',
        suggest: '',
        fileIds: [],
        feedback: '',
      },
      rules: {},
      imageUrl: [], // 图片数组
      showViewer: false,
    };
  },
  mounted() {
    const { id } = this.options.winData;
    this.id = id;
    this.fetchList();
  },
  methods: {
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
    fetchList() {
      this.$api.faultDiagnosis
        .getDiagnosisDetail(this.id)
        .then((res) => {
          this.$nextTick(() => {
            this.ruleForm.faultCauseName = res.faultCauseName;
            this.ruleForm.name = res.name;
            this.ruleForm.machineName = res.machineName;
            this.ruleForm.level = res.level;
            this.ruleForm.part = res.part;
            this.ruleForm.suggest = res.suggest;
            this.ruleForm.feedback = res.feedback;
            if (res.fileIds) {
              const idArr = res.fileIds.split(',');
              this.ruleForm.fileIds = idArr;
              this.imageUrl = idArr.map((id) => ({
                id,
                url: `${baseUrl}/api/v1/cms/files/${id}/show?type=JARVIS_ALARM&complete=1`,
              }));
              res.fileEntityList?.forEach((item) => {
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
              console.log(this.imageUrl);
            }
          });
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    handleDownload: debounce(
      (fileId) => {
        const url = `${baseUrl}/api/v1/cms/files/${fileId}/directdownload?type=JARVIS_ALARM&complete=1`;
        downloadFile(url);
      },
      300,
      { leading: true, trailing: false }
    ),
    onPreview(index) {
      this.startIndex = index;
      this.showViewer = true;
    },
    closeViewer() {
      this.showViewer = false;
    },
  },
};
</script>
<style lang="less">
#machine-view-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      min-height: 400px;
      max-height: 600px;
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
</style>
