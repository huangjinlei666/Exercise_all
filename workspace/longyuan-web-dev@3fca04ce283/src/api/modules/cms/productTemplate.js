import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
//
export const getProductTemplatesList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/template/product`,
    method: 'get',
    params,
  });
};

// 获取产品列表
// export const getProductList = (params) =>
//   request({
//     url: `${baseUrl}/api/v1/cms/device/deviceTemplate/products`,
//     method: 'get',
//     params,
//   });

export const addProductTemplates = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/template/product`,
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

// 编辑产品模板
export const updateProductTemplate = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/template/product`,
    method: 'put',
    data,
  });
// 删除产品模板
export const deleteProductTemplates = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/template/product/${id}`,
    method: 'delete',
  });
// 查询所有的产品模板
export const getProductList = () =>
  request({
    url: `${baseUrl}/api/v1/cms/template/product/list`,
    method: 'get',
  });
