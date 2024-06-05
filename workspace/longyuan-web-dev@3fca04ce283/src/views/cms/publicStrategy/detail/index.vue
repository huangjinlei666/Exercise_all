<template>
  <div id="detailStrategy">
    <div class="bearing-table-box cms-card">
      <el-page-header @back="goBack" :content="title"> </el-page-header>
      <div class="top-button" v-if="this.$route.query.oper == 'issue' ? true : false">
        <el-button size="small" type="primary" @click="handleIssue" :disabled="btnDisabled">{{
          $t('publicStrategy.issue')
        }}</el-button>
      </div>

      <div class="top-button" v-if="this.$route.query.oper == 'setUp' ? true : false">
        <el-button size="small" type="primary" @click="handleAddContent">{{
          $t('publicStrategy.addContent')
        }}</el-button>
        <!-- <el-button size="small" type="primary" @click="handleEdit" :disabled="btnDisabled">{{
          $t('publicStrategy.edit')
        }}</el-button>
        <el-button size="small" type="primary" @click="handleAdd">{{ $t('publicStrategy.add') }}</el-button>
        <el-button size="small" type="primary" @click="handleDelete" :disabled="btnDisabled">{{
          $t('publicStrategy.delete')
        }}</el-button> -->
      </div>
      <div class="detail-model">
        <div class="left-box">
          <p
            class="list-p"
            @click="switchListp(item, index)"
            :class="isactive == index ? 'addclass' : ''"
            v-for="(item, index) in data"
            :key="item.id"
            :index="item.id"
          >
            {{ item.name }}
          </p>
        </div>
        <div class="right-box">
          <GenerateForm
            :showFormList="showFormList"
            :paramsCheckList="paramsCheckList"
            :deleteId="deleteId"
            @getParameterValue="getParameterValue"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import detailAddmodal from '../detailAddModal.vue';
import detailDeletemodal from '../detailDeleteModal.vue';
import issueModal from '../issueModal.vue';
import GenerateForm from './generateForm.vue';

