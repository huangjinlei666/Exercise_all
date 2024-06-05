import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 获取kafka堆积消息
export const getLag = () =>
  request({
    url: `${baseUrl}/api/v1/cms/actuator/kafka/lag`,
    method: 'get',
  });

// 设置kafka堆积消息
export const setLag = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/actuator/kafka/maxLag`,
    method: 'put',
    params,
  });

// 获取查询cassandra开关
export const getSwitch = () =>
  request({
    url: `${baseUrl}/api/v1/cms/actuator/cassandra/manual/switch`,
    method: 'get',
  });

// 设置查询cassandra开关
export const setSwitch = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/actuator/cassandra/manual/switch`,
    method: 'put',
    params,
  });
