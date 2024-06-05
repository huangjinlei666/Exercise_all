import cloneDeep from 'lodash/cloneDeep';
import BMF from '@hife/browser-md5-file';
import { SPECIAL_REG } from './regExpService';

const bmf = new BMF();
const reader = new FileReader();
// 计算文件的md5
export function getFileMd5(file) {
  return new Promise((resolve, reject) => {
    bmf.md5(file, (err, md5) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(md5);
    });
  });
}
// 获取本地图片的base64
export function getFileDataURL(file) {
  return new Promise((resolve, reject) => {
    reader.readAsDataURL(file);
    reader.onload = function onload(e) {
      resolve(e.target.result);
    };
  });
}

// 识别当前的模式，测试模式使用西人马的logo
export function getMetaContent(metaName) {
  const metas = document.getElementsByTagName('meta');
  for (let i = 0; i < metas.length; i += 1) {
    if (metas[i].getAttribute('name') === metaName) {
      return metas[i].getAttribute('content');
    }
  }
}

// 过滤请求参数对象
export const formatParams = (params) => {
  if (!params) {
    return {};
  }
  Object.keys(params).forEach((k) => {
    if (!params[k]) {
      delete params[k];
    }
  });
  return params;
};

// 保留n位小数
// export const getFloat = (num, n) => {
//   n = n ? parseInt(n) : 0;
//   if (n <= 0) {
//     return Math.round(num);
//   }
//   num = Math.round(num * Math.pow(10, n)) / Math.pow(10, n);
//   num = Number(num).toFixed(n);
//   return num;
// };
export const getFloat = (num, n) => {
  let result = parseFloat(num);
  if (isNaN(result)) {
    return '';
  }
  const total = n ? parseInt(n, 10) : 0;
  if (total <= 0) {
    return `${Math.round(result)}`;
  }
  result = Math.round(result * Math.pow(10, n)) / Math.pow(10, n);
  let sX = result.toString();
  let posDecimal = sX.indexOf('.'); // 小数点的索引值
  // 整数
  if (posDecimal < 0) {
    posDecimal = sX.length;
    sX += '.';
  }
  // 当数字的长度小于小数点索引加n时，补0
  while (sX.length <= posDecimal + total) {
    sX += '0';
  }
  return `${sX}`;
};

// 判断数值是否存在
export const isValueExist = (value) => {
  if (value !== undefined && value !== null) {
    return true;
  }
  return false;
};

