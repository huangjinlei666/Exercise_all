import request from '@/plugins/axios';
import { baseUrl, websocketUrl } from '@/config/baseUrl';

export const wsUrl = `${websocketUrl}/api/v1/cms/ws`;

export const getGeneralMap = (hierarchyId) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/overview/${hierarchyId}`,
    method: 'get',
  });
// 趋势图
export const getTrendMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/tendency/${sensorId}`,
    method: 'get',
    params,
  });
// 波形图
export const getWaveformMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/waveform/${sensorId}`,
    method: 'get',
    params,
  });
// 频谱图
export const getSpectrumMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/spectrum/${sensorId}`,
    method: 'get',
    params,
  });
// 倒频谱图
export const getCepstrumSpectrumMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/cepstrumSpectrum/${sensorId}`,
    method: 'get',
    params,
  });
// 积分分析图
export const getIntegralMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/integral/${sensorId}`,
    method: 'get',
    params,
  });
// 包络分析图
export const getEnvelopeMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/envelope/${sensorId}`,
    method: 'get',
    params,
  });
// 瀑布图
export const getWaterfallMap = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/waterfall/${sensorId}`,
    method: 'get',
    params,
  });
// 获取轴心轨迹时的实时数据时,发送http请求,请求设备上报数据
export const axisOrbitSendAction = (machineId, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/action/axisOrbit/${machineId}`,
    method: 'post',
    data,
  });

// 实时数据时，发送http请求，请求设备上报数据
export const sendAction = (sensorId, data = {}) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/action/${sensorId}`,
    method: 'post',
    data,
  });
// 极坐标图
export const getPolarPlot = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/polarCoordinate/${sensorId}`,
    method: 'get',
    params,
  });

// 获取单个风机报告
export const getReport = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/report`,
    method: 'get',
    params,
  });

// 获取风机总结报告
export const getReportSummary = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/reportsummary`,
    method: 'get',
    params,
  });

// 在线振动分析报告
export const getVibrationAnalysisReport = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/analysis`,
    method: 'get',
    params,
  });

// 频谱图细化谱
export const getSpectralZoom = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/spectral/${sensorId}`,
    method: 'get',
    params,
  });

// 滤波
export const getWaterFilter = (data) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/getChart`,
    method: 'post',
    data,
  });

// 获取频谱图、包络图的频段
export const getFrequencyBand = (sensorId) =>
  request({
    url: `${baseUrl}/api/v1/cms/frequency/${sensorId}/list`,
    method: 'get',
  });

// 查询风机报告记录列表
export const getRecordList = (params, data) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/machineReportList`,
    method: 'post',
    params,
    data,
  });

// 下载风机记录报告
export const downloadReport = (machineReportId) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/machineReport/download/${machineReportId}`,
    method: 'get',
  });

// 重新启动风机记录报告任务
export const restartTask = (machineReportId) =>
  request({
    url: `${baseUrl}/api/v1/cms/reports/machineReport/start/${machineReportId}`,
    method: 'get',
  });
// 删除原始数据
export const deleteRawData = (params) =>
  request({
    url: `${baseUrl}/api/v1/cms/nosql/deviceDataPoint/deleteRawData`,
    method: 'delete',
    params,
  });
// 计算滤波特征值
export const getFilterEigenvalue = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/filterEigenvalue/${sensorId}`,
    method: 'get',
    params,
  });
// 频谱图细化谱
export const getLongOriginalDate = (sensorId, params) =>
  request({
    url: `${baseUrl}/api/v1/cms/dashboard/longOriginalDataItem/${sensorId}`,
    method: 'get',
    params,
  });
