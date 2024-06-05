import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 获取设备生命周期列表
export const getDeviceLifeCycleList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/life-cycle/events`,
    method: 'get',
    params,
  });

// 插入单条设备生命周期
export const addDeviceLifeCycle = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/life-cycle/event`,
    method: 'post',
    data,
  });

// 导入设备生命周期列表
export const importDeviceLifeCycle = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/life-cycle/events/import`,
    method: 'post',
    data,
  });

// 更新单条设备生命周期
export const updateDeviceLifeCycle = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/life-cycle/event`,
    method: 'put',
    data,
  });
// 删除生命周期事件
export const deleteDeviceLifeCycle = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/life-cycle/event/${id}`,
    method: 'delete',
  });
