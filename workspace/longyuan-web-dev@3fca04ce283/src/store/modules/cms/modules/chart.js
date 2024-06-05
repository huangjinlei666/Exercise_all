export default {
  namespaced: true,
  state: {
    screenNumber: '1', // 几屏图像
    // searchbox
    sensorListLoading: false,
    sensorList: [],
    vibrationSensorList: [],
    orderSensorList: [],
    // 图谱对比数据数组
    compareParamList: [],
    // 频段
    frequencyBand: '',
  },
  mutations: {
    saveScreenNumber(state, num) {
      state.screenNumber = num;
    },
    saveChartInit(state) {
      state.screenNumber = '1';
      state.sensorListLoading = false;
      state.sensorList = [];
      state.vibrationSensorList = [];
      state.orderSensorList = [];
    },
    saveSensorListLoading(state, loading) {
      state.sensorListLoading = loading;
    },
    saveSensorList(state, list) {
      state.sensorList = list;
    },
    saveVibrationList(state, list) {
      state.vibrationSensorList = list;
    },
    saveOrderSensorList(state, list) {
      state.orderSensorList = list;
    },
    saveCompareParamList(state, list) {
      state.compareParamList = list;
    },
    saveFrequencyBand(state, fre) {
      state.frequencyBand = fre;
    },
  },
};
