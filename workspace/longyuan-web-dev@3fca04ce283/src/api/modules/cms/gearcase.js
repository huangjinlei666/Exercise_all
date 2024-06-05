import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 齿轮箱数据列表
export const getGearcaseList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/gearboxfeature/`,
    method: 'get',
    params,
  });
};

// 图片下载
export const getDrawing = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearboxfeature/image/${id}`,
    method: 'get',
  });
