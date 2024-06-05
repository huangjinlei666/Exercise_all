import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 获取图谱设置
export const getAtlas = () =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/atlas`,
    method: 'get',
  });
//
export const updateAtlas = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/atlas`,
    method: 'put',
    data,
  });
