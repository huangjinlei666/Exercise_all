import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';
// 列表数据
export const getFrequencyCount = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/setting/gearboxfeature/getDetail`,
    method: 'post',
    data,
  });
