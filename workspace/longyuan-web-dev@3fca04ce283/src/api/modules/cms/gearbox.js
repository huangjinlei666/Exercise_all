import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 齿轮箱列表
export const getGearboxList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox`,
    method: 'get',
    params,
  });
};
//
export const getDrawing = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox/${id}/picture`,
    method: 'get',
  });
//
export const addGearbox = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox`,
    method: 'post',
    data,
  });
//
export const updateGearbox = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox/${id}`,
    method: 'put',
    data,
  });

export const deleteGearbox = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox/${id}`,
    method: 'delete',
  });
//
export const batchImportGearbox = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox/batch`,
    method: 'post',
    data,
  });

export const uploadPic = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearbox/${id}/picture`,
    method: 'post',
    data,
  });
