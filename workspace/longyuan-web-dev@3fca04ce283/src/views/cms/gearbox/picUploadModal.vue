<template>
  <div id="gearbox-pic-upload-modal">
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
        <el-form-item :label="$t('gearbox.drawing')" prop="picture">
          <el-upload
            class="avatar-uploader"
            action="/upload"
            :multiple="false"
            accept=".jpeg, .jpg"
            :show-file-list="false"
            :before-upload="beaforeAvatarUpload"
          >
            <img class="upload-img" v-if="imgUrl" :src="imgUrl" />
            <span v-if="imgUrl" class="upload-x" @click="handleRemove">
              <i style="vertical-align: top" class="el-icon-close"></i>
            </span>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
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

export default {
  mixins: [modalMixin],
  name: 'picUploadModal',
  data() {
    return {
      loading: false,
      id: '',
      imgUrl: '',
      ruleForm: {
        picture: '',
      },
      rules: {
        picture: [{ required: true, message: this.$t('gearbox.placeholder.drawing'), trigger: 'blur' }],
      },
    };
  },
  mounted() {
    const { id } = this.options.winData;
    this.id = id;
  },
  methods: {
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          this.upload(this.ruleForm.picture);
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    upload(file) {
      if (!file) {
        return;
      }
      this.$api.gearbox
        .uploadPic(this.id, file)
        .then((res) => {
          if (!res || !res.success) {
            this.$msg.error(this.$t('gearbox.failure.drawingUpload'));
            return;
          }
          this.$msg.success(this.$t('gearbox.success.drawingUpload'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    beaforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image.jpg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error(this.$t('gearbox.imageFormat'));
        return false;
      }
      if (!isLt2M) {
        this.$message.error(this.$t('gearbox.imageSize'));
        return false;
      }
      this.surePic(file);
      return false;
    },
    surePic(file) {
      const _this = this;
      // 读取图片base64
      const reader2 = new FileReader();
      reader2.onload = function onload(e) {
        _this.imgUrl = e.target.result;
      };
      reader2.readAsDataURL(file);
      // 设置formdata
      const formData = new FormData();
      formData.append('picture', file);
      this.ruleForm.picture = formData;
      this.$refs.ruleForm.validate('picture');
    },
    handleRemove(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.ruleForm.picture = '';
      this.imgUrl = '';
    },
  },
};
</script>
<style lang="less">
#gearbox-pic-upload-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .avatar-uploader .el-upload {
    width: 400px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .avatar {
    height: 100px;
    display: block;
  }
  .upload-img {
    width: 100%;
  }
  .upload-x {
    position: absolute;
    width: 20px;
    height: 20px;
    left: 101%;
    bottom: 0;
    background-color: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-sizing: border-box;
    padding-top: 3px;
  }
}
</style>
