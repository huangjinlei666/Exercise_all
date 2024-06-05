import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';
// 稳态数据稀释规则
export const getDilutionById = (type) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/dilutions/${type}`,
    method: 'get',
  });

export const updateDilution = (type, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/dilutions/${type}`,
    method: 'put',
    data,
  });
