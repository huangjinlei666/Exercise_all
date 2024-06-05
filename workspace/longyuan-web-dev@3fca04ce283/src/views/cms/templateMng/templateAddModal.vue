<template>
  <div id="templateMng-add-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '800px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="loading"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="130px"
        class="demo-ruleForm"
        autocomplete="off"
        size="medium"
        :inline-message="true"
      >
        <div class="formDiv">
          <el-form-item :label="$t('templateMng.equipmentTemplateName')" prop="name">
            <el-input
              class="width-300"
              v-model.trim="ruleForm.name"
              :placeholder="$t('templateMng.placeholder.equipmentTemplateName')"
              :disabled="detailFlag"
              maxlength="50"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('templateMng.remark')" prop="remark">
            <el-input
              class="width-300 cms-textarea"
              type="textarea"
              v-model.trim="ruleForm.remark"
              :placeholder="$t('templateMng.placeholder.remark')"
              :disabled="detailFlag"
              maxlength="200"
            >
            </el-input>
          </el-form-item>
        </div>
        <div class="formDiv">
          <el-form-item :label="$t('templateMng.fanType')" prop="machineDriven">
            <el-radio-group v-model="ruleForm.machineDriven" :disabled="detailFlag">
              <el-radio label="direct"> {{ $t('templateMng.directDrive') }}</el-radio>
              <el-radio label="nonDirect">{{ $t('templateMng.NonDirectDrive') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- <el-form-item :label="$t('templateMng.product')" prop="productName">
          <el-select
            class="width-300 d2-mr-10"
            v-model="ruleForm.productName"
            :placeholder="$t('templateMng.placeholder.product')"
            size="medium"
            @change="changeProduct"
            :disabled="detailFlag"
          >
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="{ name: item.name, id: item.id }"
            />
          </el-select>
        </el-form-item> -->

        <el-form-item :label="$t('templateMng.templateContent')" prop="content">
          <div class="topological">
            <organization-chart v-if="detailFlag" :datasource="ds" @node-click="nodeClick"> </organization-chart>
            <div class="detailBox" v-if="detailBox && detailFlag">
              <el-card class="box-card">
                <template #header>
                  <div class="card-header">
                    <!-- <span>{{ detailTitle }}</span> -->
                    <i class="el-icon-close" @click="closeDetail"></i>
                  </div>
                </template>
                <div class="equipmentNo">
                  <span>{{ titleName }}:</span> <span>{{ detailName }}</span>
                </div>
                <div class="equipmentNo">
                  <span> {{ $t('templateMng.type') }}：</span> <span>{{ detailType }}</span>
                </div>
                <div class="equipmentNo">
                  <span>{{ $t('templateMng.suffix') }}:</span> <span>{{ detailSuffix }}</span>
                </div>
                <div class="equipmentNo">
                  <span>{{ $t('templateMng.extendedField') }}:</span> <span>{{ detailMetadata }}</span>
                </div>
              </el-card>
            </div>
            <div v-if="!detailFlag">
              <el-tree
                v-if="treeFlag"
                :data="data"
                node-key="thingSpecLangId"
                default-expand-all
                :expand-on-click-node="false"
                @node-click="checkTree"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span>{{ node.label }}</span>
                    <span v-if="nodeTree === data.dataId">
                      <el-button :disabled="data.type === 'sensor'" class="cms-a-btn" @click="append(data)" type="text"
                        >{{ $t('common.add') }}
                      </el-button>
                      <el-button class="cms-a-btn" @click="edit(data)" type="text">{{ $t('common.edit') }} </el-button>
                      <el-button class="cms-a-btn" @click="remove(node, data)" type="text">{{
                        $t('common.delete')
                      }}</el-button>

                      <!-- <a class="cms-a-btn" @click="append(data)"> 新增 </a> -->
                      <!-- <a class="cms-a-btn" @click="edit(data)"> 修改 </a>
                    <a class="cms-a-btn" @click="remove(node, data)"> 删除 </a> -->
                    </span>
                  </span>
                </template>
              </el-tree>
              <el-button v-if="!treeFlag" @click="newMainControl">{{ $t('templateMng.newMainControl') }}</el-button>
            </div>
          </div>
        </el-form-item>
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
import OrganizationChart from 'vue-organization-chart';
import mainControlAddmodel from './mainControlAddmodel.vue';
import 'vue-organization-chart/dist/orgchart.css';

let dataId = 1;

export default {
  components: {
    OrganizationChart,
  },
  mixins: [modalMixin],
  name: 'templateMngAddModal',
  data() {
    return {
      detailBox: false,
      detailName: '',
      detailType: '',
      detailSuffix: '',
      // detailTitle: '',
      detailMetadata: '',
      loading: false,
      id: '',
      detailFlag: false,
      titleName: '',
      level: 0,
      typeList: {
        '001': '主控',
        '002': '采集板',
        '003': '模拟通道',
        '004': '数字通道',
        '005': '振动传感器',
        '006': '转速传感器',
      },
      ds: {
        id: '1',
        title: 'general manager',
        children: [
          { id: '2', title: 'department manager' },
          {
            id: '3',
            title: 'department manager',
            children: [
              { id: '4', title: 'senior engineer' },
              {
                id: '5',
                title: 'senior engineer',
                children: [
                  { id: '6', title: 'engineer' },
                  { id: '7', title: 'UE engineer' },
                ],
              },
            ],
          },
          { id: '8', title: 'department manager' },
          { id: '9', title: 'department manager' },
        ],
      },
      productList: [],
      objectModelList: [],
      data: [],
      nodeTree: '',
      ruleForm: {
        name: '',
        // productId: '',
        // productName: '',
        remark: '',
        content: '',
        machineDriven: '',
      },
      subset: '',
      treeFlag: false,
      rules: {
        name: [
          { required: true, message: this.$t('templateMng.placeholder.equipmentTemplateName'), trigger: 'blur' },
          { min: 1, max: 49, message: this.$t('templateMng.equipmentTemplateNameLimit'), trigger: 'change' },
        ],
        productName: [{ required: true, message: this.$t('templateMng.placeholder.product'), trigger: 'blur' }],
        content: [{ required: true, message: this.$t('templateMng.placeholder.templateContent'), trigger: 'blur' }],
        remark: [{ min: 1, max: 199, message: this.$t('templateMng.remarkLimit'), trigger: 'change' }],
        machineDriven: [{ required: true, message: this.$t('templateMng.placeholder.fanType'), trigger: 'change' }],
      },
    };
  },
  mounted() {
    // 解析上一层组件带过来的数据
    const { oper, item } = this.options.winData;
    // 默认产品level为0
    // this.getProduct(0);
    // 编辑赋值操作
    if (oper === 'edit') {
      this.id = item.id;
      this.ruleForm.name = item.name;
      this.ruleForm.productName = item.productName;
      this.ruleForm.productId = item.productId;
      this.ruleForm.remark = item.remark;
      this.ruleForm.content = item.content;
      this.data = JSON.parse(JSON.stringify([item.content]));
      this.ruleForm.machineDriven = item.machineDriven;
      // 编辑操作显示树组件
      if (this.ruleForm.content) {
        this.treeFlag = true;
      }
    } else if (oper === 'detail') {
      this.ruleForm.name = item.name;
      this.ruleForm.productName = item.productName;
      this.ruleForm.productId = item.productId;
      this.ruleForm.remark = item.remark;
      this.ruleForm.content = item.content;
      this.ruleForm.machineDriven = item.machineDriven;
      this.ds = item.content;
      // this.getDetail(item.id);
      // 详情操作显示拓扑图组件
      this.detailFlag = true;
    }
  },
  methods: {
    getDetail(id) {
      this.loading = true;
      this.$api.templateMng
        .getDetail(id)
        .then((res) => {
          if (!res) {
            return;
          }
          console.log(res);
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 拓扑图详情关闭操作
    closeDetail() {
      this.detailBox = false;
    },
    // 拓扑图点击事件
    nodeClick(data) {
      // console.log(data.category);
      // 详情展示获取物模型名称
      // this.getObject(data.productId, data.thingSpecLangId);
      // 详情展示获取产品名称
      // this.getProduct('', data.productId);
      this.detailBox = true;
      // 详情赋值操作，根据不同的层级判断展示名称跟title
      if (data.type === 'mainControl') {
        this.detailName = data.deviceName;
        this.titleName = this.$t('templateMng.mainControl');
      } else if (data.type === 'acquisition') {
        this.detailName = data.deviceName;
        this.titleName = this.$t('templateMng.acquisitionName');
      } else if (data.type === 'passageway') {
        this.detailName = data.deviceName;
        this.titleName = this.$t('templateMng.passagewayName');
      } else {
        this.detailName = data.deviceName;
        this.titleName = this.$t('templateMng.sensorName');
      }

      if (data.metadata === '{}') {
        this.detailMetadata = '';
      } else {
        this.detailMetadata = data.metadata;
      }

      this.detailType = this.typeList[data.category];
      this.detailSuffix = data.deviceNoSuffix;

      // this.detailTitle = data.deviceName;
    },
    // 获取物模型名称
    getObject(id, thingSpecLangId) {
      const params = {
        productId: id,
      };
      this.$api.templateMng
        .getObjectList(params)
        .then((res) => {
          if (!res || res.length === 0) {
            this.detailObject = '';
            return;
          }
          // console.log(res);
          for (let i = 0; i < res.length; i += 1) {
            if (res[i].id === thingSpecLangId) {
              this.detailObject = res[i].name;
            }
          }
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 树组件点击事件
    checkTree(data, node, obj) {
      this.nodeTree = data.dataId;
    },
    // 新增主控
    newMainControl() {
      const winData = {
        oper: 'create',
        type: 'mainControl',
        // productId: this.ruleForm.productId,
      };
      this.$modal.show(this.$t('templateMng.newMainControl'), mainControlAddmodel, winData, '550px', this.childData);
    },
    // 产品change事件监听
    changeProduct(param) {
      this.ruleForm.productId = param.id;
      this.ruleForm.productName = param.name;
    },
    // 获取产品数据
    getProduct(id, productId) {
      const params = {
        level: id,
      };
      this.$api.templateMng
        .getProductList(params)
        .then((res) => {
          if (!res || res.length === 0) {
            this.detailProduct = '';
            return;
          }
          for (let i = 0; i < res.length; i += 1) {
            if (res[i].id === productId) {
              this.detailProduct = res[i].name;
            }
          }
          this.productList = res;
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 新增树数据
    append(data) {
      this.subset = data;
      let title = '';
      let winData;
      if (data.type === 'mainControl') {
        winData = {
          oper: 'create',
          type: 'acquisition',
        };
        title = this.$t('templateMng.newAcquisition');
      } else if (data.type === 'acquisition') {
        winData = {
          oper: 'create',
          type: 'passageway',
        };
        title = this.$t('templateMng.newPassageway');
      } else if (data.type === 'passageway') {
        winData = {
          oper: 'create',
          type: 'sensor',
        };
        title = this.$t('templateMng.newSensor');
      }
      this.ruleForm.content = this.data[0];
      this.$modal.show(title, mainControlAddmodel, winData, '550px', this.childData);
    },
    // 多级弹框返回的数据接收方法
    childData(params) {
      // 解析是新增还是编辑操作
      const { oper, param } = params;
      console.log(param);
      if (oper === 'create') {
        if (param.mainControl) {
          this.treeFlag = true;
          const data = [
            {
              // productId: param.productId,
              // thingSpecLangId: param.thingSpecLangId,
              metadata: param.metadata,
              label: param.mainControl,
              deviceName: param.mainControl,
              title: param.mainControl,
              category: param.category,
              type: 'mainControl',
              dataId: (dataId += 1),
              children: [],
            },
          ];
          this.data = JSON.parse(JSON.stringify(data));
          this.ruleForm.content = this.data[0];
          return;
        }
        const newChild = {
          children: [],
          // productId: param.productId,
          // thingSpecLangId: param.thingSpecLangId,
          metadata: param.metadata,
          dataId: (dataId += 1),
        };
        if (param.acquisitionName) {
          newChild.label = param.acquisitionName;
          newChild.title = param.acquisitionName;
          newChild.deviceName = param.acquisitionName;
          newChild.category = param.category;
          newChild.deviceNoSuffix = param.deviceNoSuffix;
          newChild.type = 'acquisition';
        } else if (param.passagewayName) {
          newChild.label = param.passagewayName;
          newChild.title = param.passagewayName;
          newChild.deviceName = param.passagewayName;
          newChild.category = param.category;
          newChild.type = 'passageway';
          newChild.deviceNoSuffix = param.deviceNoSuffix;
        } else {
          newChild.label = param.sensorName;
          newChild.title = param.sensorName;
          newChild.deviceName = param.sensorName;
          newChild.category = param.category;
          newChild.type = 'sensor';
          newChild.deviceNoSuffix = param.deviceNoSuffix;
          newChild.disabled = true;
        }

        if (!this.subset.children) {
          this.subset.children = [];
        }
        this.subset.children.push(newChild);
        this.data = [...this.data];
      } else {
        // 编辑修改操作
        // console.log(param);
        if (param.mainControl) {
          this.subset.label = param.mainControl;
          this.subset.title = param.mainControl;
          this.subset.deviceName = param.mainControl;
        } else if (param.acquisitionName) {
          this.subset.label = param.acquisitionName;
          this.subset.title = param.acquisitionName;
          this.subset.deviceName = param.acquisitionName;
          this.subset.deviceNoSuffix = param.deviceNoSuffix;
        } else if (param.passagewayName) {
          this.subset.label = param.passagewayName;
          this.subset.title = param.passagewayName;
          this.subset.deviceName = param.passagewayName;
          this.subset.deviceNoSuffix = param.deviceNoSuffix;
        } else {
          this.subset.label = param.sensorName;
          this.subset.title = param.sensorName;
          this.subset.deviceName = param.sensorName;
          this.subset.deviceNoSuffix = param.deviceNoSuffix;
        }
        // this.subset.productId = param.productId;
        // this.subset.thingSpecLangId = param.thingSpecLangId;
        this.subset.metadata = param.metadata;
        this.subset.category = param.category;
        this.ruleForm.content = this.data[0];
        this.data = [...this.data];
      }
    },
    // 删除树层级
    remove(node, data) {
      // console.log(data);
      // 删除之前确认弹窗
      this.open(node, data);
    },
    // 编辑操作
    edit(data) {
      this.subset = data;
      let title = '';
      // console.log(data);
      let winData;
      if (data.type === 'mainControl') {
        winData = {
          oper: 'edit',
          type: 'mainControl',
          productId: data.productId,
          data,
        };
        title = this.$t('templateMng.editMainControl');
      } else if (data.type === 'acquisition') {
        winData = {
          oper: 'edit',
          type: 'acquisition',
          productId: data.productId,
          data,
        };
        title = this.$t('templateMng.editAcquisition');
      } else if (data.type === 'passageway') {
        winData = {
          oper: 'edit',
          type: 'passageway',
          productId: data.productId,
          data,
        };
        title = this.$t('templateMng.editPassageway');
      } else {
        winData = {
          oper: 'edit',
          type: 'sensor',
          productId: data.productId,
          data,
        };
        title = this.$t('templateMng.editSensor');
      }

      this.$modal.show(title, mainControlAddmodel, winData, '550px', this.childData);
    },
    // 提交按钮校验
    submitForm: debounce(
      function submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return;
          }
          if (
            !this.ruleForm.content.deviceName ||
            !this.ruleForm.content.children[0] ||
            !this.ruleForm.content.children[0].children[0] ||
            !this.ruleForm.content.children[0].children[0].children[0]
          ) {
            this.$msg.error(this.$t('templateMng.failure.createContent'));
            return;
          }
          if (this.options.winData.oper === 'create') {
            this.create(this.ruleForm);
          } else if (this.options.winData.oper === 'edit') {
            this.update(this.id, this.ruleForm);
          }
        });
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 新增操作
    create(formData) {
      if (!formData) {
        return;
      }
      this.loading = true;
      this.$api.templateMng
        .addTemplates(formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('templateMng.failure.createTemplates'));
            return;
          }
          this.$msg.success(this.$t('templateMng.success.createTemplates'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 删除树层级弹窗
    open(node, data) {
      this.$confirm('确定要删除这条数据吗？', '删除验证', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex((d) => d.dataId === data.dataId);
          children.splice(index, 1);
          this.data = [...this.data];
          if (data.type === 'mainControl') {
            this.treeFlag = false;
            this.ruleForm.content = '';
          }
          this.ruleForm.content = this.data[0];
        })
        .catch((action) => {});
    },
    // 编辑接口请求
    update(id, formData) {
      if (!id || !formData) {
        return;
      }
      this.loading = true;
      this.$api.templateMng
        .updateTemplate(id, formData)
        .then((res) => {
          if (!res) {
            this.$msg.error(this.$t('templateMng.failure.updateTemplates'));
            return;
          }
          this.$msg.success(this.$t('templateMng.success.updateTemplates'));
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
#templateMng-add-modal {
  .el-dialog__wrapper {
    .el-dialog__body {
      max-height: 400px;
      overflow: auto;
    }
  }
  .topological {
    position: relative;
    .detailBox {
      position: absolute;
      right: 30px;
      top: 10px;
      border-radius: 10px;
      .box-card {
        width: 250px;
        .card-header {
          width: 100%;
          display: flex;
          align-content: center;
          justify-content: flex-end;
        }
        .el-card__header {
          padding: 10px 20px;
          border-bottom: none;
          .el-icon-close {
            font-size: 20px;
            cursor: pointer;
          }
        }
        .el-card__body {
          padding: 15px 20px;
        }
        .equipmentNo {
          font-size: 14px;
          padding: 5px 0;
          span {
            color: rgba(0, 0, 0, 0.85);
            font-weight: 400;
          }
        }
      }
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .formDiv {
    display: flex;
  }
  .orgchart:hover {
    border: none;
  }
  .orgchart {
    background-image: none;
    padding: 0;
    border: none;
    .node .title {
      display: none;
    }
    .node .content {
      height: 40px;
      line-height: 40px;
      border-radius: 4px;
      background: #e9f8ff;
      font-size: 14px;
      border-color: #1890ff;
    }
    .lines {
      .downLine {
        background-color: #898989;
      }
      .rightLine {
        border-color: #898989;
      }
      .leftLine {
        border-color: #898989;
      }
      .topLine {
        border-color: #898989;
      }
      .bottomLine {
        border-color: #898989;
      }
    }
  }
}
</style>
