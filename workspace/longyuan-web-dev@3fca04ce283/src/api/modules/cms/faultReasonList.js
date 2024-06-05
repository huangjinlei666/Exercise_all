import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 故障原因列表
export const getReasonList = () =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/cause`,
    method: 'get',
  });

// 添加原因
export const addReason = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/cause`,
    method: 'put',
    data,
  });

// 从集团获取原因列表
export const getDiagnosisListFromGroup = () =>
  request({
    url: `${baseUrl}/api/v1/cms/remote/fault/cause`,
    method: 'get',
  });

// 从集团拉取原因列表
export const fetchDiagnosisFromGroup = () =>
  request({
    url: `${baseUrl}/api/v1/cms/remote/fault/cause`,
    method: 'put',
  });
