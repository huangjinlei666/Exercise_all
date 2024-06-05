import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 告警日志列表
export const getAlarmList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/report/alarm`,
    method: 'get',
    params,
  });
};
// 确定告警
export const confirmAlarm = (alarmId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/report/alarm/${alarmId}/verify`,
    method: 'put',
    data,
  });
