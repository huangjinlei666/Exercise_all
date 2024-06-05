import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 设备机组台账信息列表
export const getStandBookList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/setting/equipmentBaseInfo`,
    method: 'get',
    params,
  });
};

// 同步数据
export const synchronization = () =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/equipmentBaseInfo/syncFromGroup`,
    method: 'patch',
  });
