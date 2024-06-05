import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 振动监测设备台账信息列表
export const getVibrationMonitoringList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBaseDetail`,
    method: 'get',
    params,
  });
};
// 新增振动监测设备台账信息
export const addVibrationMonitoring = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBase`,
    method: 'post',
    data,
  });
// 新增传感器信息
export const addSensor = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/accelerationSensor`,
    method: 'post',
    data,
  });
// 修改传感器信息
export const updateSensor = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/accelerationSensor/${id}`,
    method: 'put',
    data,
  });
// 删除传感器信息
export const deleteSensor = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/accelerationSensor/${id}`,
    method: 'delete',
  });
// 振动监测设备台账修改
export const updateVibrationMonitoring = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBase/${id}`,
    method: 'put',
    data,
  });

// 删除振动监测设备台账信息
export const deleteVibrationMonitoring = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBase/${id}`,
    method: 'delete',
  });
// 获取层级树
export const getHierarchies = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/hierarchies`,
    method: 'get',
  });
// 获取层级
export const getHierarchy = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/hierarchies/${hierarchyId}`,
    method: 'get',
  });
// 导入文件
export const batchImportMonitoring = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBaseDetail/batch`,
    method: 'post',
    data,
  });
export const approveMonitoring = (approval, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/vibrationMonitorBase/${approval}/approval`,
    method: 'patch',
    data,
  });
