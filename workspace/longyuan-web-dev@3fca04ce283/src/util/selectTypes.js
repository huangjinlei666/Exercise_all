// 常规图谱
export const dataTypes = [
  { value: 'REALTIME', label: 'routineAtlas.selectTypes.realtime' },
  { value: 'HISTORY', label: 'routineAtlas.selectTypes.history' },
];
export const radioTypes = [
  { value: 'general', label: 'routineAtlas.selectTypes.general' },
  {
    value: 'trend',
    label: 'routineAtlas.selectTypes.trend',
    funcName: 'getTrendMap',
    type: 'TENDENCY',
  },
  {
    value: 'waveform',
    label: 'routineAtlas.selectTypes.waveform',
    funcName: 'getWaveformMap',
    type: 'WAVEFORM',
  },
  {
    value: 'spectrum',
    label: 'routineAtlas.selectTypes.spectrum',
    funcName: 'getSpectrumMap',
    type: 'SPECTRUM',
  },
  {
    value: 'integral',
    label: 'routineAtlas.selectTypes.integral',
    funcName: 'getIntegralMap',
    type: 'INTEGRAL',
  },
  {
    value: 'envelope',
    label: 'routineAtlas.selectTypes.envelope',
    funcName: 'getEnvelopeMap',
    type: 'ENVELOPE',
  },
];
export const extremumTypes = [
  { value: 'specifiedWay', label: 'routineAtlas.selectTypes.specifiedWay' },
  { value: 'specifiedValue', label: 'routineAtlas.selectTypes.specifiedValue' },
];
// 用户列表-搜索选项
export const userSearchTypes = [
  { value: 'name', label: 'user.username' },
  { value: 'email', label: 'user.email' },
  { value: 'phoneNumber', label: 'user.phoneNumber' },
];
// 通道层级
export const passTypes = ['ROOT', 'PROJECT', 'FACTORY', 'WORKSHOP', 'MACHINE'];
// 数据稀释规则
export const dilutionTypes = [
  { label: 'dilution.digitDilution', value: 'VALUE' },
  { label: 'dilution.arrayDilution', value: 'ARRAY' },
];
export const intervalUnitTypes = [
  { label: 'common.second', value: 'SECOND' },
  { label: 'common.minute', value: 'MINUTE' },
  { label: 'common.hour', value: 'HOUR' },
  { label: 'common.day', value: 'DAY' },
  // { label: 'common.month', value: 'MONTH' },
];
// 报警等级
export const alarmLevels = [
  { label: 'common.OK', value: 'OK', color: '0x64c42d' },
  { label: 'common.ATTENTION', value: 'ATTENTION', color: '0xf8cf00' },
  // { label: 'common.WARN', value: 'WARN' },
  { label: 'common.ERROR', value: 'ERROR', color: '0xdf3317' },
  // { label: 'common.EMERGENCY', value: 'EMERGENCY' },
];
// 报警确认
export const alarmVerifies = [
  { label: 'common.UNVERIFIED', value: 'UNVERIFIED' },
  { label: 'common.VERIFIED', value: 'VERIFIED' },
];
// 总貌图传感器
export const fengdianSensorNames = [
  'sensor_outter',
  'sensor_engine_free',
  'sensor_engine_inner',
  'sensor_engine_load',
  'sensor_gearbox_high',
  'sensor_gearbox_middle',
  'sensor_gearbox_low',
  'sensor_bearing_top',
];
// 横坐标单位
export const abscissaTypes = [
  { value: 'Hz', label: 'routineAtlas.frequency' },
  { value: 'order', label: 'routineAtlas.doubling' },
];
// 趋势图-倍频类型
export const trendDoublingTypes = [
  { value: '1', label: 'routineAtlas.doubling1' },
  { value: '2', label: 'routineAtlas.doubling2' },
];

// 图谱查询的特征值类型，加速度，速度
export const extensionTypes = [
  { value: 'accelerated', label: 'routineAtlas.accelerationAxis' },
  { value: 'speed', label: 'routineAtlas.speedAxis1' },
];

