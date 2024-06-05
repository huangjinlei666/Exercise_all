import layoutHeaderAside from '@/layout/header-aside/index.vue';
import General from '@/views/cms/generalMap/index.vue';
import ProjectSet from '@/views/cms/projectSet/index.vue';

// 懒加载页面
// eslint-disable-next-line
const _import = (file) => () => import( /* webpackChunkName: "[request]" */ '@/views/' + file);

/**
 * meta属性
 * title: 标题
 * auth: 是否需要校验token
 * needPass: 该页面是否需要通道信息
 * isDetail: 该页面是否为二级、三级页面
 */
const frameIn = [{
  path: '/',
  redirect: {
    name: 'index'
  },
  component: layoutHeaderAside,
  children: [
    // 概览
    {
      path: 'index',
      name: 'index',
      meta: {
        title: 'menu.overview',
        auth: true,
        needPass: true,
      },
      component: _import('cms/overview'),
    },
    // 总貌图
    {
      path: 'general',
      name: 'general',
      meta: {
        title: 'menu.general',
        auth: true,
        needPass: true,
      },
      component: General, // 总貌图不用懒加载，会造成卡顿
    },
    // 列表日志-报警日志
    {
      path: 'alarmLog',
      name: 'alarmLog',
      meta: {
        title: 'menu.alarmLog',
        auth: true,
        needPass: true,
      },
      component: _import('cms/alarmLog'),
    },
    // 故障原因
    {
      path: 'faultReasonList',
      name: 'faultReasonList',
      meta: {
        title: 'menu.faultReasonList',
        auth: true,
      },
      component: _import('cms/faultReasonList'),
    },
    // 人工故障诊断
    {
      path: 'faultDiagnosis',
      name: 'faultDiagnosis',
      meta: {
        title: 'menu.faultDiagnosis',
        auth: true,
      },
      component: _import('cms/faultDiagnosis'),
    },
    // 故障诊断批次
    // {
    //   path: 'faultDiagnosisBatch',
    //   name: 'faultDiagnosisBatch',
    //   meta: {
    //     title: 'menu.faultDiagnosis',
    //     auth: true,
    //   },
    //   component: _import('cms/faultDiagnosisBatch'),
    // },
    // 系统设置-用户管理
    {
      path: 'userManage',
      name: 'userManage',
      meta: {
        title: 'menu.userManage',
        auth: true,
      },
      component: _import('cms/userManage'),
    },
    // 系统设置-角色管理
    {
      path: 'roleManage',
      name: 'roleManage',
      meta: {
        title: 'menu.roleManage',
        auth: true,
      },
      component: _import('cms/roleManage'),
    },
    // 系统设置-项目配置
    {
      path: 'projectSet',
      name: 'projectSet',
      meta: {
        title: 'menu.projectSet',
        auth: true,
        needPass: true,
      },
      component: ProjectSet, // 项目配置不用懒加载，会造成卡顿
    },
    // 系统设置-公共策略
    {
      path: 'publicStrategy',
      name: 'publicStrategy',
      meta: {
        title: 'menu.publicStrategy',
        auth: true,
      },
      component: _import('cms/publicStrategy'),
    },
    // 系统设置-公共策略详情
    {
      path: 'strategyDetail',
      name: 'strategyDetail',
      meta: {
        title: 'menu.publicStrategy',
        auth: true,
        isDetail: true,
        parentPath: '/publicStrategy',
      },
      component: _import('cms/publicStrategy/detail'),
    },
    // 策略下发
    {
      path: 'strategySend',
      name: 'strategySend',
      meta: {
        title: 'menu.strategySend',
        auth: true,
        needPass: true,
      },
      component: _import('cms/strategySend'),
    },
    // 系统设置-图谱设置
    {
      path: 'atlasSet',
      name: 'atlasSet',
      meta: {
        title: 'menu.atlasSet',
        auth: true,
      },
      component: _import('cms/atlasSet'),
    },
    // 系统设置-报警设置
    {
      path: 'alarmSet',
      name: 'alarmSet',
      meta: {
        title: 'menu.alarmSet',
        auth: true,
        needPass: true,
      },
      component: _import('cms/alarmSet'),
    },
    // 系统设置-稳态运行存储稀释规则
    // {
    //   path: 'dilutionRule',
    //   name: 'dilutionRule',
    //   meta: {
    //     title: 'menu.dilutionRule',
    //     auth: true,
    //   },
    //   component: _import('cms/dilutionRule'),
    // },
    // 系统设置-滚动轴承数据库导入
    {
      path: 'bearing',
      name: 'bearing',
      meta: {
        title: 'menu.bearing',
        auth: true,
      },
      component: _import('cms/bearing'),
    },
    // 系统设置-齿轮箱数据库导入
    /* {
      path: 'gearbox',
      name: 'gearbox',
      meta: {
        title: 'menu.gearbox',
        auth: true,
      },
      component: _import('cms/gearbox'),
    }, */
    // 系统设置-历史数据导出
    {
      path: 'history',
      name: 'history',
      meta: {
        title: 'menu.history',
        auth: true,
        needPass: true,
      },
      component: _import('cms/history'),
    },
    // 历史数据模板
    {
      path: 'history/dataTemplate',
      name: 'dataTemplate',
      meta: {
        title: 'menu.history',
        auth: true,
        isDetail: true,
        parentPath: '/history',
      },
      component: _import('cms/history/dataTemplate'),
    },
    // 系统设置-同步列表
    {
      path: 'synclist',
      name: 'synclist',
      meta: {
        title: 'menu.sycnList',
        auth: true,
      },
      component: _import('cms/syncList'),
    },
    // 设备台账基本信息
    {
      path: '/standingBook',
      name: 'standingBook',
      meta: {
        title: 'menu.standingBook',
        auth: true,
      },
      component: _import('cms/standingBook'),
    },
    // 振动监测设备台账信息
    {
      path: 'vibrationMonitoring',
      name: 'vibrationMonitoring',
      meta: {
        title: 'menu.vibrationMonitoring',
        auth: true,
      },
      component: _import('cms/vibrationMonitoring'),
    },
    // 发电机 alternator
    {
      path: 'alternator',
      name: 'alternator',
      meta: {
        title: 'menu.alternator',
        auth: true,
      },
      component: _import('cms/alternator'),
    },
    // 齿轮箱
    {
      path: 'gearcase',
      name: 'gearcase',
      meta: {
        title: 'menu.gearcase',
        auth: true,
      },
      component: _import('cms/gearcase'),
    },
    // 台账主轴
    {
      path: 'principalAxis',
      name: 'principalAxis',
      meta: {
        title: 'menu.principalAxis',
        auth: true,
      },
      component: _import('cms/principalAxis'),
    },
    // 台账叶片
    {
      path: 'blade',
      name: 'blade',
      meta: {
        title: 'menu.blade',
        auth: true,
      },
      component: _import('cms/blade'),
    },
    // 台账联轴器
    {
      path: 'coupling',
      name: 'coupling',
      meta: {
        title: 'menu.coupling',
        auth: true,
      },
      component: _import('cms/coupling'),
    },
    // 齿轮箱特征频率计算
    {
      path: 'frequencyCount',
      name: 'frequencyCount',
      meta: {
        title: 'menu.frequencyCount',
        auth: true,
      },
      component: _import('cms/frequencyCount'),
    },
    // 齿轮箱特征频率计算
    {
      path: 'gearFrequency',
      name: 'gearFrequency',
      meta: {
        title: 'menu.gearFrequency',
        auth: true,
      },
      component: _import('cms/gearFrequency'),
    },
    // 轴承位置
    {
      path: 'bearingPosition',
      name: 'bearingPosition',
      meta: {
        title: 'menu.bearingPosition',
        auth: true,
      },
      component: _import('cms/bearingPosition'),
    },
    // 设备管理
    {
      path: 'device',
      name: 'device',
      meta: {
        title: 'menu.device',
        auth: true,
        needPass: true,
      },
      component: _import('cms/device'),
    },
    // 传感器管理
    {
      path: 'sensor',
      name: 'sensor',
      meta: {
        title: 'menu.sensorManage',
        auth: true,
      },
      component: _import('cms/sensorManage'),
    },
    // 类目管理
    {
      path: 'categoryMng',
      name: 'categoryMng',
      meta: {
        title: 'menu.categoryMng',
        auth: true,
      },
      component: _import('cms/categoryMng'),
    },
    // 文档管理
    {
      path: 'documentMng',
      name: 'documentMng',
      meta: {
        title: 'menu.documentMng',
        auth: true,
      },
      component: _import('cms/documentMng'),
    },
    // 设备管理
    {
      path: 'equipmentMng',
      name: 'equipmentMng',
      meta: {
        title: 'menu.equipmentMng',
        auth: true,
      },
      component: _import('cms/equipmentMng'),
    },
    // 设备详情
    {
      path: 'equipmentDetail',
      name: 'equipmentDetail',
      meta: {
        title: 'menu.equipmentMng',
        auth: true,
        isDetail: true,
        parentPath: '/equipmentMng',
      },
      component: _import('cms/equipmentMng/detail'),
    },
    // 模板管理
    {
      path: 'templateMng',
      name: 'templateMng',
      meta: {
        title: 'menu.templateMng',
        auth: true,
      },
      component: _import('cms/templateMng'),
    },
    // 产品模板
    {
      path: 'productTemplate',
      name: 'productTemplate',
      meta: {
        title: 'menu.productTemplate',
        auth: true,
      },
      component: _import('cms/productTemplate'),
    },
    // 风机台账
    {
      path: 'fan',
      name: 'fan',
      meta: {
        title: 'menu.fan',
        auth: true,
      },
      component: _import('cms/fan'),
    },
    // 刷新页面 必须保留 勿删
    {
      path: 'refresh',
      name: 'refresh',
      hidden: true,
      component: _import('system/function/refresh'),
    },
    // 页面重定向 必须保留 勿删
    {
      path: 'redirect/:route*',
      name: 'redirect',
      hidden: true,
      component: _import('system/function/redirect'),
    },
  ],
}, ];

