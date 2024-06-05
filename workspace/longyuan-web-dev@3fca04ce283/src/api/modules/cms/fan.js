import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 风机信息列表
export const getFanList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/machineData`,
    method: 'get',
    params,
  });
};
/**
 * 导入风机
 * @param {}} data
 * @return
 */
export const fanImport = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineData/excel/import`,
    method: 'post',
    data,
  });

/**
 * 同步集团风机数据
 * @return
 */
export const syncMachineData = () =>
  request({
    url: `${baseUrl}/api/v1/cms/machineData/sync/fromGroup`,
    method: 'get',
  });

/**
 * 根据风机层级id获取风机组合信息
 * @param {*} id
 */
export const getMachineCombineByDeviceId = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineInfo/getMachineCombine/byDeviceId/${id}`,
    method: 'get',
  });

/**
* 根据风机层级id获取风机组合信息
* @param {*} id
*/
export const getMachineCombineBybyHierarchyId = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/machineInfo/getMachineCombine/byHierarchyId/${id}`,
    method: 'get',
  });

/**
 * 查询导出状态
 * @param {*} uniqueNumber
 * @returns
 */
export const getExportStatus = (fileId) => request({
  url: `${baseUrl}/api/v1/cms/excel/export/status/${fileId}`,
  method: 'get',
});

/**
 * 下载文件
 * @param {*} fileId
 * @returns
 */
export const downloadFile = (fileId) =>
  `${baseUrl}/api/v1/cms/excel/export/directDownload/${fileId}`;
