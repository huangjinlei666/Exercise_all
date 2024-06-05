import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 设备特征值列表
export const getCharacteristicList = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/threshold/attributes/${id}`,
    method: 'get',
  });

// 设备阈值下发
export const issueThreshold = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/device/threshold/attributes/send/${id}`,
    method: 'post',
    data,
  });
