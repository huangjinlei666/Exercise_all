function listenKeyDown(e) {
  if (e.keyCode === 32 || e.keyCode === 13) {
    e.preventDefault();
    return false;
  }
}

/**
 * 全局弹窗插件
 * @title 弹窗的标题，传国际化之后的字符串
 * @component 弹窗中要打开的组件，普通vue组件
 * @winData 传参，要给组件传的参数对象
 * @widthStyle 弹窗的宽度值，字符串
 * @confirm 弹窗确认后的回调函数
 * @cancel 弹窗取消后的回调函数
 */
export default {
  install(Vue, options) {
    const $vmList = [];
    const $elList = [];
    let $vm;
    let $el;
    Vue.prototype._i18n = options.i18n;
    Vue.prototype.$store = options.store;
    Vue.prototype._router = options.router;
    Vue.prototype.$modal = {
      show(title, component, winData, width, confirm, cancel) {
        Vue.prototype._route =
          Vue.prototype && Vue.prototype._router && Vue.prototype._router.app && Vue.prototype._router.app._route;
        if ($elList.length === 0) {
          window.addEventListener('keydown', listenKeyDown, false);
        }
        if (component) {
          const Modal = Vue.extend(component);
          $vm = new Modal();
          $vm.options = {
            ...options,
            title,
            component,
            winData,
            width,
            confirm,
            cancel,
          };
          $el = $vm.$mount().$el;
        }
        $el && document.body.appendChild($el);
        // 设置
        $vm && $vmList.push($vm);
        $el && $elList.push($el);
      },
      hide() {
        if ($elList.length <= 1) {
          window.removeEventListener('keydown', listenKeyDown, false);
        }
        $vm && $vm.$destroy();
        $el && document.body.removeChild($el);
        // 设置
        $vm && $vmList.splice($vmList.indexOf($vm), 1);
        $vm = $vmList[$vmList.length - 1];
        $el && $elList.splice($elList.indexOf($el), 1);
        $el = $elList[$elList.length - 1];
      },
    };
  },
};
