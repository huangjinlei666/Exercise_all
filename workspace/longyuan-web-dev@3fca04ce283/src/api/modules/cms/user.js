import request from '@/plugins/axios';
import {
  formatParams
} from '@/util/commonService';
import {
  baseUrl
} from '@/config/baseUrl';

// 查询用户列表
export const getUserList = (params) => {
  params = formatParams(params);
  return request({
    url: `${baseUrl}/api/v1/cms/users`,
    method: 'get',
    params,
  });
};
// 查询单个用户
export const getUser = (userId) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}`,
    method: 'get',
  });
// 创建用户
export const createUser = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users`,
    method: 'post',
    data,
  });
// 更新用户
export const updateUser = (userId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}`,
    method: 'put',
    data,
  });
// 删除用户
export const deleteUser = (userId) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}`,
    method: 'delete',
  });
// 修改用户密码
export const changeUserPwd = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/change_credential`,
    method: 'put',
    data,
  });
// 重置用户密码
export const resetUserPwd = (userId) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}/reset_credential`,
    method: 'put',
  });
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
// 分配数据权限
export const assignUser = (userId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}/assign`,
    method: 'put',
    data,
  });
// 暂时去除该接口
export const enableUser = (userId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}/status`,
    method: 'put',
    data,
  });
// 暂时用不到
export const unassignUser = (userId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/${userId}/unassign`,
    method: 'put',
    data,
  });
// 获取验证码图片
export const getCodeImg = (randomStr) =>
  request({
    url: `${baseUrl}/api/v1/cms/public/code/${randomStr}`,
    responseType: 'arraybuffer',
    method: 'get',
  });
