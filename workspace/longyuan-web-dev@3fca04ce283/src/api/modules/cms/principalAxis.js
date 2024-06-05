import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 台账主轴信息列表
export const getPrincipalList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/bearingInfo`,
    method: 'get',
    params,
  });
};
