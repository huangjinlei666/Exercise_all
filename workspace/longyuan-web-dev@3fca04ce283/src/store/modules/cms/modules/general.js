export default {
  namespaced: true,
  state: {
    sensorId: '', // 传感器id
    identifier: '', // 变量类型
    location: '', // 传感器位置: engine, gearbox, bearing, outter,
    generalReceived: false,
    configReceived: false,
    config: [],
  },
  mutations: {
    saveSensorId(state, sensorId) {
      state.sensorId = sensorId;
    },
    saveIdentifier(state, identifier) {
      state.identifier = identifier;
    },
    saveLocation(state, location) {
      state.location = location;
    },
    saveGeneralReceived(state, generalReceived) {
      state.generalReceived = generalReceived;
    },
    saveConfigReceived(state, configReceived) {
      state.configReceived = configReceived;
    },
    saveConfig(state, config) {
      state.config = config;
    },
    saveGeneralInit(state) {
      state.sensorId = '';
      state.identifier = '';
      state.location = '';
      state.generalReceived = false;
      state.configReceived = false;
    },
  },
};
