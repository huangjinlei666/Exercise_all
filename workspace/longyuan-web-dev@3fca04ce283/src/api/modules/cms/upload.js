import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 上传文件
export const upload = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/files/upload`,
    // url: 'http://172.28.1.161:8180/api/v1/cms/files/upload',
    method: 'post',
    data,
  });

export const show = (fileId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/files/${fileId}/show`,
    // url: `http://172.28.1.161:8180/api/v1/cms/files/${fileId}/show`,
    method: 'get',
    params,
  });
