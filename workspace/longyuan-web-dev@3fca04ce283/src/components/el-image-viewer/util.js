import Vue from 'vue';

export const isFirefox = function isFirefox() {
  return !Vue.prototype.$isServer && !!window.navigator.userAgent.match(/firefox/i);
};

export function rafThrottle(fn) {
  let locked = false;
  return function throttle(...args) {
    if (locked) return;
    locked = true;
    window.requestAnimationFrame((_) => {
      fn.apply(this, args);
      locked = false;
    });
  };
}