// 处理总貌图后台返回的传感器信息数组
function uniqueArr(arr) {
  const newArr = [];
  for (let i = 0; i < arr.length; i += 1) {
    if (arr.indexOf(arr[i]) === i) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}
export const processConfig = (configParamArr, originSensorArr) => {
  // 提取传感器位置，并去重
  const locationArr = configParamArr.map((item) => item.location);
  const locationUnique = uniqueArr(locationArr);

  const config = [];

  locationUnique.forEach((ele) => {
    const cc = {
      location: ele,
    };
    // ele位置下所有的传感器信息
    const sensorArr = configParamArr
      .filter((item) => item.location === ele)
      .map((item) => ({ sensorId: item.sensorId, sensorName: item.sensorName }));
    // ele位置下所有的传感器id，并去重
    const sensorIdArr = sensorArr.map((item) => item.sensorId);
    const sensorIdUnique = uniqueArr(sensorIdArr);

    const sensorList = [];

    sensorIdUnique.forEach((e) => {
      const ss = {
        sensorId: e,
        sensorName: sensorArr.filter((item) => item.sensorId === e)[0].sensorName,
      };
      // 从所有传感器列表中查询该传感器
      const alarmSensor = originSensorArr.find((i) => i.id === e);
      let alarmIdentifierArr = [];
      if (alarmSensor) {
        ss.alarmLevel = alarmSensor.alarmLevel;
        if (alarmSensor.variates && alarmSensor.variates.length > 0) {
          // 获取该传感器下的变量列表
          alarmIdentifierArr = alarmSensor.variates;
        }
      }
      const identifierList = configParamArr
        .filter((item) => item.location === ele)
        .filter((item) => item.sensorId === e)
        .map((item) => {
          const identifierObj = {
            identifier: item.identifier,
            identifierName: item.variateName,
            value: item.value,
            metadata: item.metadata,
          };
          if (alarmIdentifierArr.length > 0) {
            const alarmVariate = alarmIdentifierArr.find((i) => i.identifier === item.identifier);
            if (alarmVariate) {
              identifierObj.alarmLevel = alarmVariate.alarmLevel;
            }
          }
          return identifierObj;
        });
      ss.identifierList = identifierList;
      sensorList.push(ss);
    });
    cc.sensorList = sensorList;
    config.push(cc);
  });
  return config;
};

// 解码JWTtoken
export const decodeToken = (token) => {
  if (!token) {
    return {};
  }
  if (token.indexOf('.') === -1) {
    return {};
  }
  let o;
  try {
    const objStr = decodeURIComponent(escape(window.atob(token.split('.')[1])));
    let newStr = objStr
      .replace(/"subjectId":(\d+)/, '"subjectId":"$1"')
      .replace(/"organizationId":(\d+)/, '"organizationId":"$1"')
      .replace(/"tenantId":(\d+)/, '"tenantId":"$1"');
    const s = newStr.indexOf('{');
    const e = newStr.indexOf('}');
    newStr = newStr.slice(s, e + 1);
    o = JSON.parse(newStr);
  } catch (error) {
    console.error('token is invalid');
    o = {};
  }
  return o;
};
// 操作通道-权限树
export const operateTree = (arr, bool) => {
  arr.forEach((ele) => {
    ele.disabled = bool;
    if (ele.hierarchies && ele.hierarchies.length > 0) {
      operateTree(ele.hierarchies, bool);
    }
  });
};
// uuid
export const getUUID = () => {
  const s = [];
  const hexDigits = '01234567890abcdef';
  for (let i = 0; i < 36; i += 1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] && 0x3) || 0x8, 1);
  s[8] = '-';
  s[13] = '-';
  s[18] = '-';
  s[23] = '-';

  const uuid = s.join('');
  return uuid;
};
// 抽取权限
export const extractPath = (arr, arrNew) => {
  arr.forEach((o) => {
    if (o.path) {
      arrNew.push(o.path);
    }
    if (o.children && o.children.length > 0) {
      extractPath(o.children, arrNew);
    }
  });
};
export const extractPermission = (arr, arrNew) => {
  arr.forEach((o) => {
    arrNew.push(o.name);
    if (o.permissions && o.permissions.length > 0) {
      extractPermission(o.permissions, arrNew);
    }
  });
};
export const extractTitle = (arr, arrNew) => {
  arr.forEach((o) => {
    arrNew.push(o.title);
    if (o.children && o.children.length > 0) {
      extractTitle(o.children, arrNew);
    }
  });
};
export const extractHierarchy = (arr, arrNew) => {
  arr.forEach((o) => {
    arrNew.push(o.id);
    if (o.hierarchies && o.hierarchies.length > 0) {
      extractHierarchy(o.hierarchies, arrNew);
    }
  });
};
export const extractCheckedNode = (arr, tid) => {
  let nodeData = null;
  arr.every((ele) => {
    if (ele.id === tid) {
      nodeData = ele;
      return false;
    }
    if (ele.hierarchies && ele.hierarchies.length > 0) {
      nodeData = extractCheckedNode(ele.hierarchies, tid);
      if (nodeData) {
        return false;
      }
    }
    return true;
  });
  return nodeData;
};
export const disableSonHierarchies = (obj) => {
  if (!obj || !obj.hierarchies || obj.hierarchies.length === 0) {
    return;
  }
  operateTree(obj.hierarchies, true);
};
export const extractMachine = (arr, arrNew) => {
  arr.forEach((o) => {
    if (o.type === 'WORKSHOP') {
      let total = 0;
      let okTotal = 0;
      let attentionTotal = 0;
      let errorTotal = 0;
      if (o.hierarchies && o.hierarchies.length > 0) {
        total = o.hierarchies.length;
        o.hierarchies.forEach((i) => {
          if (!i.alarmLevel || i.alarmLevel === 'OK') {
            okTotal += 1;
          }
          if (i.alarmLevel === 'ATTENTION') {
            attentionTotal += 1;
          }
          if (i.alarmLevel === 'WARN') {
            errorTotal += 1;
          }
          if (i.alarmLevel === 'ERROR') {
            errorTotal += 1;
          }
          if (i.alarmLevel === 'EMERGENCY') {
            errorTotal += 1;
          }
        });
      }
      arrNew.push({
        ...o,
        hierarchies: null,
        total,
        okTotal,
        attentionTotal,
        errorTotal,
      });
    }
    if (o.hierarchies && o.hierarchies.length > 0) {
      extractMachine(o.hierarchies, arrNew);
    }
  });
};
// 过滤左侧视图菜单
export const filterAside = (menuAside, permissionArr) => {
  const arr = [];
  menuAside.every((ele) => {
    // 当有permission字段并且该字段在权限数组中，或没有permission字段时即可进入判断
    if (
      (ele.permission && permissionArr.includes(ele.permission)) ||
      !Object.prototype.hasOwnProperty.call(ele, 'permission')
    ) {
      const target = cloneDeep(ele);
      if (ele.children && ele.children.length > 0) {
        target.children = filterAside(ele.children, permissionArr);
      }
      // 当没有permission字段
      if (!Object.prototype.hasOwnProperty.call(target, 'permission')) {
        if (!Object.prototype.hasOwnProperty.call(target, 'children')) {
          arr.push(target);
        }
        if (target.children && target.children.length > 0) {
          arr.push(target);
        }
        return true;
      }
      // 当有permission字段并且该字段在权限数组中
      arr.push(target);
    }
    return true;
  });
  return arr;
};

