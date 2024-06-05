import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 轴承数据列表
export const getBearingList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/bearing`,
    method: 'get',
    params,
  });
};
//
export const addBearing = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/bearing`,
    method: 'post',
    data,
  });
//
export const updateBearing = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/bearing/${id}`,
    method: 'put',
    data,
  });
//
export const deleteBearing = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/bearing/${id}`,
    method: 'delete',
  });
//
export const batchImportBearing = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/bearing/batch`,
    method: 'post',
    data,
  });
// 轴承审批
export const approveBearing = (bearingId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/bearing/${bearingId}/approval`,
    method: 'patch',
    data,
  });
