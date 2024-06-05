<template>
  <div id="template-add-modal">
    <el-dialog
      :title="options.title"
      :width="options.width || '600px'"
      :visible.sync="visible"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form ref="ruleForm" autocomplete="off">
        <el-form-item :label="$t('history.templateName')" :required="true">
          <el-input
            class="width-300"
            type="text"
            v-model.trim="ruleForm.name"
            :placeholder="$t('history.placeholder.templateName')"
            prop="name"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('pass.selectPass')" :required="true">
          <div class="pass-box">
            <el-tree
              ref="passTree"
              :data="passList"
              :props="defaultProps"
              node-key="id"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :highlight-current="true"
              :check-on-click-node="true"
              :indent="10"
              :load="loadNode"
              :default-expanded-keys="defaultExpandedKeys"
              :default-checked-keys="defaultCheckedKeys"
              show-checkbox
              lazy
              icon-class="el-icon-arrow-right"
              @check="nodeCheck"
            >
              <span slot-scope="{ data }">
                <span v-if="data.type !== 'SENSOR'">
                  <i
                    :class="[
                      'node-' +
                        (data.type !== 'MACHINE'
                          ? data.alarmLevel
                          : data.networkStatus === 'ONLINE'
                          ? data.alarmLevel
                          : 'OFFLINE'),
                      'node-circle',
                    ]"
                  ></i>
                </span>
                <span v-else>
                  <i
                    v-if="!data.isLeaf"
                    class="fa fa-folder-open font-10 vertical-middle"
                    :class="'color-' + data.alarmLevel"
                    aria-hidden="true"
                  />
                  <i
                    v-if="data.isLeaf"
                    class="fa fa-thumb-tack isLeaf font-10 vertical-middle"
                    :class="'color-' + data.alarmLevel"
                    aria-hidden="true"
                  />
                </span>
                <span class="node-label">{{ data.name }}</span>
              </span>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium" :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
        <template v-if="this.options.winData.oper !== 'view'">
          <el-button size="medium" :disabled="loading" type="primary" @click="submitForm(ruleForm)">{{
            $t('common.confirm')
          }}</el-button>
        </template>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modalMixin from '@/plugins/modal/mixin';
import { mapState, mapMutations } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import { newFormatGroupSelectOptions } from '@/util/commonService';
import debounce from 'lodash/debounce';

