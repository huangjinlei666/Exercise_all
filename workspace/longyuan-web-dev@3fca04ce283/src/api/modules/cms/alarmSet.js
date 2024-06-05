import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 告警设置列表
export const getAlarmSetList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/alarms`,
    method: 'get',
    params,
  });
};
//
export const createAlarmSet = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms`,
    method: 'post',
    data,
  });
//
export const updateAlarmSet = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/${id}`,
    method: 'put',
    data,
  });
//
export const deleteAlarmSet = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/${id}`,
    method: 'delete',
  });
// 全局告警设置列表
export const getAlarmSetListGlobal = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/global`,
    method: 'get',
    params,
  });
};
// 添加全局告警设置
export const createAlarmSetGlobal = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/global`,
    method: 'post',
    data,
  });
// 修改全局告警设置启用禁用状态
export const switchGlobalSetEnable = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/global/switch`,
    method: 'put',
    data,
  });
// 修改全局告警设置启用禁用状态
export const getGlobalSetEnable = () =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/alarms/global/switch`,
    method: 'get',
  });
