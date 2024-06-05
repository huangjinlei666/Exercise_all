export default {
  methods: {
    handlePrevClick() {
      if (this.pageOffsetList.length <= 2) {
        return;
      }
      // pageOffset退回
      this.pageOffsetList.pop();
      this.pageOffsetList.pop();
      this.pageOffset = this.pageOffsetList[this.pageOffsetList.length - 1];
      this.oldPageOffsetList.pop();
      this.oldPageOffsetList.pop();
      this.oldPageOffset = this.oldPageOffsetList[this.oldPageOffsetList.length - 1];
      // 获取绘图的echarts Dom
      this.request(this.requestParam);
    },
    handleNextClick() {
      if (!this.pageOffset || this.pageOffset === this.oldPageOffset) {
        return;
      }
      this.request(this.requestParam);
    },
    resetPaginationData() {
      this.oldPageOffset = '';
      this.oldPageOffsetList = [''];
      this.pageOffset = '';
      this.pageOffsetList = [''];
      this.total = 0;
      this.drawTime = '';
    },
    intervalAction(searchParam) {
      if (!searchParam || !searchParam.sensorId) {
        return;
      }
      if (!this) return;
      // 再请求
      this.$api.routineAtlas
        .sendAction(searchParam.sensorId)
        .then((res) => {
          if (!res || !res.success) {
            console.log('send action failed.');
            return;
          }
          console.log('send action successfully.');
        })
        .catch((err) => {
          this.$msg.error(err);
        });
    },
  },
};
