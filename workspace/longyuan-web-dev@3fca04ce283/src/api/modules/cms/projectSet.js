import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 获取通道层级树
export const getTopHierarchyTree = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/hierarchies`,
    method: 'get',
    params,
  });
// 创建通道
export const createHierarchy = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/hierarchies`,
    method: 'post',
    params: { currentHierarchyId: id },
    data,
  });
// 获取通道信息
export const getHierarchy = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/hierarchies/${id}`,
    method: 'get',
  });
// 更新通道
export const updateHierarchy = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/hierarchies/${id}`,
    method: 'put',
    data,
  });
// 删除通道
export const deleteHierarchy = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/hierarchies/${id}`,
    method: 'delete',
  });
// 获取通道下的传感器列表
export const getSensorUnderHierarchy = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/sensors`,
    method: 'get',
    params,
  });
};
// 获取传感器下的变量列表
export const getVariatesBySensorId = (sensorId, workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/sensors/${sensorId}`,
    method: 'get',
    params: {
      workshopId,
    },
  });
// 配置总貌图
export const putGeneralMapConfig = (machineId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machines/${machineId}/measurepoints`,
    method: 'put',
    data,
  });
// 获取总貌图
export const getGeneralMapConfig = (machineId) =>
  request({
    url: `${baseUrl}/api/v1/cms/machines/${machineId}/measurepoints`,
    method: 'get',
  });
// 绑定网关到机组
export const bindGatewayToMachine = (machineId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machines/${machineId}/gateway/bind`,
    method: 'put',
    data,
  });
// 获取模型列表
export const getModelNames = () =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/models`,
    method: 'get',
  });
// 从风场同步数据到集团
export const syncDataToGroup = () =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/sync/hierarchy/farmToGroup`,
    method: 'post',
  });
// 从感知平台同步风机下的设备信息
export const syncDeviceInfoFromTass = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/syncDevicesToFarm/${hierarchyId}`,
    method: 'get',
  });
// 从风场同步数据到集团
export const syncConfigToGroup = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/farm/sync/devices/farmToGroup`,
    method: 'post',
    data,
  });
// 生成风场报告
export const createWindFarmReport = () =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/farmReport/export`,
    method: 'get',
  });
// 获取风场报告列表
export const getFarmReport = (params, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/farmReportList`,
    method: 'post',
    params,
    data,
  });
// 下载风场报告
export const downloadReport = (farmReportId) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/farmReport/download/${farmReportId}`,
    method: 'get',
  });
// 生成风机报告记录
export const createFanReprot = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/machineReport`,
    method: 'post',
    data,
  });
// 根据风机报告id查询风机报告记录详情
export const getFanReportDetail = (machineReportId) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/machineReportItem/${machineReportId}`,
    method: 'get',
  });

// 修改Sn码
export const modifyMetadata = (deviceId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineDevice/modifyMetadata/${deviceId}`,
    method: 'put',
    data,
  });

// 获取未绑定的风机列表
export const getUnboundFanList = (workshopId) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineData/getUnbound`,
    method: 'get',
  });

// 获取设备在线记录
export const getOnlineHistory = ({ workshopId, deviceId, machineId, pageOffset, pageSize }) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/connectEvents?deviceId=${deviceId}&pageOffset=${pageOffset}&pageSize=${pageSize}&workshopId=${workshopId}&machineId=${machineId}`,
    method: 'get',
  });