export default {
  name: 'detailStrategy',
  components: { GenerateForm },
  data() {
    const checkObj = (rule, value, callback) => {
      try {
        if (JSON.parse(value.trim())) {
          callback();
        }
      } catch (e) {
        callback(this.$t('publicStrategy.notJson'));
      }
    };
    return {
      data: [],
      isactive: 0,
      readonly: true,
      title: '',
      id: '',
      deleteId: '',
      btnDisabled: false,
      item: '',
      showFormList: [], // 展示表单列表,
      paramsCheckList: [], // 参数对照列表,
    };
  },
  mounted() {
    // 获取路由参数的id 并获取列表数据
    this.id = this.$route.query.id;
    if (this.$route.query.oper === 'setUp') {
      this.title = this.$t('publicStrategy.setUp');
    } else {
      this.title = this.$t('publicStrategy.detailTitle');
    }
    this.getList();
  },
  methods: {
    // 获取列表数据
    getList() {
      if (!this.id) {
        return;
      }
      const params = {
        commonStrategyId: this.id,
      };
      this.loading = true;
      this.$api.publicStrategy
        .getStrategyParameter(params)
        .then((res) => {
          // 如果列表返回的数据不存在 则对有些按钮禁用掉
          if (!res || res.length === 0) {
            this.btnDisabled = true;
            this.data = [];
            return;
          }
          this.btnDisabled = false;
          this.data = res;
          // 默认选中列表的第一条数据
          this.item = res[0];
          this.deleteId = this.deleteId || res[0].id;
          this.getParameterValue(this.deleteId);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 点击切换参数列表数据并获取对应的参数值数据
    switchListp(item, index) {
      this.item = item;
      this.isactive = index;
      this.deleteId = item.id;
      this.getParameterValue(item.id);
    },
    // 获取参数值接口
    getParameterValue(id) {
      if (!id) {
        return;
      }
      this.loading = true;
      this.$api.publicStrategy
        .getParameterList(id)
        .then((res) => {
          // 参数改为form表单处理数据
          this.showFormList = JSON.parse(res.value);
          this.paramsCheckList = this.data[this.isactive].jsonSchema;
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 下发操作
    handleIssue: debounce(
      function handleIssue() {
        const winData = {
          id: this.deleteId,
          oper: 'issue',
        };
        this.$modal.show(this.$t('publicStrategy.issStrategy'), issueModal, winData, '550px', this.getList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 新增操作
    handleAdd: debounce(
      function handleAdd() {
        const winData = {
          id: this.$route.query.id,
          oper: 'create',
        };
        this.$modal.show(this.$t('publicStrategy.addPubliPparameters'), detailAddmodal, winData, '550px', this.getList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 编辑操作
    handleEdit: debounce(
      function handleAdd() {
        const winData = {
          oper: 'edit',
          item: this.item,
        };
        this.$modal.show(this.$t('publicStrategy.addPubliPparameters'), detailAddmodal, winData, '550px', this.getList);
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 删除操作
    handleDelete: debounce(
      function handleDelete() {
        const winData = {
          deleteId: this.deleteId,
          list: [cloneDeep(this.item)],
          text: {
            title: this.$t('publicStrategy.deleteTitle'),
            tip: this.$t('publicStrategy.deleteTip'),
          },
        };
        this.$modal.show(
          this.$t('publicStrategy.deleteStrategyPamers'),
          detailDeletemodal,
          winData,
          '550px',
          this.getList
        );
      },
      300,
      { leading: true, trailing: false }
    ),
    // 保存操作之前校验
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.update(this.deleteId);
        } else {
          this.$msg.error(this.$t('publicStrategy.check'));
        }
      });
    },
    // 参数值保存接口
    update(id) {
      if (!id) {
        return;
      }
      const formData = {};
      formData.setValues = JSON.stringify(JSON.parse(this.ruleForm.setValues));
      this.loading = true;
      this.$api.publicStrategy
        .updateStrategyValue(id, formData)
        .then((res) => {
          this.getParameterValue(this.deleteId);
          this.$msg.success(this.$t('publicStrategy.success.updateStrategyPamars'));
        })
        .catch((err) => {
          this.$msg.error(err.errorMessage);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goBack() {
      this.$router.go(-1);
    },
    // 新增当前策略内容
    handleAddContent() {
      const obj = {};
      // eslint-disable-next-line array-callback-return
      this.paramsCheckList.map((item) => {
        obj[item.enKey] = '';
      });
      this.showFormList.push(obj);
    },
  },
};
</script>
>
<style lang="less" scoped>
#detailStrategy {
  height: 100%;
  min-height: 697px;
  min-width: 976px;
  padding-right: 20px;
  .bearing-table-box {
    .detail-model {
      display: flex;
      // position: relative;
      height: calc(100% - 74px);
      margin-top: 20px;
      border-top: 1px solid #e8e8e8;
      padding-top: 30px;

      .left-box {
        width: 17%;
        height: 100%;
        max-height: 700px;
        border-radius: 10px;
        background: #fafafa;
        overflow-y: auto;
        .list-p {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          line-height: 20px;
          padding: 15px 10px;
          cursor: pointer;
        }
        .addclass {
          color: #1890ff;
          background: white;
        }
      }
      .right-box {
        padding-right: 30px;
        margin-left: 5%;
        max-height: 650px;
        overflow-y: auto;
        border-radius: 4px;
        background: white;
      }
    }
    .top-button {
      position: absolute;
      right: 40px;
      top: 36px;
    }
  }
}
</style>
<style lang="less">
.el-form-item__content {
  line-height: 20px;
}
.CodeMirror {
  height: 650px !important;
}
.el-page-header__left {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  font-weight: 500;
}
.el-page-header__content {
  font-weight: bolder;
  color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
}
</style>
