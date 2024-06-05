<template>
  <el-dropdown class="fe-layout-dropdown" trigger="hover" szie="small">
    <span class="el-dropdown-link">
      <i class="el-icon-user el-icon--right"></i>
      {{ info.name ? `${info.name}` : $t('common.unlogin') }}
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item @click.native="pwdEdit">
        <i class="el-icon-edit-outline d2-mr-5"></i>
        {{ $t('common.editPwd') }}
      </el-dropdown-item>
      <el-dropdown-item @click.native="logOff">
        <i class="fa fa-power-off d2-mr-5"></i>
        {{ $t('common.logout') }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import PwdEditModal from '@/views/cms/userManage/pwdEditModal';

export default {
  name: 'header-user',
  computed: {
    ...mapState('system/account', ['info']),
  },
  methods: {
    ...mapMutations({
      logout: 'system/account/logout',
    }),
    pwdEdit() {
      this.$modal.show(this.$t('common.editPwd'), PwdEditModal, {}, '600px');
    },
    logOff() {
      this.$confirm(this.$t('common.logoutSure'), this.$t('common.logout'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.logout();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('common.cancelLogout'),
          });
        });
    },
  },
};
</script>