// getBrowserType
function getVersion(versionStr) {
  const versionArr = versionStr.split('.');
  let version;
  if (versionArr.length === 1) {
    version = versionArr[0];
  } else if (versionArr.length > 1) {
    version = `${versionArr[0]}.${versionArr[1]}`;
  }
  return parseFloat(version);
}
export const getBrowserType = () => {
  const { userAgent } = navigator;
  if (userAgent.indexOf('Firefox') > -1) {
    const versionStr = userAgent.split('Firefox/')[1].split(' ')[0];
    const version = getVersion(versionStr);
    return { type: 'Firefox', version };
  }
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Edge') > -1) {
    const versionStr = userAgent.split('Edge/')[1].split(' ')[0];
    const version = getVersion(versionStr);
    return { type: 'Edge', version };
  }
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
    const versionStr = userAgent.split('Chrome/')[1].split(' ')[0];
    const version = getVersion(versionStr);
    return { type: 'Chrome', version };
  }
  if (userAgent.indexOf('Trident') > -1 && userAgent.indexOf('compatible') > -1) {
    if (userAgent.indexOf('MSIE 10.0') > -1) {
      return { type: 'IE', version: 10.0 };
    }
    if (userAgent.indexOf('MSIE 9.0') > -1) {
      return { type: 'IE', version: 9.0 };
    }
  }
  if (userAgent.indexOf('Trident') > -1) {
    return { type: 'IE', version: 11.0 };
  }

  return { type: 'none', version: 0 };
};

/**
 * @description 异步加载高德地图
 */
