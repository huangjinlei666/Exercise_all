import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 公共策略列表
export const getStrategyList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/commonStrategys`,
    method: 'get',
    params,
  });
};
// 公共策略参数列表
export const getStrategyParameter = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/identifierParams`,
    method: 'get',
    params,
  });
};
// 公共策略参数值列表
export const getParameterList = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/identifierParam/items/${id}`,
    method: 'get',
  });
// 新增公共策略
export const addStrategy = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/commonStrategys`,
    method: 'post',
    data,
  });
// 新增公共策略参数
export const addIdentifierParams = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/identifierParams`,
    method: 'post',
    data,
  });
// 修改公共策略
export const updateStrategy = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/commonStrategys/${id}`,
    method: 'put',
    data,
  });
// 修改公共策略参数
export const updateStrategyPamars = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/identifierParams/${id}`,
    method: 'put',
    data,
  });
// 修改公共策略参数值
export const updateStrategyValue = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/identifierParam/items/${id}`,
    method: 'put',
    data,
  });

// 公共策略下发
export const issueStrategy = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/strategy/send`,
    method: 'post',
    data,
  });
// 删除公共策略
export const deleteStrategy = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/commonStrategys/${id}`,
    method: 'delete',
  });
// 删除公共策略参数
export const deleteStrategyPamars = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/identifierParams/${id}`,
    method: 'delete',
  });
