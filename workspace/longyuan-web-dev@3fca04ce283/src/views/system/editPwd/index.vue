<template>
  <div class="page-editpwd">
    <div class="page-editpwd--header">
      <img v-if="logoSrc" class="page-editpwd--logo" :src="logoSrc" />
      <span v-if="!logoSrc" class="page-editpwd--title">{{ $t('title') }}</span>
    </div>
    <div class="page-editpwd--layer">
      <div class="page-editpwd--content">
        <div class="page-editpwd--content-main" flex="dir:top main:center cross:center">
          <div class="page-editpwd--form">
            <el-card shadow="never">
              <div slot="header" class="clearfix">
                <span>{{ $t('common.editPwd') }}</span>
              </div>
              <el-form
                ref="loginForm"
                label-position="right"
                :rules="rules"
                :model="formLogin"
                size="default"
                :inline-message="true"
                label-width="80px"
              >
                <el-form-item :label="$t('user.account')" prop="account">
                  <el-input v-model.trim="formLogin.account" :placeholder="$t('user.account')"></el-input>
                </el-form-item>
                <el-form-item :label="$t('user.oldPwd')" prop="oldCredential">
                  <el-input
                    v-model.trim="formLogin.oldCredential"
                    :placeholder="$t('user.placeholder.oldPwd')"
                    type="password"
                    auto-complete="new-password"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('user.newPwd')" prop="newCredential">
                  <el-input
                    v-model.trim="formLogin.newCredential"
                    :placeholder="$t('user.placeholder.newPwd')"
                    type="password"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('user.confirmPwd')" prop="confirmCredential">
                  <el-input
                    v-model.trim="formLogin.confirmCredential"
                    :placeholder="$t('user.placeholder.confirmPwd')"
                    type="password"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button size="small" type="primary" @click="submit" class="button-login">{{
                    $t('common.confirm')
                  }}</el-button>
                  <el-button size="small" type="defult" @click="cancel" class="button-login">{{
                    $t('common.cancel')
                  }}</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { PASSWORD_REG, ACCOUNT_REG } from '@/util/regExpService';
import { getMetaContent, getSpecialLetterNum } from '@/util/commonService';
import { changePaw } from '@/api/system/account';

export default {
  name: 'editPwd',
  data() {
    const usernameValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.emailPhone')));
      }
      if (!ACCOUNT_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.accountValid')));
      }
      if (value.length > 64) {
        return callback(new Error(this.$t('user.invalid.accountValid')));
      }
      callback();
    };
    const pwdValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
      }
      if (!PASSWORD_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (getSpecialLetterNum(value) < 3) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      callback();
    };
    const confirmPwdValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.pwd')));
      }
      if (!PASSWORD_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (getSpecialLetterNum(value) < 3) {
        return callback(new Error(this.$t('user.invalid.pwdValid')));
      }
      if (value !== this.formLogin.newCredential) {
        return callback(new Error(this.$t('user.invalid.confirmPwdValid')));
      }
      callback();
    };
    return {
      time: dayjs().format('HH:mm:ss'),
      timeInterval: null,
      // 表单
      formLogin: {
        account: '',
        oldCredential: '',
        newCredential: '',
        confirmCredential: '',
      },
      // 表单校验
      rules: {
        account: [
          {
            required: true,
            validator: usernameValidator,
            trigger: 'blur',
          },
        ],
        oldCredential: [
          {
            required: true,
            validator: pwdValidator,
            trigger: 'blur',
          },
        ],
        newCredential: [
          {
            required: true,
            validator: pwdValidator,
            trigger: 'blur',
          },
        ],
        confirmCredential: [
          {
            required: true,
            validator: confirmPwdValidator,
            trigger: 'blur',
          },
        ],
      },
      loading: false,
      codeImg: null,
      randomStr: null,
    };
  },
  computed: {
    logoSrc() {
      const mode = getMetaContent('logo-mode');
      if (mode === 'official') {
        return `${this.$baseUrl}/images/logo.png`;
      }
      // 演示展示西人马logo
      if (mode === 'exhibition') {
        return `${this.$baseUrl}/images/logo0.png`;
      }
      // 其他情况不展示logo
      return null;
    },
  },
  methods: {
    refreshTime() {
      this.time = dayjs().format('HH:mm:ss');
    },
    submit() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return;
        }
        changePaw(this.formLogin)
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(this.$t('user.failure.resetPwd', { 0: this.formLogin.account }));
              return;
            }
            this.$msg.success(this.$t('user.success.resetPwd', { 0: this.formLogin.account }));
            setTimeout(() => {
              this.$router.push({
                name: 'login',
              });
            }, 2000);
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      });
    },
    // cancel() {
    //   this.$router.push({
    //     name: 'login',
    //   });
    // },
  },
};
</script>

