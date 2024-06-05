/* istanbul ignore next */

import Vue from 'vue';

const isServer = Vue.prototype.$isServer;

/* istanbul ignore next */
export const on = (function on() {
  if (!isServer && document.addEventListener) {
    return function onn(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  }
  return function onnn(element, event, handler) {
    if (element && event && handler) {
      element.attachEvent(`on${event}`, handler);
    }
  };
})();

/* istanbul ignore next */
export const off = (function off() {
  if (!isServer && document.removeEventListener) {
    return function offf(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  }
  return function offff(element, event, handler) {
    if (element && event) {
      element.detachEvent(`on${event}`, handler);
    }
  };
})();
