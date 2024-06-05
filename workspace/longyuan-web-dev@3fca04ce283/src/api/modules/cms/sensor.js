import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 获取传感器列表
export const getSensorList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/machine/sensor`,
    method: 'get',
    params,
  });

// 新建传感器
export const addSensor = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/machine/sensor`,
    method: 'put',
    data,
  });

// 删除传感器
export const deleteSensor = (sensorId) =>
  request({
    url: `${baseUrl}/api/v1/cms/machine/sensor/${sensorId}`,
    method: 'delete',
  });