export default {
  mixins: [modalMixin],
  name: 'templateAddModal',
  computed: {
    ...mapState('cms/pass', ['passList', 'machineSelectedList', 'hierarchy']),
  },
  data() {
    return {
      loading: false,
      ruleForm: {
        name: '',
        content: '',
      },
      defaultCheckedKeys: [],
      defaultExpandedKeys: [], // 默认展开的节点
      copyPassList: [],
      defaultProps: {
        children: 'hierarchies',
        label: 'name',
        isLeaf: 'isLeaf',
      },
      templateInfo: {}, // 模板信息
      passSensorList: [], // 点击机组后请求回来的传感器原始数据列表
      passSensorTreeData: [], // 处理以后的传感器树形结构
      allCheckedIds: [], // 所有选中的节点
    };
  },
  watch: {
    passList: {
      handler(val) {
        // 通道列表刷新时，如果刷新前的key还存在，则需要重新设置选中的key
        if (!val || val.length === 0) {
          this.selectedNodeKey = '';
          this.defaultExpandedKeys = [];
          return;
        }
        this.defaultExpandedKeys = this.getDefaultExpandedKeys(val);
      },
      immediate: true,
    },
    passSensorList: {
      handler(val) {
        if (this.machineSelectedList.includes(this.machineId)) {
          val
            .filter((v) => {
              let info;
              try {
                info = JSON.parse(v.additionalInfo);
              } catch (error) {
                info = {};
              }
              if (info && info.deviceType && info.deviceType[0]) {
                if (info.deviceType[0] === 'speed') {
                  return false;
                }
              }
              return true;
            })
            .forEach((v) => {
              // this.handleWorkshopHierarchy('SENSOR', true, v, this.workshopData, this.machineData);
            });
        }
        // 设置风机下的传感器树形全部展开
        val
          .map((i) => i.name)
          .forEach((name) => {
            const nameArr = name.split('_');
            nameArr.pop();
            if (nameArr && nameArr.length > 0) {
              nameArr.forEach((n) => {
                // this.defaultExpandedKeys.push(n);
              });
            }
          });
        let curPassSensor;
        if (this.passSensor && this.passSensor.id) {
          curPassSensor = val.filter((i) => i.id === this.passSensor.id)[0];
        } else {
          curPassSensor = val[0];
        }
        if (!curPassSensor || !curPassSensor.name) {
          return;
        }
        this.$nextTick(() => {
          this.selectedNodeKey = curPassSensor.id;
          this.$refs.passTree.setCurrentKey(this.selectedNodeKey);
          const nameArr = curPassSensor.name.split('_');
          let name;
          if (nameArr.length <= 1) {
            name = curPassSensor.name;
          } else {
            name = nameArr.slice(2).join('_');
          }
          this.savePassSensor({
            passSensor: { ...curPassSensor, isLeaf: true, originName: curPassSensor.name, name, type: 'SENSOR' },
          });
        });
      },
    },
    /**
     * 选中的所有节点
     */
    allCheckedIds: {
      handler(val) {
        // 从原始的树形数据中拿到该区域的树形结果
        const checkedNodes = val.checkedNodes.map((mVal) => mVal.id);
        const halfCheckedNodes = val.halfCheckedNodes.map((hVal) => hVal.id);
        const allCheckedIds = val.allCheckedIds.map((aVal) => aVal.id);
        this.ruleForm.content = {
          checkedNodes,
          halfCheckedNodes,
          allCheckedIds,
        };
      },
    },
  },
  mounted() {
    this.copyPassList = cloneDeep(this.passList);
    // 如果是编辑、查看模式 则获取模板信息
    if (this.options.winData.oper === 'edit' || this.options.winData.oper === 'view') {
      this.templateInfo = this.options.winData.info;
      this.ruleForm.name = this.templateInfo.name;
      this.ruleForm.content = this.templateInfo.content;
      this.$nextTick().then(() => {
        if (!this.templateInfo || !this.templateInfo.content) {
          return;
        }
        this.defaultExpandedKeys = this.templateInfo.content.halfCheckedNodes || [];
        setTimeout(() => {
          const checkedNodes = this.templateInfo.content.checkedNodes || [];
          this.$refs.passTree.setCheckedKeys(checkedNodes);
        }, 500);
      });
    }
  },
  methods: {
    ...mapMutations('cms/pass', ['saveBreadCrumb', 'saveHierarchy', 'savePassSensor', 'saveWorkshopHierarchy']),
    /**
     * 提交表单
     */
    submitForm: debounce(
      function submitForm() {
        if (
          !this.ruleForm.content ||
          !this.ruleForm.content.checkedNodes ||
          this.ruleForm.content.checkedNodes.length < 1
        ) {
          this.$msg.error(this.$t('history.invalid.selectMachine'));
          return;
        }
        if (!this.ruleForm.name || this.ruleForm.name.length < 1) {
          this.$msg.error(this.$t('history.placeholder.templateName'));
          return;
        }
        if (this.options.winData.oper === 'create') {
          this.createDataTemplate(this.ruleForm);
        }
        if (this.options.winData.oper === 'edit') {
          this.ruleForm.id = this.templateInfo.id;
          this.updateHistoryTemplate(this.ruleForm);
        }
      },
      300,
      {
        leading: true,
        trailing: false,
      }
    ),
    /**
     * 获取模板数据
     */
    getTempateData() {},
    /**
     * 创建数据模板
     */
    createDataTemplate(formData) {
      if (!formData) {
        return;
      }
      const newData = {
        ...formData,
      };
      this.loading = true;
      this.$api.history
        .addHistoryTemplate(newData)
        .then((res) => {
          console.log(res);
          if (!res || !res.id) {
            this.$msg.error(this.$t('history.failure.create'));
          }
          this.$msg.success(this.$t('history.success.create'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 编辑数据模板
     */
    updateHistoryTemplate(formData) {
      this.loading = true;
      this.$api.history
        .updateHistoryTemplate(formData)
        .then((res) => {
          if (!res || !res.id) {
            this.$msg.error(this.$t('history.failure.update'));
          }
          this.$msg.success(this.$t('history.success.update'));
          this.handleConfirm();
        })
        .catch((err) => {
          this.$msg.error(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 加载传感器
     */
    loadNode(node, resolve) {
      if (Object.prototype.toString.call(node.data) === '[object Array]') {
        return resolve(node.data);
      }
      if (Object.prototype.toString.call(node.data) === '[object Object]') {
        if (node.data.type !== 'MACHINE') {
          return resolve(node.data.hierarchies);
        }
        const workshopId = node.parent.data.id;
        const machineId = node.data.id;
        this.passSensorList = [];
        this.passSensorTreeData = [];
        this.$api.overview
          .getSensorCount(machineId, workshopId)
          .then((res) => {
            if (!res || !res.sensorDTOList || res.sensorDTOList.length === 0) {
              return resolve([]);
            }
            this.machineId = machineId;
            this.machineData = node.data;
            this.workshopData = node.parent.data;
            this.passSensorList = res.sensorDTOList;
            const data = res.sensorDTOList.map((i) => ({
              originName: i.name || '',
              name: i.name || '',
              id: i.id || '',
              additionalInfo: i.additionalInfo || '',
              alarmLevel: i.alarmLevel || 'OK',
              machineId: i.machineId || null,
              machineName: i.machineName || null,
              variates: i.variates || [],
              networkStatus: 'ONLINE',
              type: 'SENSOR',
            }));
            const result = newFormatGroupSelectOptions(data);
            this.passSensorTreeData = result;
            this.copyPassList[0].hierarchies.map((pVal) => {
              if (pVal.id === machineId) {
                if (!pVal.hierarchies || pVal.hierarchies.length < 1) {
                  pVal.hierarchies = data;
                }
              }
              return pVal;
            });
            return resolve(result);
          })
          .catch(() => resolve([]));
      }
    },
    /**
     * 复选框 选中、取消触发动作
     */
    nodeCheck(data, node) {
      this.checkedId = node.checkedKeys;
      const checkedNodes = this.getCheckedNodes(node.checkedNodes);
      const newArr = {};
      newArr.checkedNodes = checkedNodes;
      newArr.halfCheckedNodes = node.halfCheckedNodes;
      newArr.allCheckedIds = checkedNodes.concat(node.halfCheckedNodes);
      /** 选中赋值 */
      this.allCheckedIds = newArr;
    },
    /*
     * 遍历选中的节点
     */
    getCheckedNodes(checkedNodes) {
      let obj = [];
      if (!checkedNodes || checkedNodes.length < 1) {
        return obj;
      }
      checkedNodes.forEach((val) => {
        // if (!isNaN(val.id)) {
        obj.push(val);
        // }
        if (val.hierarchies && val.hierarchies.length > 0) {
          obj = obj.concat(this.getCheckedNodes(val.hierarchies));
        }
      });
      return obj;
    },
    /**
     * 获取默认展开项
     */
    getDefaultExpandedKeys(arr) {
      let result = [];
      arr.forEach((i) => {
        result.push(i.id);
        if (i.hierarchies.length > 0 && i.type !== 'WORKSHOP') {
          const childResult = this.getDefaultExpandedKeys(i.hierarchies);
          result = [...result, ...childResult];
        }
      });
      return result;
    },
  },
};
</script>
<style lang="less" scoped>
#template-add-modal {
  .role-set-container {
    max-height: 400px;
    overflow: auto;
  }
  .pass-box {
    width: 500px;
    height: 300px;
    overflow: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    &:hover {
      border-color: #409eff;
    }
  }
}
</style>
