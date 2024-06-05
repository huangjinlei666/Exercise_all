<template>
  <ul class="month-progress">
    <li v-for="(item, idx) in monthList" :key="idx">
      <div v-if="idx > 0" class="line">
        <i v-for="(ev, i) in item.events" :key="i" :class="`icon ${ev.type}`" />
      </div>
      <div :class="`circle circle_${item.status}`">{{ item.month }}月</div>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'month-progress',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      monthList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      const nowMonth = new Date().getMonth();
      const list = [];
      this.data.forEach((m) => {
        list.push({
          month: m.month,
          events: m.events.map((e) => ({ type: e.type?.toLowerCase() })),
          status: m.month > nowMonth + 1 ? 'off' : 'on',
        });
      });
      this.monthList = list;
    },
  },
};
</script>
<style lang="less" scoped>
.month-progress {
  list-style: none;
  display: flex;
  margin-bottom: 24px;
  li {
    display: flex;
    .line {
      width: 90px;
      height: 21px;
      display: flex;
      justify-content: space-around;
      border-bottom: 1px solid #1890ff;
      .icon {
        width: 20px;
        height: 20px;
        display: inline-block;
        background-size: cover;
      }
    }
    .circle {
      display: inline-block;
      width: 32px;
      height: 32px;
      line-height: 32px;
      border-radius: 50%;
      text-align: center;
      margin: 6px 0;
    }
    .circle_on {
      background-color: #1890ff;
    }
    .circle_off {
      background-color: #9ca09e;
    }
  }
}
</style>