// 客户列表
export const projectArr = [
  { value: 'mingyang', label: 'projectSet.mingyang' },
  { value: 'hongfeng', label: 'projectSet.hongfeng' },
  { value: 'xingang', label: 'projectSet.xingang' },
];

// 看板页面，颜色预设
export const colorArray = [
  '#00ff00',
  '#ffffe0',
  '#8470ff',
  '#87cefa',
  '#ffa07a',
  '#ff86c1',
  '#90ee90',
  '#f08080',
  '#f0e68c',
  '#4b0082',
  '#cd5c5c',
  '#ff69b4',
  '#ff00ff',
  '#1e90ff',
  '#ff1493',
  '#9400d3',
];

// 龙源项目总貌图测点位置列表
export const nonDirectSensorNameList = [
  {
    location: 'mainBearing',
    name: 'routineAtlas.mainBearing',
    coordinate: { x: '2%', y: '4%' },
  },
  {
    location: 'gearBox',
    name: 'routineAtlas.gearBox',
    coordinate: { x: '2%', y: '34%' },
  },
  {
    location: 'engine',
    name: 'routineAtlas.engine',
    coordinate: { x: '2%', y: '64%' },
  },
];

export const directSensorNameList = [
  {
    location: 'mainBearing',
    name: 'routineAtlas.mainBearing',
    coordinate: { x: '2%', y: '4%' },
  },
  {
    location: 'engine',
    name: 'routineAtlas.engine',
    coordinate: { x: '2%', y: '50%' },
  },
];

// 设备生命周期
// 设备出厂 DEVICE_DELIVERY
// 设备升级 DEVICE_UPGRADE
// 设备警告 DEVICE_ALARM
// 专家诊断故障 EXPERT_DIAGNOSIS
// 日志上报 LOG_REPORT
// 设备自检 DEVICE_SELF_CHECK
// 备件更换 DEVICE_REPLACE
// 设备维修 DEVICE_MAINTAIN
// 设备报废 DEVICE_SCRAPPING
export const deiviceLifeCycleTypes = [
  {
    label: 'device.DEVICE_DELIVERY',
    value: 'DEVICE_DELIVERY',
  },
  {
    label: 'device.DEVICE_UPGRADE',
    value: 'DEVICE_UPGRADE',
  },
  {
    label: 'device.DEVICE_ALARM',
    value: 'DEVICE_ALARM',
  },
  // {
  //   label: 'device.EXPERT_DIAGNOSIS',
  //   value: 'EXPERT_DIAGNOSIS',
  // },
  // {
  //   label: 'device.LOG_REPORT',
  //   value: 'LOG_REPORT',
  // },
  // {
  //   label: 'device.DEVICE_SELF_CHECK',
  //   value: 'DEVICE_SELF_CHECK',
  // },
  {
    label: 'device.DEVICE_REPLACE',
    value: 'DEVICE_REPLACE',
  },
  {
    label: 'device.DEVICE_MAINTAIN',
    value: 'DEVICE_MAINTAIN',
  },
  {
    label: 'device.DEVICE_SCRAPPING',
    value: 'DEVICE_SCRAPPING',
  },
];

// 添加告警确认时的类型
export const verifyTypes = [
  {
    label: 'device.DEVICE_UPGRADE',
    value: 'DEVICE_UPGRADE',
  },
  {
    label: 'device.DEVICE_REPLACE',
    value: 'DEVICE_REPLACE',
  },
  {
    label: 'device.DEVICE_MAINTAIN',
    value: 'DEVICE_MAINTAIN',
  },
  {
    label: 'device.DEVICE_SCRAPPING',
    value: 'DEVICE_SCRAPPING',
  },
];

// 轴承审批状态
export const bearingStatuses = [
  {
    label: 'bearing.PENDING',
    value: 'PENDING',
  },
  {
    label: 'bearing.PASSED',
    value: 'PASSED',
  },
  {
    label: 'bearing.NOT_PASSED',
    value: 'NOT_PASSED',
  },
];