/**
 * 登录路由
 */
const loginRoute = [
  // 登录
  {
    path: '/login',
    name: 'login',
    component: _import('system/login'),
  },
];
/**
 * 更新密码
 */
const editPwdRoute = [
  // 登录
  {
    path: '/editPwd',
    name: 'editPwd',
    component: _import('system/editPwd'),
  },
];

/**
 * 错误页面
 */
const errorPage = [{
  path: '*',
  name: '404',
  component: _import('system/error/404'),
}, ];

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 大屏看板
  // {
  //   path: '/board',
  //   name: 'board',
  //   meta: {
  //     auth: true,
  //   },
  //   component: _import('cms/board'),
  // },
  // 集团大屏
  {
    path: '/screen',
    name: 'screen',
    meta: {
      auth: true,
    },
    component: _import('cms/screen'),
    children: [{
        path: 'farm',
        name: 'farm',
        meta: {
          auth: true,
        },
        component: _import('cms/screen/farm'),
      },
      {
        path: 'machine',
        name: 'machine',
        meta: {
          auth: true,
        },
        component: _import('cms/screen/machine'),
      },
    ],
  },
  // 常规图谱
  {
    path: '/routineAtlas',
    name: 'routineAtlas',
    meta: {
      title: 'menu.routineAtlas',
      auth: true,
    },
    component: _import('cms/routineAtlas'),
  },
];

