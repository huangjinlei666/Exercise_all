<template>
  <div id="device-photo-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <div class="avatar-uploader-container">
        <template v-if="imageList.length > 0">
          <div v-for="(img, index) in imageList" :key="index" class="avatar">
            <img :src="img.url" alt="picture" @click="onPreview(index)" />
            <!-- <div v-if="oper !== 'view'" class="cover">
            <i class="el-icon-delete-solid font-16" style="color: #fff" @click="handlePicRemove(img.id)"></i>
          </div> -->
          </div>
        </template>
        <div v-else class="no-fan-pic">暂无风机照片</div>
        <el-image-viewer
          style="z-index: 999999"
          v-if="showViewer"
          :initialIndex="startIndex"
          :on-close="closeViewer"
          :url-list="imageList.map((i) => i.url)"
        />
        <el-upload
          v-if="imageList.length < 24"
          class="avatar-uploader"
          action
          :show-file-list="false"
          accept=".jpg, .jpeg, .gif, .png"
          :before-upload="beforeUpload"
        >
          <p class="avatar-uploader-icon">
            <i class="el-icon-plus"></i>
          </p>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { baseUrl } from '@/config/baseUrl';
import { getFileMd5 } from '@/util/commonService';
import { uploadFileTypes } from '@/util/selectTypes';
import ElImageViewer from '@/components/el-image-viewer/index.vue';

export default {
  mixins: [modalMixin],
  name: 'device-photo-modal',
  components: { ElImageViewer },
  data() {
    return {
      loading: false,
      hierarchyId: '',
      fileIds: [],
      imageList: [],
      imageFileTypes: [],
      startIndex: 0,
      showViewer: false,
    };
  },
  mounted() {
    const { hierarchyId, photoList } = this.options.winData;
    this.hierarchyId = hierarchyId;
    this.imageFileTypes = uploadFileTypes.slice(0, 4);
    this.fileIds = photoList;
    this.fetchList();
  },
  methods: {
    // 获取风机列表
    fetchList() {
      if (!this.fileIds?.length) return;
      this.imageList = this.fileIds.map((id) => ({
        id,
        url: `${baseUrl}/api/v1/cms/files/${id}/show?type=JARVIS_ALARM&complete=1`,
      }));
    },
    beforeUpload(file) {
      if (!this.imageFileTypes.includes(file.type)) {
        this.$msg.error(this.$t('alarmLog.onlyAllowFileTypes'));
        return false;
      }
      this.upload(file);
      return false;
    },
    // handlePicRemove(id) {
    //   this.imageUrl = this.imageUrl.filter((p) => p.id !== id);
    //   this.ruleForm.fileIds = this.ruleForm.fileIds.filter((item) => item !== id);
    //   this.$refs.ruleForm.validateField('fileIds');
    // },
    async upload(file) {
      const md5 = await getFileMd5(file);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'JARVIS_ALARM');
      formData.append('fileName', file.name);
      formData.append('md5', md5);
      this.$api.upload
        .upload(formData)
        .then((res) => {
          if (!res?.id) {
            this.$msg.error(this.$t('alarmLog.failure.picture'));
            return;
          }
          this.addPhoto(res.id);
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    addPhoto(fileId) {
      this.fileIds.push(fileId);
      this.fetchList();
      this.options.winData.parent.photoChange(this.fileIds);
      const params = {
        id: this.hierarchyId,
        fileIds: this.fileIds.toString(),
      };
      this.$api.screen.saveMachinePhotos(params).then((res) => {
        if (res?.success) {
          this.$msg.success(this.$t('alarmLog.success.picture'));
        } else {
          this.$msg.error(this.$t('alarmLog.failure.picture'));
        }
      });
    },
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
<style lang="less" scoped>
#device-photo-modal {
  .avatar-uploader-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    min-height: 143px;
    .no-fan-pic {
      text-align: center;
      width: 100%;
      font-size: 18px;
      line-height: 100px;
    }
  }
  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    background-image: linear-gradient(#063f72, #0a578a);
    border-radius: 6px;
    font-size: 24px;
    color: #8c939d;
    width: 133px;
    height: 133px;
    line-height: 133px;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 4px;
    justify-content: center;
    &:hover {
      border-color: #409eff;
      box-shadow: 0 0 12px 1px #489df1;
    }
    span {
      font-size: 12px;
      line-height: 18px;
    }
  }
  .avatar {
    position: relative;
    width: 133px;
    height: 133px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    margin: 4px;
    &:hover {
      border-color: #409eff;
      box-shadow: 0 0 12px 1px #489df1;
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
<style lang="less">
#device-photo-modal {
  .el-dialog {
    background: #0a3560;
    background-image: url('/images/bg_popup.png');
    background-repeat: no-repeat;
    background-size: cover;
    .el-dialog__header {
      height: 45px;
      line-height: 45px;
      padding: 0 10px;
    }
    .el-dialog__title {
      color: #ddf9fa;
    }
    .el-dialog__headerbtn {
      top: 12px;
    }
  }
  .el-table {
    background: #0a3560;
    &::before {
      display: none;
    }
    th {
      background: #0a5487 !important;
      border-color: #062b4f !important;
    }
    th,
    tr {
      background: #0a3560 !important;
      color: #ddf9fa;
      td {
        border: 1px solid #062b4f !important;
        border-color: #062b4f !important;
      }
    }
  }
  .el-table__body {
    tr:hover > td {
      background-color: #174497 !important;
    }
  }
  .el-loading-mask {
    background-color: hsla(0, 0%, 100%, 0.4) !important;
  }
}
</style>
