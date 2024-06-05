<template>
  <div id="productTemplate-add-modal">
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
        ref="ruleForm"
        label-width="120px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.templateName')"
            prop="name"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.templateName'),
              trigger: 'blur',
            }"
          >
            <el-input
              class="width-300"
              v-model.trim="ruleForm.name"
              :placeholder="$t('productTemplate.placeholder.templateName')"
              maxlength="32"
              :disabled="detailFlag"
            ></el-input>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.mainControl')"
            prop="mainControl.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.mainControl.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeMainControl"
                :disabled="detailFlag"
              >
                <el-option v-for="item in mainControlProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="mainControl.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.mainControl.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option v-for="item in mainControlObjectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.acquisition')"
            prop="acquisition.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.acquisition.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeAcquisition"
                :disabled="detailFlag"
              >
                <el-option v-for="item in acquisitionProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="acquisition.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.acquisition.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option v-for="item in acquisitionObjectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.analogChannel')"
            prop="analogChannel.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.analogChannel.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeAnalogChannel"
                :disabled="detailFlag"
              >
                <el-option v-for="item in analogChannelProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="analogChannel.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.analogChannel.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option v-for="item in analogChannelObjectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.digitalChannel')"
            prop="digitalChannel.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.digitalChannel.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeDigitalChannel"
                :disabled="detailFlag"
              >
                <el-option v-for="item in digitalChannelProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="digitalChannel.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.digitalChannel.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option
                  v-for="item in digitalChannelObjectList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.vibrationSensor')"
            prop="vibrationSensor.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.vibrationSensor.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeVibrationSensor"
                :disabled="detailFlag"
              >
                <el-option v-for="item in vibrationSensorProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="vibrationSensor.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.vibrationSensor.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option
                  v-for="item in vibrationSensorObjectList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </div>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item
            :label="$t('productTemplate.speedSensor')"
            prop="speedSensor.productId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.product'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.product') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.speedSensor.productId"
                :placeholder="$t('productTemplate.placeholder.product')"
                size="medium"
                @change="changeSpeedSensor"
                :disabled="detailFlag"
              >
                <el-option v-for="item in speedSensorProduct" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item
            class="rightForm"
            prop="speedSensor.thingSpecLangId"
            :rules="{
              required: true,
              message: $t('productTemplate.placeholder.objectModel'),
              trigger: 'blur',
            }"
          >
            <div class="formDiv">
              <div class="leftBtn" type="info">{{ $t('productTemplate.objectModel') }}</div>
              <el-select
                class="width-220 d2-mr-10 rightSelect"
                v-model="ruleForm.speedSensor.thingSpecLangId"
                :placeholder="$t('productTemplate.placeholder.objectModel')"
                size="medium"
                :disabled="detailFlag"
              >
                <el-option v-for="item in speedSensorObjectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <el-button
          size="medium"
          v-if="!detailFlag"
          :disabled="loading"
          type="primary"
          @click="submitForm('ruleForm')"
          >{{ $t('common.confirm') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import modalMixin from '@/plugins/modal/mixin';

export default {
  mixins: [modalMixin],
  name: 'productTemplate',
  data() {
    return {
      loading: false,
      id: '',
      detailFlag: false,
      equipmentTemplateList: [],
      mainControlProduct: [],
      acquisitionProduct: [],
      analogChannelProduct: [],
      digitalChannelProduct: [],
      vibrationSensorProduct: [],
      speedSensorProduct: [],
      speedSensorObjectList: [],
      mainControlObjectList: [],
      acquisitionObjectList: [],
      analogChannelObjectList: [],
      digitalChannelObjectList: [],
      vibrationSensorObjectList: [],
      ruleForm: {
        name: '',
        mainControl: {
          category: '001',
          productId: '',
          thingSpecLangId: '',
        },
        acquisition: {
          category: '002',
          productId: '',
          thingSpecLangId: '',
        },
        analogChannel: {
          category: '003',
          productId: '',
          thingSpecLangId: '',
        },
        digitalChannel: {
          category: '004',
          productId: '',
          thingSpecLangId: '',
        },
        vibrationSensor: {
          category: '005',
          productId: '',
          thingSpecLangId: '',
        },
        speedSensor: {
          category: '006',
          productId: '',
          thingSpecLangId: '',
        },
      },
    };
  },
  mounted() {
    this.getProduct(0);
    this.getProduct(1);
    this.getProduct(2);
    this.getProduct(3);
    // this.getEquipmentList();
    const { oper, item } = this.options.winData;
    if (oper === 'edit' || oper === 'detail') {
      if (oper === 'detail') {
        this.detailFlag = true;
      }
      this.id = item.id;
      this.ruleForm.name = item.name;
      let content;
      try {
        content = JSON.parse(item.content);
      } catch (error) {
        content = [];
      }
      for (let i = 0; i < content.length; i += 1) {
        if (content[i].category === '001') {
          this.getObject(content[i].productId, 0);
          this.ruleForm.mainControl = content[i];
        } else if (content[i].category === '002') {
          this.getObject(content[i].productId, 1);
          this.ruleForm.acquisition = content[i];
        } else if (content[i].category === '003') {
          this.getObject(content[i].productId, 2);
          this.ruleForm.analogChannel = content[i];
        } else if (content[i].category === '004') {
          this.getObject(content[i].productId, 3);
          this.ruleForm.digitalChannel = content[i];
        } else if (content[i].category === '005') {
          this.getObject(content[i].productId, 4);
          this.ruleForm.vibrationSensor = content[i];
        } else {
          this.getObject(content[i].productId, 5);
          this.ruleForm.speedSensor = content[i];
        }
      }
    }
  },
  methods: {
    changeMainControl(id) {
      this.getObject(id, 0);
      this.ruleForm.mainControl.thingSpecLangId = '';
    },
    changeAcquisition(id) {
      this.getObject(id, 1);
      this.ruleForm.acquisition.thingSpecLangId = '';
    },
    changeAnalogChannel(id) {
      this.getObject(id, 2);
      this.ruleForm.analogChannel.thingSpecLangId = '';
    },
    changeDigitalChannel(id) {
      this.getObject(id, 3);
      this.ruleForm.digitalChannel.thingSpecLangId = '';
    },
    changeVibrationSensor(id) {
      this.getObject(id, 4);
      this.ruleForm.vibrationSensor.thingSpecLangId = '';
    },
    changeSpeedSensor(id) {
      this.getObject(id, 5);
      this.ruleForm.speedSensor.thingSpecLangId = '';
    },

    // 获取物模型的数据
    getObject(id, type) {
      const params = {
        productId: id,
      };
      this.$api.templateMng
        .getObjectList(params)
        .then((res) => {
          if (!res || res.length === 0) {
            this.mainControlObjectList = [];
            this.acquisitionObjectList = [];
            this.analogChannelObjectList = [];
            this.digitalChannelObjectList = [];
            this.vibrationSensorObjectList = [];
            this.speedSensorObjectList = [];
            return;
          }
          if (type === 0) {
            this.mainControlObjectList = res;
          } else if (type === 1) {
            this.acquisitionObjectList = res;
          } else if (type === 2) {
            this.analogChannelObjectList = res;
          } else if (type === 3) {
            this.digitalChannelObjectList = res;
          } else if (type === 4) {
            this.vibrationSensorObjectList = res;
          } else {
            this.speedSensorObjectList = res;
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getProduct(id) {
      const params = {
        level: id,
      };
      this.$api.templateMng
        .getProductList(params)
        .then((res) => {
          if (!res || res.length === 0) {
            this.mainControlProduct = [];
            this.acquisitionProduct = [];
            this.analogChannelProduct = [];
            this.digitalChannelProduct = [];
            this.vibrationSensorProduct = [];
            this.speedSensorProduct = [];
            return;
          }
          if (id === 0) {
            this.mainControlProduct = res;
          } else if (id === 1) {
            this.acquisitionProduct = res;
          } else if (id === 2) {
            this.analogChannelProduct = res;
            this.digitalChannelProduct = res;
          } else {
            this.vibrationSensorProduct = res;
            this.speedSensorProduct = res;
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          const data = {};
          data.name = this.ruleForm.name;
          data.content = [];
          data.content.push(this.ruleForm.mainControl);
          data.content.push(this.ruleForm.acquisition);
          data.content.push(this.ruleForm.analogChannel);
          data.content.push(this.ruleForm.digitalChannel);
          data.content.push(this.ruleForm.vibrationSensor);
          data.content.push(this.ruleForm.speedSensor);
          data.content = JSON.stringify(data.content);
          if (this.options.winData.oper === 'create') {
            this.create(data);
          } else if (this.options.winData.oper === 'edit') {
            data.id = this.id;
            this.update(data);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 编辑接口请求
    update(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.productTemplate
        .updateProductTemplate(formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('productTemplate.failure.updateProductTemplate'));
            return;
          }
          this.$msg.success(this.$t('productTemplate.success.updateProductTemplate'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.productTemplate
        .addProductTemplates(formData)
        .then((res) => {
          if (!res || res.success === false) {
            this.$msg.error(this.$t('productTemplate.failure.createProductTemplates'));
            return;
          }
          this.$msg.success(this.$t('productTemplate.success.createProductTemplates'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
#productTemplate-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .formDiv {
    display: flex;
    .leftBtn {
      border-radius: 4px 0px 0px 4px;
      width: 80px;
      text-align: center;
      background: #f5f7fa;
      color: #989aa0;
      border: 1px solid #e0e0e0;
      line-height: 34px;
      border-right: none;
    }
    .rightSelect {
      .el-input__inner {
        border-radius: 0px 4px 4px 0px;
      }
    }
    .rightForm .el-form-item__content {
      margin-left: 10px !important;
    }
  }
  .el-form-item__error--inline {
    margin-left: 80px;
  }
  .width-220 {
    width: 220px;
  }
}
</style>
