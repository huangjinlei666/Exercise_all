// const permissionDescrition = {
//   UserManage: ['用户管理'],
//   ProjectManage: ['项目配置'],
//   ViewData: ['概览(不包含确认报警操作)', '常规图谱', '启停机图谱', '列表日志', '智能助手'],
//   ConfirmAlarm: ['概览-确认报警'],
//   GenerateReport: [],
//   ChangeAlarmValue: ['报警设置', '工况设置'],
//   AddAlgorithm: [],
//   BackupDatabase: ['数据管理'],
//   ChartSetting: ['图谱设置'],
// };

// 菜单 侧边栏
export default [
  // 概览
  { path: '/index', title: 'menu.overview', icon: '/images/menu/icon-gailan.png' },
  // 总貌图
  {
    path: '/general',
    title: 'menu.general',
    icon: '/images/menu/icon-zongmaotu.png',
    permission: 'ViewData',
  },
  // 故障诊断
  {
    path: '',
    title: 'menu.listLogs',
    icon: '/images/menu/icon-guzhangzhenduan.png',
    permission: 'ViewData',
    children: [
      { path: '/alarmLog', title: 'menu.alarmLog' },
      { path: '/faultReasonList', title: 'menu.faultReasonList' },
      { path: '/faultDiagnosis', title: 'menu.faultDiagnosis' },
      // { path: '/faultDiagnosisBatch', title: 'menu.faultDiagnosisBatch' },
      // { path: '/routineAtlas', title: 'menu.diagnosis' }
    ],
  },
  // 系统设置
  {
    path: '',
    title: 'menu.systemSet',
    icon: '/images/menu/icon-xitongshezhi.png',
    children: [
      { path: '/userManage', title: 'menu.userManage', permission: 'UserManage' },
      // { path: '/roleManage', title: 'menu.roleManage', permission: 'UserManage' },
      { path: '/projectSet', title: 'menu.projectSet', permission: 'ProjectManage' },
      { path: '/atlasSet', title: 'menu.atlasSet', permission: 'ChartSetting' },
      { path: '/alarmSet', title: 'menu.alarmSet', permission: 'ChangeAlarmValue' },
      { path: '/publicStrategy', title: 'menu.publicStrategy' },
      { path: '/strategySend', title: 'menu.strategySend' },
    ],
  },
  // 数据管理
  {
    path: '',
    title: 'menu.dataManage',
    icon: '/images/menu/icon-shujuguanli.png',
    permission: 'BackupDatabase',
    children: [
      // { path: '/dilutionRule', title: 'menu.dilutionRule' },
      { path: '/bearing', title: 'menu.bearing' },
      // { path: '/gearbox', title: 'menu.gearbox' },
      { path: '/history', title: 'menu.history' },
      { path: '/synclist', title: 'menu.sycnList' },
      { path: '/standingBook', title: 'menu.standingBook' },
      { path: '/vibrationMonitoring', title: 'menu.vibrationMonitoring' },
      { path: '/alternator', title: 'menu.alternator' },
      { path: '/gearcase', title: 'menu.gearcase' },
      { path: '/principalAxis', title: 'menu.principalAxis' },
      { path: '/blade', title: 'menu.blade' },
      { path: '/coupling', title: 'menu.coupling' },
      // { path: '/frequencyCount', title: 'menu.frequencyCount' },
      { path: '/bearingPosition', title: 'menu.bearingPosition' },
      { path: '/gearFrequency', title: 'menu.gearFrequency' },
      { path: '/fan', title: 'menu.fan' },
    ],
  },
  // 设备管理
  {
    path: '/device',
    title: 'menu.deviceLifeCycle',
    icon: '/images/menu/icon-shebeiguanli.png',
  },
  // 传感器管理
  {
    path: '/sensor',
    title: 'menu.sensorManage',
    icon: '/images/menu/icon-chuanganqiguanli.png',
  },
  // 知识库
  {
    path: '',
    title: 'menu.database',
    icon: '/images/menu/icon-zhishiku.png',
    children: [
      { path: '/categoryMng', title: 'menu.categoryMng' },
      { path: '/documentMng', title: 'menu.documentMng' },
    ],
  },
  // 设备模板管理
  {
    path: '',
    title: 'menu.deviceSet',
    icon: '/images/menu/icon-shebeimobanguanli.png',
    children: [
      { path: '/equipmentMng', title: 'menu.addDevice' },
      { path: '/templateMng', title: 'menu.templateMng' },
      { path: '/productTemplate', title: 'menu.productTemplate' },
    ],
  },
];
