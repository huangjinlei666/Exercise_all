import * as overview from './overview';
import * as user from './user';
import * as role from './role';
import * as projectSet from './projectSet';
import * as atlas from './atlas';
import * as bearing from './bearing';
import * as gearbox from './gearbox';
import * as history from './history';
import * as alarmLog from './alarmLog';
import * as alarmSet from './alarmSet';
import * as dilution from './dilution';
import * as routineAtlas from './routineAtlas';
import * as device from './device';
import * as database from './database';
import * as upload from './upload';
import * as screen from './screen';
import * as publicStrategy from './publicStrategy';
import * as strategySend from './strategySend';
import * as faultReasonList from './faultReasonList';
import * as faultDiagnosis from './faultDiagnosis';
import * as sensor from './sensor';
import * as syncList from './syncList';
import * as standingBook from './standingBook';
import * as vibrationMonitoring from './vibrationMonitoring';
import * as alternator from './alternator';
import * as gearcase from './gearcase';
import * as principalAxis from './principalAxis';
import * as blade from './blade';
import * as coupling from './coupling';
import * as frequencyCount from './frequencyCount';
import * as bearingPosition from './bearingPosition';
import * as templateMng from './templateMng';
import * as equipmentMng from './equipmentMng';
import * as productTemplate from './productTemplate';
import * as fan from './fan';
import * as monitor from './monitor';

export default {
  overview, // 概览
  user, // 用户管理
  role, // 角色管理
  projectSet, // 项目设置
  atlas, // 图谱设置
  bearing, // 轴承
  gearbox, // 齿轮箱
  history, // 历史数据
  alarmLog, // 报警日志
  alarmSet, // 报警设置
  dilution, // 数据稀释规则
  routineAtlas, // 常规图谱
  device, // 设备管理
  database, // 知识库
  upload, // 文件上传模块
  screen, // 集团大屏
  publicStrategy, // 策略下发
  strategySend, // 阈值下发
  faultReasonList, // 故障原因列表
  faultDiagnosis, // 人工故障诊断
  sensor, // 传感器管理
  syncList, // 同步列表
  standingBook, // 机组台账设备
  vibrationMonitoring, // 振动台账设备
  alternator, // 发电机
  gearcase, // 齿轮箱
  principalAxis, // 台账主轴
  blade, // 台账叶片
  coupling, // 台账联轴器
  frequencyCount, // 齿轮箱特征频率计算
  bearingPosition, // 轴承位置
  templateMng, // 设备模板管理
  equipmentMng, // 设备管理
  productTemplate, // 产品模板
  fan, // 风机台账
  monitor, // 监控
};
