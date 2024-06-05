<template>
  <div class="cms-operate-btns">
    <template v-if="displayBtns.length > 0">
      <el-button
        size="mini"
        v-for="dis in displayBtns"
        :key="dis.value"
        :type="currentType === dis.value ? 'primary' : ''"
        @click="handleCommand(dis.value)"
      >
        {{ $t(dis.label) }}
      </el-button>
    </template>
    <template v-if="dropdownBtns.length > 0">
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button class="ml-10" size="mini"
          >{{ $t('common.more') }}<i class="el-icon-arrow-down el-icon--right"></i
        ></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="drop in dropdownBtns"
            :key="drop.value"
            :command="drop.value"
            :style="{
              color: currentType === drop.value ? '#1890ff' : '#606266',
              backgroundColor: currentType === drop.value ? '#ecf5ff' : '#fff',
            }"
            >{{ $t(drop.label) }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>
<script>
export default {
  name: 'CmsOperateBtns',
  props: {
    number: {
      type: Number,
      default: 3,
    },
    btns: {
      type: Array,
      default: () => [],
    },
    current: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentType: '',
    };
  },
  computed: {
    displayBtns() {
      return this.btns.slice(0, this.number);
    },
    dropdownBtns() {
      return this.btns.slice(this.number);
    },
  },
  mounted() {
    if (this.current) {
      this.currentType = this.current;
    }
  },
  watch: {
    current(v) {
      v && (this.currentType = v);
    },
  },
  methods: {
    handleCommand(command) {
      this.currentType = command;
      this.$emit('change', this.currentType);
    },
  },
};
</script>
<style lang="less" scoped>
.cms-operate-btns {
  font-size: 0;
  .el-dropdown-link {
    cursor: pointer;
    color: @color-primary;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
}
</style>
