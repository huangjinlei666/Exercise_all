import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 报警/预警总数
export const getAlarmCount = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/statistics/alarm/count`,
    method: 'get',
    params,
  });
};
// 区域列表
export const getFactoryCount = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/hierarchy/${hierarchyId}`,
    method: 'get',
  });
// 获取风机状况
export const getFanCondition = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/machine/state/${hierarchyId}`,
    method: 'get',
  });
// 获取告警趋势数据
export const getAlarmTrend = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/alarm/trend/${hierarchyId}`,
    method: 'get',
  });
// 风场故障前五数据
export const getTopfiveFaults = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/factory/fault-workshop/${hierarchyId}`,
    method: 'get',
  });
// 故障统计原因
export const getFaultStatistics = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/fault/cause/${hierarchyId}`,
    method: 'get',
  });
// 风场下的机组状态
export const getUnitStatus = (workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/machine/count`,
    method: 'get',
    params: {
      workshopId,
    },
  });
// 风机部件故障原因统计
export const getComponentFailure = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/part/fault/${hierarchyId}`,
    method: 'get',
  });
// 品牌故障总数
export const getBrandFailure = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/brand/fault/count/${hierarchyId}`,
    method: 'get',
  });
// 风机设备信息
export const getFanEquipment = (machineId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/machine/equipment-info/${machineId}`,
    method: 'get',
  });
// 风机转速信息
export const getFanSpeed = (workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/workshop/machine-speed/${workshopId}`,
    method: 'get',
  });
// 车间列表
export const getWorkshopCount = (factoryId) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/workshop/count`,
    method: 'get',
    params: {
      factoryId,
    },
  });
// 机组列表
export const getMachineCount = (workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/machine/count`,
    method: 'get',
    params: {
      workshopId,
    },
  });
// 传感器列表
export const getSensorCount = (machineId, workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/sensor/count`,
    method: 'get',
    params: {
      machineId,
      workshopId,
    },
  });
// 预警故障部件统计
export const getComponentAlarm = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/workshop/part/alarm/${hierarchyId}`,
    method: 'get',
  });
// 风场-设备状态
export const deviceStatus = (workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/summary/workshop/state/${workshopId}`,
    method: 'get',
  });
// 获取时间差
export const getTimeDiffer = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineInfo/sysTime/${id}`,
    method: 'get',
  });
// 获取传感器设备详情
export const getMachineDevice = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/${id}`,
    method: 'get',
  });
// 获取风机设备详情
export const getDevice = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/machine/${id}`,
    method: 'get',
  });
// 风机在线状态统计
export const getMachineStatus = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/machine/status/count/byHierarchyId/${id}`,
    method: 'get',
  });

// 传感器在线状态统计
export const getSensorStatus = (id, sensorType = '') =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/sensor/status/count/byHierarchyId/${id}`,
    method: 'get',
    params: {
      sensorType
    },
  });
// 获取风机下所有通道状态
export const getMachineDeviceStatus = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/status/list/${id}`,
    method: 'get',
  });
// 获取风机信息详情
export const getMachineInfo = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineInfo/${id}`,
    method: 'get',
  });

// 根据层级id统计风机预警和故障数量
export const getMachineStatisticsByHierarchyId = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/machine/level/count/byHierarchyId/${id}`,
    method: 'get',
  });
// 根据层级id获取风机状态分页数据
export const getMachineListByStatus = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/machine/list/byStatus`,
    method: 'get',
    params
  });

// 根据层级id获取风机状态分页数据
export const getSensorListByStatus = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/sensor/list/byStatus`,
    method: 'get',
    params
  });

/**
 * 离线风机信息导出
 * @param {*} uniqueNumber
 * @returns
 */
export const exportOfflineFan = (params) => request({
  url: `${baseUrl}/api/v1/cms/excel/export/machine/byStatus`,
  method: 'get',
  params,
});

/**
 * 离线传感器信息导出
 * @param {*} uniqueNumber
 * @returns
 */
export const exportOfflineSensor = (params) => request({
  url: `${baseUrl}/api/v1/cms/excel/export/sensor/byStatus`,
  method: 'get',
  params,
});

// 保存风机上传图片
export const saveMachinePhotos = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineInfo/images`,
    method: 'put',
    data,
  });
