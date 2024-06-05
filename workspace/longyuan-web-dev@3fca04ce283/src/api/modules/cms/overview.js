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
// 工厂列表
export const getFactoryCount = (projectId) =>
  request({
    url: `${baseUrl}/api/v1/cms/statistics/factory/count`,
    method: 'get',
    params: {
      projectId,
    },
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
// 项目配置-风机下的设备列表（不包含风机层级）
export const getMachineChildren = (machineId) =>
  request({
    url: `${baseUrl}/api/v1/cms/machine/devices/${machineId}`,
    method: 'get',
  });
// 获取后端版本号
export const getBackVersion = () =>
  request({
    url: `${baseUrl}/api/v1/cms/service/version`,
    method: 'get',
  });
