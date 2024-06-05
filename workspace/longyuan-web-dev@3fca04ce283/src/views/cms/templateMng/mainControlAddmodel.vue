<template>
  <div id="mainControl-add-modal">
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
        <el-form-item v-if="hideFlag || mainControl" :label="$t('templateMng.mainControl')" prop="mainControl">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.mainControl"
            :placeholder="$t('templateMng.placeholder.mainControl')"
            :disabled="mainControlFlag"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="hideFlag || acquisition" :label="$t('templateMng.acquisitionName')" prop="acquisitionName">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.acquisitionName"
            :placeholder="$t('templateMng.placeholder.acquisitionName')"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="hideFlag || passageway" :label="$t('templateMng.passagewayName')" prop="passagewayName">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.passagewayName"
            :placeholder="$t('templateMng.placeholder.passagewayName')"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="hideFlag || sensor" :label="$t('templateMng.sensorName')" prop="sensorName">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.sensorName"
            :placeholder="$t('templateMng.placeholder.sensorName')"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('templateMng.type')" prop="category">
          <el-select
            @change="handleCategoryChange"
            class="width-300 d2-mr-10"
            v-model="ruleForm.category"
            :placeholder="$t('templateMng.placeholder.type')"
            size="medium"
          >
            <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="hideFlag || !mainControl" :label="$t('templateMng.suffix')" prop="deviceNoSuffix">
          <el-input
            class="width-300"
            v-model.trim="ruleForm.deviceNoSuffix"
            :placeholder="$t('templateMng.placeholder.suffix')"
            maxlength="50"
          ></el-input>
        </el-form-item>
        <!--
        <el-form-item :label="$t('templateMng.objectModel')" prop="thingSpecLangId">
          <el-select
            class="width-300 d2-mr-10"
            v-model="ruleForm.thingSpecLangId"
            :placeholder="$t('templateMng.placeholder.objectModel')"
            size="medium"
            @change="changeObjectModel"
          >
            <el-option v-for="item in objectModelList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('templateMng.extendedField')" prop="metadata">
          <!-- <el-input
            class="width-300 cms-textarea"
            type="textarea"
            v-model.trim="ruleForm.metadata"
            :placeholder="$t('templateMng.placeholder.extendedField')"
          >
          </el-input> -->
          <b-code-editor
            v-model="ruleForm.metadata"
            height="100px"
            :indent-unit="2"
            :show-number="false"
            style="line-height: 16px"
          />
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
  name: 'mainControlAddmodel',
  data() {
    // 富文本框教研
    const checkObj = (rule, value, callback) => {
      try {
        if (JSON.parse(value.trim())) {
          callback();
        }
      } catch (e) {
        callback(this.$t('publicStrategy.notJson'));
      }
    };
    const suffixValidator = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('templateMng.placeholder.suffix')));
      }
      if (value.indexOf('_') > -1) {
        return callback(new Error(this.$t('templateMng.invalid.suffix')));
      }
      callback();
    };
    return {
      loading: false,
      id: '',
      hideFlag: false,
      mainControl: false,
      acquisition: false,
      passageway: false,
      sensor: false,
      productList: [],
      objectModelList: [],
      mainControlFlag: false,
      categoryList: [],
      level: '',
      type: '',
      ruleForm: {
        mainControl: '',
        acquisitionName: '',
        passagewayName: '',
        sensorName: '',
        // productId: '',
        // thingSpecLangId: '',
        metadata: '',
        deviceNoSuffix: '',
        category: '',
      },
      rules: {
        mainControl: [{ required: true, message: this.$t('templateMng.placeholder.mainControl'), trigger: 'blur' }],
        acquisitionName: [
          { required: true, message: this.$t('templateMng.placeholder.acquisitionName'), trigger: 'blur' },
          { min: 1, max: 49, message: this.$t('templateMng.equipmentTemplateNameLimit'), trigger: 'change' },
        ],
        passagewayName: [
          { required: true, message: this.$t('templateMng.placeholder.passagewayName'), trigger: 'blur' },
          { min: 1, max: 49, message: this.$t('templateMng.equipmentTemplateNameLimit'), trigger: 'change' },
        ],
        sensorName: [
          {
            required: true,
            message: this.$t('templateMng.placeholder.sensorName'),
            trigger: 'blur',
          },
          { min: 1, max: 49, message: this.$t('templateMng.equipmentTemplateNameLimit'), trigger: 'change' },
        ],
        productId: [{ required: true, message: this.$t('templateMng.placeholder.product'), trigger: 'blur' }],
        category: [{ required: true, message: this.$t('templateMng.placeholder.type'), trigger: 'blur' }],
        thingSpecLangId: [{ required: true, message: this.$t('templateMng.placeholder.objectModel'), trigger: 'blur' }],
        deviceNoSuffix: [{ required: true, validator: suffixValidator, trigger: 'change' }],
        metadata: [
          // { required: true, message: '必填项', trigger: 'blur' },
          { validator: checkObj, trigger: 'blur' },
        ],
      },
    };
  },
  mounted() {
    // 获取上一层页面返回的数据
    const { oper, data, type } = this.options.winData;
    // 上一层返回的控件类型
    this.type = type;
    // 判断什么类型显示什么弹窗内容
    if (type === 'mainControl') {
      this.mainControl = true;
      this.mainControlFlag = true;
      this.ruleForm.mainControl = '主控';
      this.categoryList = [{ id: '001', name: '主控' }];
    } else if (type === 'acquisition') {
      this.acquisition = true;
      this.level = 1;
      this.categoryList = [{ id: '002', name: '采集板' }];
    } else if (type === 'passageway') {
      this.passageway = true;
      this.level = 2;
      this.categoryList = [
        { id: '003', name: '模拟通道' },
        { id: '004', name: '数字通道' },
      ];
    } else {
      this.sensor = true;
      this.level = 3;
      this.categoryList = [
        { id: '005', name: '振动传感器' },
        { id: '006', name: '转速感器' },
      ];
    }
    // // 获取产品数据
    // this.getProduct();
    // 如果产品id存在 编辑操作反显
    // if (productId) {
    //   this.ruleForm.productId = productId;
    //   // 获取物模型数据
    //   this.getObject(productId);
    // }
    // 默认清空拓展字段
    this.ruleForm.metadata = '{}';
    // 编辑操作赋值
    if (oper === 'edit') {
      if (data.type === 'mainControl') {
        this.mainControlFlag = true;
        this.ruleForm.mainControl = data.deviceName;
      } else if (data.type === 'acquisition') {
        this.ruleForm.acquisitionName = data.deviceName;
      } else if (data.type === 'passageway') {
        this.ruleForm.passagewayName = data.deviceName;
      } else {
        this.ruleForm.sensorName = data.deviceName;
      }
      this.ruleForm.deviceNoSuffix = data.deviceNoSuffix;
      this.ruleForm.category = data.category;
      this.ruleForm.metadata = data.metadata;
    }
  },
  methods: {
    // 物模型改变拓展字段清空
    // changeObjectModel() {
    //   if (this.type === 'sensor') {
    //     this.ruleForm.metadata = '{}';
    //   }
    // },
    // 产品改变如果弹窗类型是传感器，默认字段清空
    // changeProduct(id) {
    //   if (this.type === 'sensor') {
    //     this.ruleForm.metadata = '{}';
    //   }
    //   this.ruleForm.thingSpecLangId = '';
    //   this.getObject(id);
    // },
    // 获取产品的数据
    // getProduct() {
    //   const params = {
    //     level: this.level,
    //   };
    //   this.$api.templateMng
    //     .getProductList(params)
    //     .then((res) => {
    //       if (!res || res.length === 0) {
    //         this.productList = [];
    //         return;
    //       }
    //       this.productList = res;
    //     })
    //     .catch((err) => {
    //       this.$msg.error(err);
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    // 获取物模型的数据
    // getObject(id) {
    //   const params = {
    //     productId: id,
    //   };
    //   this.$api.templateMng
    //     .getObjectList(params)
    //     .then((res) => {
    //       if (!res || res.length === 0) {
    //         this.objectModelList = [];
    //         return;
    //       }

    //       this.objectModelList = res;
    //     })
    //     .catch((err) => {
    //       this.$msg.error(err);
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    // 提交按钮校验
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }

          if (this.options.winData.oper === 'create') {
            const data = {
              oper: 'create',
              param: this.ruleForm,
            };
            // 弹窗数据返回上一层组件
            this.handleConfirm(data);
          } else if (this.options.winData.oper === 'edit') {
            const data = {
              oper: 'edit',
              param: this.ruleForm,
            };
            // 弹窗数据返回上一层组件
            this.handleConfirm(data);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 处理选择传感器事件
    handleCategoryChange() {
      if (!this.level || this.level !== 3) {
        return;
      }
      const category = this.ruleForm.category === '005' ? 'vibration' : this.ruleForm.category === '006' ? 'speed' : '';
      if (!category) {
        return;
      }
      this.ruleForm.metadata = JSON.stringify(
        {
          deviceType: [category],
        },
        null,
        2
      );
    },
  },
};
</script>
<style lang="less">
#mainControl-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .bin-json-editor {
    width: 300px;
    border: 1px solid gray;
    .CodeMirror {
      height: 100px !important;
    }
  }
}
</style>
