import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
//
export const getTemplatesList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates`,
    method: 'get',
    params,
  });
};

// 获取产品列表
export const getProductList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplate/products`,
    method: 'get',
    params,
  });

export const addTemplates = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates`,
    method: 'post',
    data,
  });
// 获取产品下面物模型
export const getObjectList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplate/thingspeclangs`,
    method: 'get',
    params,
  });

// 编辑设备模板
export const updateTemplate = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/${id}`,
    method: 'put',
    data,
  });
// 删除设备模板
export const deleteTemplates = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/${id}`,
    method: 'delete',
  });
// 详情信息
export const getDetail = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/deviceTemplates/${id}`,
    method: 'get',
  });
// 同步
export const sync = () =>
  request({
    url: `${baseUrl}/api/v1/cms/template/device/sync`,
    method: 'get',
  });