// 趋势图不同类型图谱的下拉选择类型
export const chartTypes = [
  {
    value: 'Trend',
    label: 'routineAtlas.selectTypes.trend',
  },
  {
    value: 'TrendDoubling',
    label: 'routineAtlas.selectTypes.trendDoubling',
  },
  {
    value: 'Waveform',
    label: 'routineAtlas.selectTypes.waveform',
  },
  {
    value: 'Spectrum',
    label: 'routineAtlas.selectTypes.spectrum',
  },
  {
    value: 'CepstrumSpectrum',
    label: 'routineAtlas.selectTypes.cepstrumSpectrum',
  },
  {
    value: 'Envelope',
    label: 'routineAtlas.selectTypes.envelope',
  },
];
// 原始数据的图谱的下拉选择类型
export const originalChartTypes = [
  {
    value: 'Waveform',
    label: 'routineAtlas.selectTypes.waveform',
  },
  {
    value: 'Spectrum',
    label: 'routineAtlas.selectTypes.spectrum',
  },
  {
    value: 'Envelope',
    label: 'routineAtlas.selectTypes.envelope',
  },
  {
    value: 'CepstrumSpectrum',
    label: 'routineAtlas.selectTypes.cepstrumSpectrum',
  },
  {
    value: 'TrendDoubling',
    label: 'routineAtlas.selectTypes.trendDoubling',
  },
];
// 对比的图谱下拉类型
export const compareChartTypes = [
  {
    value: 'Waveform',
    label: 'routineAtlas.selectTypes.waveform',
  },
  {
    value: 'Spectrum',
    label: 'routineAtlas.selectTypes.spectrum',
  },
  {
    value: 'Envelope',
    label: 'routineAtlas.selectTypes.envelope',
  },
  {
    value: 'CepstrumSpectrum',
    label: 'routineAtlas.selectTypes.cepstrumSpectrum',
  },
];
// 趋势图相同类型图谱的下拉选择类型
export const chartTypes0 = [
  {
    value: 'Trend',
    label: 'routineAtlas.selectTypes.trend',
    component: 'TrendMultiple',
  },
  {
    value: 'Waveform',
    label: 'routineAtlas.selectTypes.waveform',
    component: 'WaveformMultiple',
  },
  {
    value: 'CepstrumSpectrum',
    label: 'routineAtlas.selectTypes.cepstrumSpectrum',
    component: 'CepstrumspectrumMultiple',
  },
  {
    value: 'Spectrum',
    label: 'routineAtlas.selectTypes.spectrum',
    component: 'SpectrumMultiple',
  },
  {
    value: 'Envelope',
    label: 'routineAtlas.selectTypes.envelope',
    component: 'EnvelopeMultiple',
  },
];
export const regionData = {
  110000: { name: '北京区域', longitude: 116.405285, latitude: 39.904989 },
  120000: { name: '天津区域', longitude: 117.190182, latitude: 39.125596 },
  130000: { name: '河北区域', longitude: 114.502461, latitude: 38.045474 },
  140000: { name: '山西区域', longitude: 112.549248, latitude: 37.857014 },
  150000: { name: '内蒙古区域', longitude: 111.670801, latitude: 40.818311 },
  210000: { name: '辽宁区域', longitude: 123.429096, latitude: 41.796767 },
  220000: { name: '吉林区域', longitude: 125.3245, latitude: 43.886841 },
  230000: { name: '黑龙江区域', longitude: 126.642464, latitude: 45.756967 },
  310000: { name: '上海区域', longitude: 121.472644, latitude: 31.231706 },
  320000: { name: '江苏区域', longitude: 118.767413, latitude: 32.041544 },
  330000: { name: '浙江区域', longitude: 120.153576, latitude: 30.287459 },
  340000: { name: '安徽区域', longitude: 117.283042, latitude: 31.86119 },
  350000: { name: '福建区域', longitude: 119.306239, latitude: 26.075302 },
  360000: { name: '江西区域', longitude: 115.892151, latitude: 28.676493 },
  370000: { name: '山东区域', longitude: 117.000923, latitude: 36.675807 },
  410000: { name: '河南区域', longitude: 113.665412, latitude: 34.757975 },
  420000: { name: '湖北区域', longitude: 114.298572, latitude: 30.584355 },
  430000: { name: '湖南区域', longitude: 112.982279, latitude: 28.19409 },
  440000: { name: '广东区域', longitude: 113.280637, latitude: 23.125178 },
  450000: { name: '广西区域', longitude: 108.320004, latitude: 22.82402 },
  460000: { name: '海南区域', longitude: 110.33119, latitude: 20.031971 },
  500000: { name: '重庆区域', longitude: 106.504962, latitude: 29.533155 },
  510000: { name: '四川区域', longitude: 104.065735, latitude: 30.659462 },
  520000: { name: '贵州区域', longitude: 106.713478, latitude: 26.578343 },
  530000: { name: '云南区域', longitude: 102.712251, latitude: 25.040609 },
  540000: { name: '西藏区域', longitude: 91.132212, latitude: 29.660361 },
  610000: { name: '陕西区域', longitude: 108.948024, latitude: 34.263161 },
  620000: { name: '甘肃区域', longitude: 103.823557, latitude: 36.058039 },
  630000: { name: '青海区域', longitude: 101.778916, latitude: 36.623178 },
  640000: { name: '宁夏区域', longitude: 106.278179, latitude: 38.46637 },
  650000: { name: '新疆区域', longitude: 87.617733, latitude: 43.792818 },
  710000: { name: '台湾区域', longitude: 121.509062, latitude: 25.044332 },
  810000: { name: '香港区域', longitude: 114.173355, latitude: 22.320048 },
  820000: { name: '澳门区域', longitude: 113.54909, latitude: 22.198951 },
};

