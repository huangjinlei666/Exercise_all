import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';
import { formatParams } from '@/util/commonService';

export const exportCsv = (sensorId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/export/${sensorId}/csv`,
    method: 'post',
    data,
  });

export const exportTxt = (sensorId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/export/${sensorId}/txt`,
    method: 'post',
    data,
  });

export const download = (filePath) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/export/download`,
    method: 'post',
    data: {
      filePath,
    },
  });

export const directDownload = (field) => `${baseUrl}/api/v1/cms/setting/export/directDownload/${field}`;

// 统一的下载接口
export const unifiedDownload = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/export/batch`,
    method: 'post',
    data,
  });

// 历史数据-批量导出状态查询
export const downloadStatus = (field) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/export/batch/status/${field}`,
    method: 'get',
  });

// 获取模板列表
export const getTemplateList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/presetTemplate`,
    method: 'get',
    params,
  });
};
/**
 *增加历史数据模板
 */
export const addHistoryTemplate = (data) => {
  data = formatParams(data);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/presetTemplate`,
    method: 'post',
    data,
  });
};
/**
 * 删除模板
 */
export const deleteHistoryTemplate = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/presetTemplate/${id}`,
    method: 'delete',
  });
/**
 *编辑模板
 */
export const updateHistoryTemplate = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/presetTemplate`,
    method: 'put',
    data,
  });

/**
 *  删除导出记录
 * @param {*} id
 * @returns
 */
export const deleteExportRecord = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/file/export/${id}`,
    method: 'delete',
  });

/**
 * 获取下载记录
 * @param {} params
 * @returns
 */
export const fetchExportRecord = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/file/export`,
    method: 'get',
    params,
  });
};
/**
 * 下载
 * @param {}} id
 * @returns
 */
export const exprotDirectDownload = (id) =>
  `${baseUrl}/api/v1/cms/file/export/directDownload/${id}`;

/**
* 查询导出数据状态
* @param {}} field
* @returns
*/
export const fetchExportStatus = (field) =>
  request({
    url: `${baseUrl}/api/v1/cms/file/export/status/${field}`,
    method: 'get',
  });
