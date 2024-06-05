import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 轴承类型数据列表
export const getBearingList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/dictionaryInfo/`,
    method: 'get',
    params,
  });
};
