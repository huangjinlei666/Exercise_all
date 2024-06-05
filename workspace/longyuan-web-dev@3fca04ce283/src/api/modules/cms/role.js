import request from '@/plugins/axios';
import { formatParams } from '@/util/commonService';
import { baseUrl } from '@/config/baseUrl';

// 获取角色列表
export const getRoleList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/roles`,
    method: 'get',
    params,
  });
};
// 获取单个角色
export const getRole = (roleId) =>
  request({
    url: `${baseUrl}/api/v1/cms/roles/${roleId}`,
    method: 'get',
  });
// 创建角色
export const createRole = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/role`,
    method: 'post',
    data,
  });
// 更新角色
export const updateRole = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/role`,
    method: 'put',
    data,
  });
// 删除角色
export const deleteRole = (roleId) =>
  request({
    url: `${baseUrl}/api/v1/cms/role/${roleId}`,
    method: 'delete',
  });
// 获取权限树
export const getPermissions = () =>
  request({
    url: `${baseUrl}/api/v1/cms/permission/tree`,
    method: 'get',
  });
// 修改权限
export const updatePermission = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/role/permission`,
    method: 'put',
    data,
  });
