import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import system from './modules/system';
import cms from './modules/cms';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV === 'development',
  modules: {
    system,
    cms,
  },
  plugins: [createPersistedState()],
});