export function loadMP() {
  const mp = new Promise((resolve, reject) => {
    const hasLoaded = document.getElementById('amap');
    if (hasLoaded) {
      resolve(AMap);
      return;
    }
    window.init = function init() {
      resolve(AMap);
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=afab6449e9193d57d031a489545a7b9a&callback=init';
    script.id = 'amap';
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return mp;
}

/**
 * description 分页接口一次请求所有数据
 * @param {*} fetchFunc http请求
 * @param {*} pageIndex 当前页码，默认1
 * @param {*} pageSize 每页条数，默认10
 * @param params 其他查询参数对象
 */
export function getTotalList(fetchFunc, pageIndex = 1, pageSize = 10, params = {}) {
  return new Promise((resolve, reject) => {
    fetchFunc({ pageIndex, pageSize, ...params })
      .then((res) => {
        const result = res.data;
        if (res.totalRecords <= pageSize) {
          resolve(result);
        } else {
          const _total = ~~((res.totalRecords - 1) / pageSize) + 1;
          const _pageList = new Array(_total - 1).fill(1).map((v, index) => index + 1 + pageIndex);
          Promise.all(_pageList.map((page) => fetchFunc({ pageIndex: page, pageSize, ...params })))
            .then((resList) => {
              resList.forEach((_res) => {
                Array.prototype.push.apply(result, _res.data);
              });
              resolve(result);
            })
            .catch(reject);
        }
      })
      .catch(reject);
  });
}

// 计算字符串中特殊字符的个数
export const getSpecialLetterNum = (str) => {
  if (!str) {
    return 0;
  }
  const newStr = str.replace(SPECIAL_REG, '*');
  const strArr = newStr.split('');
  return strArr.filter((s) => s === '*').length;
};

function findParentId(arr, parent, id) {
  let tid = '';
  arr.every((a) => {
    if (a.id === id) {
      tid = parent.id;
      return false;
    }
    if (a.hierarchies && a.hierarchies.length > 0) {
      tid = findParentId(a.hierarchies, a, id);
      if (tid) {
        return false;
      }
    }
    return true;
  });
  return tid;
}
// 从通道列表中找到风机上一级风场的id
export const extractWorkshopId = (arr, id) => findParentId(arr, { id: '' }, id);

const basicN = [1, 2, 3, 4, 5];
const edgeN = 5;
// 多频、边频游标
export const getFrequencySign = (rotingVelocity, interval, edgeReferenceBasicN) => {
  const basicRes = [];
  let edgeRes = [];
  // 倍频
  for (let i = 0; i < basicN.length; i += 1) {
    const value = basicN[i] * rotingVelocity;
    value >= 0 && basicRes.push({ value, label: `${basicN[i]}倍频` });
  }
  if (basicRes.length === 0) {
    edgeRes = [];
    return { basic: basicRes, edge: edgeRes };
  }

  // 边频
  const b = basicRes[edgeReferenceBasicN];
  const vl = [];
  for (let i = edgeN; i > 0; i -= 1) {
    vl.push({ value: b.value - i * interval, label: `${i}边频` });
  }
  for (let i = 1; i <= edgeN; i += 1) {
    vl.push({ value: b.value + i * interval, label: `${i}边频` });
  }
  if (vl.length > 0) {
    vl.forEach((v) => {
      v.value >= 0 && edgeRes.push(v);
    });
  }
  return { basic: basicRes, edge: edgeRes };
};

// 分组select转换
function mergeItem(target) {
  const res = [];
  target.forEach((item) => {
    const cloneItem = item;
    const labelArr = res.map((i) => i.label);
    if (!labelArr.includes(cloneItem.label)) {
      res.push(cloneItem);
    } else {
      res.forEach((a) => {
        if (a.label === cloneItem.label) {
          if (a.children && cloneItem.children) {
            a.children = a.children.concat(cloneItem.children);
          }
          if (!a.children && cloneItem.children) {
            a.children = [].concat(cloneItem.children);
          }
        }
      });
    }
  });
  return res;
}
export const formatGroupSelectOptions = (originList) => {
  if (!originList || originList.length === 0) {
    return [];
  }
  const target = originList.map((ori) => {
    let nameArr = ori.name.split('_'); // ['齿轮箱','低速轴垂直','加速度']
    if (nameArr.length > 3) {
      nameArr = [nameArr[0], nameArr[1], nameArr.slice(2).join('_')];
    }
    const len = nameArr.length - 1;
    let res = [];
    for (let i = len; i >= 0; i -= 1) {
      const o = {};
      if (i === len) {
        o.label = nameArr[i];
        o.value = ori.id;
        o.level = i;
        o.isLeaf = true;
        o.name = ori.name;
      } else {
        o.label = nameArr[i];
        o.level = i;
        o.children = res;
        o.name = ori.name;
        res = [];
      }
      res.push(o);
    }
    return res[0];
  });

  const result = mergeItem(target);
  result.forEach((res) => {
    if (res.children) {
      res.children = mergeItem(res.children);
    }
  });
  return result;
};

// 分组select转换
function newMergeItem(target) {
  const res = [];
  target.forEach((item) => {
    const cloneItem = item;
    const labelArr = res.map((i) => i.name);
    if (!labelArr.includes(cloneItem.name)) {
      res.push(cloneItem);
    } else {
      res.forEach((a) => {
        if (a.name === cloneItem.name) {
          if (a.hierarchies && cloneItem.hierarchies) {
            a.hierarchies = a.hierarchies.concat(cloneItem.hierarchies);
          }
          if (!a.hierarchies && cloneItem.hierarchies) {
            a.hierarchies = [].concat(cloneItem.hierarchies);
          }
        }
      });
    }
  });
  return res;
}
export const newFormatGroupSelectOptions = (originList) => {
  if (!originList || originList.length === 0) {
    return [];
  }
  const alarmLevelObj = {};
  const alarmLevel = {
    OK: 0,
    ATTENTION: 1,
    WARN: 2,
    ERROR: 3,
    EMERGENCY: 4,
  };
  originList.forEach((ori) => {
    const nameArr = ori.originName.split('_');
    const str = nameArr[1] ? `${nameArr[0]}_${nameArr[1]}` : nameArr[0];
    alarmLevelObj[str] = alarmLevelObj[str]
      ? alarmLevel[ori.alarmLevel] > alarmLevel[alarmLevelObj[str]]
        ? ori.alarmLevel
        : alarmLevelObj[str]
      : ori.alarmLevel;
  });
  const target = originList.map((ori) => {
    let nameArr = ori.originName.split('_'); // ['齿轮箱','低速轴垂直','加速度']
    if (nameArr.length > 3) {
      nameArr = [nameArr[0], nameArr[1], nameArr.slice(2).join('_')];
    }
    const str = nameArr[1] ? `${nameArr[0]}_${nameArr[1]}` : nameArr[0];
    let treeAlarmLevel = 'OK';
    Object.keys(alarmLevelObj).forEach((i) => {
      if (str === i) {
        treeAlarmLevel = alarmLevelObj[i];
      }
    });
    const len = nameArr.length - 1;
    let res = [];
    for (let i = len; i >= 0; i -= 1) {
      const o = {};
      if (i === len) {
        // 判断变量类型
        let info;
        let isSpeed = false;
        try {
          info = JSON.parse(ori.additionalInfo);
        } catch (error) {
          info = {};
        }
        if (info && info.deviceType && info.deviceType[0] && info.deviceType[0] === 'speed') {
          isSpeed = true;
        }

        o.id = ori.id;
        o.isLeaf = true;
        o.name = nameArr[i];
        o.type = 'SENSOR';
        o.originName = ori.originName;
        o.additionalInfo = ori.additionalInfo;
        o.alarmLevel = ori.alarmLevel;
        o.variates = ori.variates;
        o.networkStatus = ori.networkStatus;
        o.isSpeed = isSpeed;
      } else {
        o.hierarchies = res;
        o.name = nameArr[i];
        o.id = nameArr[i] + ori.id;
        o.type = 'SENSOR';
        o.originName = ori.originName;
        o.additionalInfo = ori.additionalInfo;
        o.alarmLevel = treeAlarmLevel;
        o.variates = ori.variates;
        o.networkStatus = ori.networkStatus;
        res = [];
      }
      res.push(o);
    }
    return res[0];
  });

  const result = newMergeItem(target);
  result.forEach((res) => {
    if (res.hierarchies) {
      res.hierarchies = newMergeItem(res.hierarchies);
    }
  });
  return result;
};

// 特征值排序规则
export const identifierSortRegular = {
  RotatingVelocity: 0, // 转速
  AccelerationPeak: 1, // 加速度峰值
  SpeedEffective: 2, // 速度有效值
  Kurtosis: 3, // 峭度
  PeakIndex: 4, // 峰值指标
  AccelerationEffective: 5, // 加速度有效值
  SpeedPeak: 6, // 速度峰值
  Margin: 7, // 裕度指数
  Vpp: 8, // 峰峰值
  PulseIndex: 9, // 脉冲指数
  WaveformIndex: 10, // 波形指标
  Skewness: 11, // 歪度指数
  SquareRoot: 12, // 方根赋值
  MaxValue: 13, // 最大值
  MinValue: 14, // 最小值
  EvenValue: 15, // 平均幅值
  MeanSquare: 16, // 方差
  MeanValue: 17, // 均值
};
// 特征值排序
export const identifierSort = (arr) =>
  arr
    .map((i) => {
      const index = identifierSortRegular[i.id];
      if (index !== undefined && index !== null && index !== '') {
        i.index = index;
      } else {
        i.index = 18;
      }
      return i;
    })
    .sort((a, b) => a.index - b.index);

const shortcut = (target, localKey, timeLength) => (
  {
    text: target.$t(`routineAtlas.selectTypes.${localKey}`),
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * timeLength);
      picker.$emit('pick', [start, end]);
    },
  }
);

export const datePickerOptions = (target) => (
  {
    onPick: ({ maxDate, minDate }) => {
      if (!maxDate && minDate) {
        target.min = minDate && minDate.getTime();
      }
      if (maxDate && minDate) {
        target.min = '';
      }
    },
    disabledDate: (date) => {
      const max = 29 * 24 * 60 * 60 * 1000; // 设定3天日期  30天 * 24小时 * 60分钟 * 60秒 * 1000 = 3天的时间戳
      // 如果开始日期已选中，则返回需求中需要禁用的时间
      if (target.min !== '') {
        // 大于选中时间后三天 || 小于选中时间后三天 || 大于今天 的所有日期都禁用
        return (
          date.getTime() > target.min + max ||
          date.getTime() < target.min - max ||
          date.getTime() > Date.now()
        );
      }
      // 什么都没选，只禁用大于今天的所有日期
      return date.getTime() > Date.now();
    },
    shortcuts: [
      shortcut(target, 'halfHour', 0.5),
      shortcut(target, 'oneHour', 1),
      shortcut(target, 'oneDay', 24),
      shortcut(target, 'threeDays', 24 * 3),
      shortcut(target, 'fiveDays', 24 * 5),
      shortcut(target, 'oneWeek', 24 * 7),
      shortcut(target, 'oneMonth', 24 * 30),
    ],
  }
);

export const buildPassList = (nodes, parents = []) => {
  if (!nodes?.length) return;
  nodes.forEach((node) => {
    if (node.hierarchies?.length) {
      parents.push(node);
      if (['PROJECT', 'FACTORY', 'WORKSHOP'].includes(node.type)) {
        buildPassList(node.hierarchies, parents);
      } else if (node.networkStatus === 'ONLINE') {
        for (let i = 0; i < parents.length; i += 1) {
          parents[i].networkStatus = 'ONLINE';
        }
      }
    } else if (node.networkStatus === 'ONLINE') {
      for (let i = 0; i < parents.length; i += 1) {
        parents[i].networkStatus = 'ONLINE';
      }
    }
    // console.log(node.name + ' | ' + node.type + ' | ' + node.networkStatus + ' | ' + parents.map(item => item.name).toString());
  });
  parents.pop();
};

export const downloadFile = (url) => {
  const aTag = window.document.createElement('a');
  aTag.href = url;
  document.body.appendChild(aTag);
  aTag.click();
  aTag.remove();
};

export const startDownload = (fileId, thisVue, i = 0) => {
  if (!fileId) return;
  if (i === 5) {
    thisVue.$msg.error(thisVue.$t('errorCode.408'));
    return;
  }
  thisVue.$api.fan.getExportStatus(fileId).then((res) => {
    const code = res?.data?.code;
    if (code === 200) {
      downloadFile(thisVue.$api.fan.downloadFile(fileId));
    } else if (code === 0) {
      i += 1;
      thisVue.$msg.success(thisVue.$t('common.downloding'));
      startDownload(fileId, thisVue, i);
    } else {
      thisVue.$msg.error(res?.data?.msg);
    }
  });
};
