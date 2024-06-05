import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 获取全部分类列表
export const getCategoriesList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/categories`,
    method: 'get',
    params,
  });
};

// 创建分类
export const createCategories = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/categories`,
    method: 'post',
    data,
  });

// 更新分类
export const updateCategories = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/categories/${id}`,
    method: 'put',
    data,
  });

// 删除分类（逻辑删除）
export const deleteCategories = (categoryId) =>
  request({
    url: `${baseUrl}/api/v1/cms/categories/${categoryId}`,
    method: 'delete',
  });

// 创建文档
export const createDocument = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/documents`,
    method: 'post',
    data,
  });

// 获取文档列表
export const getDocumentsList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/documents`,
    method: 'get',
    params,
  });
};

// 更新文档
export const updateDocument = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/documents/${id}`,
    method: 'put',
    data,
  });

// 删除文档（逻辑删除）
export const deleteDocument = (documentId) =>
  request({
    url: `${baseUrl}/api/v1/cms/documents/${documentId}`,
    method: 'delete',
  });