<style lang="less">
.page-editpwd {
  background-color: @color-login-bg;
  height: 100%;
  position: relative;
  user-select: none;
  cursor: pointer;
  .page-editpwd--header {
    background: #fff;
    padding: 5px 10px;
  }
  .page-editpwd--layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 500px;
  }
  .page-editpwd--layer-area {
    overflow: hidden;
  }
  .page-editpwd--layer-time {
    font-size: 24em;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.03);
    overflow: hidden;
  }
  .page-editpwd--content {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .logo-img {
      position: absolute;
      top: 20%;
      margin: 0 auto;
    }
  }
  .page-editpwd--content-header {
    padding: 1rem 0;
  }
  .page-editpwd--content-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .page-editpwd--logo {
    height: 50px;
    vertical-align: middle;
  }
  .page-editpwd--title {
    font-size: 22px;
    line-height: 50px;
    font-weight: bold;
    color: @color-text-main;
    vertical-align: middle;
  }
  // 登录表单
  .page-editpwd--form {
    width: 450px;
    // 卡片
    .el-card {
      margin-bottom: 15px;
    }
    // 登录按钮
    .button-login {
      width: 30%;
    }
    // 输入框左边的图表区域缩窄
    .el-input-group__prepend {
      padding: 0px 14px;
    }
    .login-code {
      height: 40px - 2px;
      display: block;
      margin: 0px -20px;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
    // 登陆选项
    .page-login--options {
      margin: 0px;
      padding: 0px;
      font-size: 14px;
      color: @color-primary;
      margin-bottom: 15px;
      font-weight: bold;
    }
    .page-login--quick {
      width: 100%;
    }
  }
  .page-login--content-footer {
    font-size: 12px;
    text-align: center;
    padding: 1em 0;
    .page-login--content-footer-locales {
      padding: 0px;
      margin: 0px;
      margin-bottom: 15px;
      font-size: 12px;
      line-height: 12px;
      text-align: center;
      color: @color-text-normal;
      a {
        color: @color-text-normal;
        margin: 0 0.5em;
        &:hover {
          color: #303133;
        }
      }
    }
    .page-login--content-footer-copyright {
      padding: 0px;
      margin: 0px;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 12px;
      text-align: center;
      color: @color-text-normal;
      a {
        color: @color-text-normal;
      }
    }
    .page-login--content-footer-options {
      padding: 0px;
      margin: 0px;
      font-size: 12px;
      line-height: 12px;
      text-align: center;
      a {
        color: @color-text-normal;
        margin: 0 1em;
      }
    }
  }
  .circles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0px;
    padding: 0px;
    li {
      position: absolute;
      display: block;
      list-style: none;
      width: 20px;
      height: 20px;
      background: #fff;
      animation: animate 25s linear infinite;
      bottom: -200px;
      @keyframes animate {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
          border-radius: 0;
        }
        100% {
          transform: translateY(-1000px) rotate(720deg);
          opacity: 0;
          border-radius: 50%;
        }
      }
      &:nth-child(1) {
        left: 15%;
        width: 80px;
        height: 80px;
        animation-delay: 0s;
      }
      &:nth-child(2) {
        left: 5%;
        width: 20px;
        height: 20px;
        animation-delay: 2s;
        animation-duration: 12s;
      }
      &:nth-child(3) {
        left: 70%;
        width: 20px;
        height: 20px;
        animation-delay: 4s;
      }
      &:nth-child(4) {
        left: 40%;
        width: 60px;
        height: 60px;
        animation-delay: 0s;
        animation-duration: 18s;
      }
      &:nth-child(5) {
        left: 65%;
        width: 20px;
        height: 20px;
        animation-delay: 0s;
      }
      &:nth-child(6) {
        left: 75%;
        width: 150px;
        height: 150px;
        animation-delay: 3s;
      }
      &:nth-child(7) {
        left: 35%;
        width: 200px;
        height: 200px;
        animation-delay: 7s;
      }
      &:nth-child(8) {
        left: 50%;
        width: 25px;
        height: 25px;
        animation-delay: 15s;
        animation-duration: 45s;
      }
      &:nth-child(9) {
        left: 20%;
        width: 15px;
        height: 15px;
        animation-delay: 2s;
        animation-duration: 35s;
      }
      &:nth-child(10) {
        left: 85%;
        width: 150px;
        height: 150px;
        animation-delay: 0s;
        animation-duration: 11s;
      }
    }
  }
}
</style>
