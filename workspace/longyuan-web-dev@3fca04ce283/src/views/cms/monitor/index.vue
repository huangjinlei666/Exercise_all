<template>
  <div class="monitor cms-card">
    <div class="box-switch">
      数据查询开关:
      <el-switch v-model="status" active-color="#13ce66" inactive-color="#ff4949" @change="changeSwitch"></el-switch>
    </div>
    <div id="chart1" class="chart1">
      <p>待处理消息总数: {{ data.lag }}</p>
      <p>
        数据查询开关阈值: {{ data.maxLag }}<el-button class="ml-5" type="primary" @click="changeLag">修改</el-button>
      </p>
      <p v-if="status && data.lag < data.maxLag">Cassandra 查询功能已开启</p>
      <p v-else>Cassandra 查询功能已关闭</p>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import lagChangeModal from './lagChangeModal.vue';

export default {
  name: 'monitor',
  data() {
    return {
      chart1: null,
      status: true,
      data: {},
      timer: null,
    };
  },
  mounted() {
    this.fetchData();
    this.timer = window.setInterval(() => {
      this.fetchData();
    }, 5000);
    this.getSwitch();
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    changeLag() {
      const title = '修改开关阈值';
      const winData = {
        maxLag: this.data.maxLag,
      };
      this.$modal.show(title, lagChangeModal, winData, '700px', this.fetchData);
    },
    getSwitch() {
      this.$api.monitor
        .getSwitch()
        .then((res) => {
          if (!res || !res.success) {
            return;
          }
          this.status = res.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
    changeSwitch: debounce(
      function changeSwitch(status) {
        this.$api.monitor
          .setSwitch({ enable: status ? 1 : 0 })
          .then((res) => {
            if (!res || !res.success) {
              this.$msg.error(`开关${status ? '打开' : '关闭'}失败`);
              return;
            }
            this.$msg.success(`开关${status ? '打开' : '关闭'}成功`);
            this.getSwitch();
          })
          .catch((err) => {
            this.$msg.error(err);
          });
      },
      300,
      { leading: false, trailing: true }
    ),
    fetchData(id) {
      this.$api.monitor
        .getLag()
        .then((res) => {
          if (!res || !res.success) {
            return;
          }
          this.data = res.data;
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.monitor {
  height: 100%;
  min-width: 976px;
  min-height: 760px;
  padding-right: 20px;
  padding-bottom: 20px;
  .box-switch {
    height: 40px;
  }
  // .chart1 {
  //   // height: 600px;
  //   // text-align: center;
  //   font-size: 60px;
  // }
}
</style>
