import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

export const AccountLogin = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/login`,
    method: 'post',
    data,
  });

export const getUserRoles = () =>
  request({
    url: `${baseUrl}/api/v1/cms/users/roles`,
    method: 'get',
  });
/**
 * 修改密码
 * @param {} data
 * @returns
 */
export const changePaw = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/users/modify_credential`,
    method: 'put',
    data,
  });
