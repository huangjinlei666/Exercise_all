import request from '@/plugins/axios';
import { baseUrl } from '@/config/baseUrl';

// 查询诊断列表
export const getDiagnosisList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis`,
    method: 'get',
    params,
  });

// 查询诊断详情
export const getDiagnosisDetail = (faultDiagnosisId) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/${faultDiagnosisId}`,
    method: 'get',
  });
// 查询故障详情
export const getFaultDetail = (alarmId) =>
  request({
    url: `${baseUrl}/api/v1/cms/report/alarm/${alarmId}`,
    method: 'get',
  });
// 添加诊断
export const addDiagnosis = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis`,
    method: 'put',
    data,
  });

// 编辑诊断
export const editDiagnosis = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis`,
    method: 'post',
    data,
  });

// 处理诊断
export const handleDiagnosisById = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/${id}`,
    method: 'put',
  });

// 推送诊断到
export const pushDiagnosisById = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/${id}/remote`,
    method: 'put',
  });

// 诊断批次
// 诊断批次分页查询
export const getDiagnosisBatchList = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/batch-page`,
    method: 'get',
    params,
  });

// 风机分页查询
export const getMachineList = (id, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/${id}/machine-page`,
    method: 'get',
    params,
  });

// 查询诊断批次详情
export const getDiagnosisBatchById = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/batch/${id}`,
    method: 'get',
  });

// 从集团拉取
export const pullBatchFromGroup = () =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/pending-batch/remote`,
    method: 'put',
  });

// 从集团拉取指定批次
export const pullBatchFromGroupById = (id) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/batch/${id}/remote`,
    method: 'put',
  });

// 创建批次
export const addBatch = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/batch`,
    method: 'put',
    data,
  });

// 修改批次
export const editBatch = (id, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/fault/diagnosis/batch/${id}`,
    method: 'put',
    data,
  });
