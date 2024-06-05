import { getTopHierarchyTree } from '@/api/modules/cms/projectSet';
import { buildPassList } from '@/util/commonService';

export default {
  namespaced: true,
  state: {
    passLoading: false, // 通道列表请求状态
    passRootId: '', // 通道根节点id，根节点不展示，但创建项目时需要
    passList: [], // 通道列表
    breadCrumb: '', // 通道的面包屑
    hierarchy: {}, // 当前通道对象
    sensorRectClick: false, // 首页中是否点击了传感器卡片
    passCollapse: false, // 通道是否折叠
    reverseHierarchy: null, // 反向请求参数
    // 图谱
    passSensor: {}, // 保存传感器通道
    // 历史数据导出
    workshopHierarchy: null,
    workshopSelectedList: [],
    machineSelectedList: [],
    sensorSelectedList: [],
    // 阈值下发，风机及风机下面的层级对象
    passThreshold: {},
    // 通道信息选中风机
    machineHierarchies: [],
    // 选中的模板
    template: {},
    selectedNodes: {},
  },
  actions: {
    fetchPassInfo({ commit }) {
      return new Promise((resolve, reject) => {
        commit('savePassLoading', { loading: true });
        getTopHierarchyTree()
          .then((res) => {
            if (!res) {
              commit('savePassRootId', { rootId: '' });
              commit('savePassList', { passList: [] });
              commit('saveBreadCrumb', { breadCrumb: '' });
              commit('saveHierarchy', { hierarchy: {} });
              commit('cms/board/saveMachine', { machine: {} }, { root: true });
              resolve(true);
              return;
            }
            if (Object.prototype.toString.call(res) === '[object Array]') {
              commit('savePassRootId', { rootId: '' });
              commit('savePassList', { passList: res });
            }
            if (Object.prototype.toString.call(res) === '[object Object]') {
              if (!res.id) {
                commit('savePassRootId', { rootId: '' });
                commit('savePassList', { passList: [] });
              }
              if (res.id && res.type === 'ROOT') {
                commit('savePassRootId', { rootId: res.id });
                if (res.hierarchies && res.hierarchies.length >= 0) {
                  commit('savePassList', { passList: res.hierarchies });
                } else {
                  commit('savePassList', { passList: [] });
                }
              }
              if (res.id && res.type !== 'ROOT') {
                commit('savePassRootId', { rootId: '' });
                const passList = [res];
                buildPassList(passList);
                commit('savePassList', { passList });
              }
            }
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            commit('savePassLoading', { loading: false });
          });
      });
    },
  },
  mutations: {
    savePassLoading(state, action) {
      state.passLoading = action.loading;
    },
    savePassRootId(state, action) {
      state.passRootId = action.rootId;
    },
    savePassList(state, action) {
      state.passList = action.passList;
    },
    saveBreadCrumb(state, action) {
      state.breadCrumb = action.breadCrumb;
    },
    saveHierarchy(state, action) {
      state.hierarchy = action.hierarchy;
    },
    saveSensorRectClick(state, action) {
      state.sensorRectClick = action.sensorRectClick;
    },
    savePassCollapse(state, action) {
      state.passCollapse = action.passCollapse;
    },
    saveReverseHierarchy(state, hierarchy) {
      state.reverseHierarchy = hierarchy;
    },
    savePassInit(state) {
      state.breadCrumb = '';
      state.hierarchy = {};
      state.sensorRectClick = false;
      state.passCollapse = false;
      state.passSensor = {};
    },
    savePassSensor(state, action) {
      state.passSensor = action.passSensor;
    },
    savePassThreshold(state, action) {
      state.passThreshold = action.passThreshold;
    },
    saveWorkshopHierarchy(state, action) {
      state.workshopHierarchy = action.workshopHierarchy;
    },
    saveMachineHierarchies(state, action) {
      state.machineHierarchies = action.machineHierarchies;
    },
    /**
     * 保存模板信息
     * @param {*} state
     * @param {*} action
     */
    saveTemplate(state, action) {
      state.template = action.template;
    },
    saveSelectedNodes(state, action) {
      state.selectedNodes = action.selectedNodes;
    }
  },
};