// 人工故障诊断部件
export const diagnosisParts = [
  { label: 'routineAtlas.mainBearing', value: 'BEARING' },
  { label: 'routineAtlas.gearBox', value: 'GEAR_CASE' },
  { label: 'routineAtlas.engine', value: 'GENERATOR' },
];

// 故障诊断批次状态
export const diagnosisStatus = [
  { label: 'faultDiagnosisBatch.INITIAL', value: 'INITIAL' },
  { label: 'faultDiagnosisBatch.PENDING', value: 'PENDING' },
  { label: 'faultDiagnosisBatch.FINISHED', value: 'FINISHED' },
];

// 传感器类型
export const sensorTypes = [{ label: 'sensor.ROTATING_VELOCITY', value: 'ROTATING_VELOCITY' }];

// 同步列表-同步状态
export const syncStatus = [
  { label: 'syncList.statusObj.unsuccess', value: false },
  { label: 'syncList.statusObj.success', value: true },
];

// 同步列表-同步类型
export const syncTypes = [
  { label: 'syncList.syncTypes.trendEigenvalue', value: 1 },
  { label: 'syncList.syncTypes.rawData', value: 2 },
  { label: 'syncList.syncTypes.thresholdAlarm', value: 3 },
];

// 同步列表-导出状态
export const exportStatus = [
  { label: 'routineAtlas.downloadReport.newBuild', value: 0 },
  { label: 'routineAtlas.downloadReport.unfinished', value: 1 },
  { label: 'routineAtlas.downloadReport.finished', value: 2 },
  { label: 'routineAtlas.downloadReport.failure', value: 3 },
];

export const uploadFileTypes = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword', // word 97-2003(*.doc)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // word(*.docx)
  'application/vnd.ms-excel', // Excel 97-2003(*.xls)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel(*.xlsx)
];

export const globleVariableTypes = [
  { value: 'AccelerationEffective', label: 'alarmSet.AccelerationEffective' },
  // { value: 'AccelerationPeak', label: 'alarmSet.AccelerationPeak' },
  { value: 'SpeedEffective', label: 'alarmSet.SpeedEffective' },
  { value: 'Kurtosis', label: 'alarmSet.Kurtosis' },
];
// 窗函数类型
export const functionTypes = [
  {
    label: 'routineAtlas.selectTypes.hanning',
    value: '0',
  },
  {
    label: 'routineAtlas.selectTypes.rectangle',
    value: '1',
  },
  {
    label: 'routineAtlas.selectTypes.heming',
    value: '2',
  },
  {
    label: 'routineAtlas.selectTypes.flat',
    value: '3',
  },
];