function replaceUrl(url) {
  return url.replace(/\/\//, '/');
}

function extractFrameoutUrl(arr, parentPath, resUrlArr) {
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      extractFrameoutUrl(item.children, `${item.path}/`, resUrlArr);
    } else {
      resUrlArr.push(replaceUrl(parentPath + item.path));
    }
  });
}

function extractDetailUrl(arr, parentPath, detailUrlArr) {
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      extractDetailUrl(item.children, `${item.path}/`, detailUrlArr);
    }
    if (item.meta && item.meta.isDetail) {
      detailUrlArr.push(replaceUrl(parentPath + item.path));
    }
  });
}

function extractNeedPassUrl(arr, parentPath, needPassUrlArr) {
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      extractNeedPassUrl(item.children, `${item.path}/`, needPassUrlArr);
    }
    if (item.meta && item.meta.needPass) {
      needPassUrlArr.push(replaceUrl(parentPath + item.path));
    }
  });
}

const frameOutUrlArr = [];
extractFrameoutUrl(frameOut, '', frameOutUrlArr);

const detailUrlArr = [];
extractDetailUrl(frameIn, '', detailUrlArr);

const needPassUrlArr = [];
extractNeedPassUrl(frameIn, '', needPassUrlArr);

// 导出需要添加到“允许访问path列表”的url
export const extraAllowPathArr = [...frameOutUrlArr, ...detailUrlArr];

// 导出需要通道信息的url
export const needPassPathArr = [...needPassUrlArr];

// 重新组织后导出
export default [...frameIn, ...loginRoute, ...errorPage, ...frameOut, ...editPwdRoute];
