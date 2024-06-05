<template>
  <div class="page-login">
    <cms-browser-tip></cms-browser-tip>
    <div class="page-login--layer page-login--layer-area">
      <ul class="circles">
        <li v-for="n in 10" :key="n"></li>
      </ul>
    </div>
    <div class="page-login--layer page-login--layer-time">{{ time }}</div>
    <div class="page-login--layer">
      <div class="page-login--content">
        <div class="logo-img">
          <img src="/images/login-Windfield.png" alt="" />
        </div>
        <div class="page-login--content-header"></div>
        <div class="page-login--content-main" flex="dir:top main:center cross:center">
          <div style="margin-bottom: 5px">
            <img v-if="logoSrc" class="page-login--logo" :src="logoSrc" />
            <span v-if="!logoSrc" class="page-login--title">{{ $t('title') }}</span>
          </div>
          <div class="page-login--form" v-loading="loading">
            <el-card shadow="never">
              <el-form
                ref="loginForm"
                label-position="top"
                :rules="rules"
                :model="formLogin"
                size="default"
                :inline-message="true"
              >
                <el-form-item prop="username">
                  <el-input
                    type="text"
                    v-model.trim="formLogin.username"
                    :placeholder="$t('user.loginName')"
                    @keyup.enter.native="submit"
                  >
                    <i slot="prepend" class="el-icon-user-solid"></i>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    type="password"
                    v-model.trim="formLogin.password"
                    :placeholder="$t('user.password')"
                    @keyup.enter.native="submit"
                    show-password
                  >
                    <i slot="prepend" class="el-icon-key"></i>
                  </el-input>
                </el-form-item>
                <!-- 验证码 -->
                <el-form-item prop="code">
                  <el-input
                    v-model="formLogin.code"
                    type="text"
                    :placeholder="$t('user.placeholder.verificationCode')"
                    @keyup.enter.native="submit"
                  >
                    <template slot="append">
                      <img class="login-code" :src="codeImg" @click="getCode" />
                    </template>
                  </el-input>
                </el-form-item>
                <el-button size="default" type="primary" @click="submit" class="button-login">{{
                  $t('common.login')
                }}</el-button>
              </el-form>
              <el-button type="text" @click="handleEditPwd" style="margin: 10px 0 0 180px; padding: 0">
                {{ $t('common.editPwd') }}
              </el-button>
            </el-card>
          </div>
        </div>
      </div>
      <!-- <div class="page-login--content-footer">
        {{ $t('common.copyright1') + new Date().getFullYear() + $t('common.copyright2') }}
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import dayjs from 'dayjs';
import CookieService from '@/util/CookieService';
import cmsBrowserTip from '@/components/cms-browser-tip/index.vue';
import { ACCOUNT_REG, PWD_REG } from '@/util/regExpService';
import { getMetaContent, getSpecialLetterNum } from '@/util/commonService';

export default {
  name: 'login',
  components: { cmsBrowserTip },
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
      if (!PWD_REG.test(value)) {
        return callback(new Error(this.$t('user.invalid.pwd')));
      }
      callback();
    };
    const vcMsg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('user.placeholder.verificationCode')));
      }
      callback();
    };
    return {
      time: dayjs().format('HH:mm:ss'),
      timeInterval: null,
      // 表单
      formLogin: {
        username: '',
        password: '',
        code: '',
      },
      // 表单校验
      rules: {
        username: [
          {
            validator: usernameValidator,
            trigger: 'blur',
          },
        ],
        password: [
          {
            validator: pwdValidator,
            trigger: 'blur',
          },
        ],
        code: [
          {
            validator: vcMsg,
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
  mounted() {
    CookieService.clearLoginCookie();
    this.timeInterval = setInterval(() => {
      this.refreshTime();
    }, 1000);
    this.getCode();
  },
  beforeDestroy() {
    clearInterval(this.timeInterval);
  },
  methods: {
    ...mapActions('system/account', ['login', 'fetchAsideInfo']),
    refreshTime() {
      this.time = dayjs().format('HH:mm:ss');
    },
    submit() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.toLogin();
      });
    },
    toLogin() {
      this.login({
        username: this.formLogin.username,
        password: window.btoa(this.formLogin.password),
        timeStr: this.randomStr,
        code: this.formLogin.code,
      })
        .then((user) => {
          if (!user || !user.id) {
            this.$msg.error('登录失败，请稍后重试');
            return;
          }
          // 重定向对象不存在则返回顶层路径
          this.$router.replace(this.$route.query.redirect || '/');
        })
        .catch((err) => {
          if (err) this.getCode();
          this.$msg.error(err);
        });
    },
    getCode() {
      this.randomStr = new Date().getTime();
      if (!this.randomStr) return false;
      this.$api.user.getCodeImg(this.randomStr).then((res) => {
        this.codeImg = `data:image/png;base64,${btoa(
          new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
        )}`;
      });
    },
    /**
     * 修改密码
     */
    handleEditPwd() {
      this.$router.push({
        name: 'editPwd',
      });
    },
  },
};
</script>

<style lang="less">
.page-login {
  background-color: @color-login-bg;
  height: 100%;
  position: relative;
  user-select: none;
  cursor: pointer;
  .page-login--layer {
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
  .page-login--layer-area {
    overflow: hidden;
  }
  .page-login--layer-time {
    font-size: 24em;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.03);
    overflow: hidden;
  }
  .page-login--content {
    // height: 100%;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // position: relative;
    text-align: center;
    .logo-img {
      // position: absolute;
      // top: 20%;
      margin: 0 auto;
    }
  }
  .page-login--content-header {
    padding: 1rem 0;
  }
  .page-login--content-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .page-login--logo {
    height: 50px;
    vertical-align: middle;
  }
  .page-login--title {
    font-size: 22px;
    line-height: 50px;
    font-weight: bold;
    color: @color-text-main;
    vertical-align: middle;
  }
  // 登录表单
  .page-login--form {
    width: 280px;
    // 卡片
    .el-card {
      margin-bottom: 15px;
    }
    // 登录按钮
    .button-login {
      width: 100%;
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
