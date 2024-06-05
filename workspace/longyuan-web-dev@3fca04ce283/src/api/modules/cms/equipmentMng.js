import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 设备管理列表
export const getTemplatesList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/devices`,
    method: 'get',
    params,
  });
};

// 获取产品列表
export const getProductList = () =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplate/products`,
    method: 'get',
  });
// 详情信息
export const getDetail = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/devices/${id}`,
    method: 'get',
  });
// 新增设备
export const addEquipment = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/devices`,
    method: 'post',
    data,
  });

// 编辑设备模板
export const updateTemplate = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/${id}`,
    method: 'put',
    data,
  });
// 删除设备模板
export const deleteDevices = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/devices/${id}`,
    method: 'delete',
  });
// 获取不同飞机类型测点
export const getQueryByDictKind = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/dict/queryByDictKind`,
    method: 'get',
    params,
  });
};
