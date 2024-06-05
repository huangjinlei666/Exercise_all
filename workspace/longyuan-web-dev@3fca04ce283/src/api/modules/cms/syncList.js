import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 获取同步列表
export const getSyncData = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/sync/dataPoint`,
    method: 'get',
    params,
  });

// 提交同步任务
export const submitSyncData = (dataPointId) =>
  request({
    url: `${baseUrl}/api/v1/cms/sync/dataPoint/start/${dataPointId}`,
    method: 'get',
  });

// 查看同步任务详情
export const syncDetail = (dataPointId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/sync/dataPoint/item/${dataPointId}`,
    method: 'get',
    params,
  });
