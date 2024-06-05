import Stomp from 'stompjs';
import CookieService from '@/util/CookieService';
import { wsUrl } from '@/api/modules/cms/routineAtlas';
import { getUUID } from './commonService';

export default class StompService {
  constructor() {
    this.url = `${wsUrl}?token=${CookieService.getCookie('Fregata-Token')}`;
    this.stomp = null;

    this.lockReconnect = false;
    this.reconnectTimer = null;
    this.reconnectTimeout = 5000;
    this.clientTimer = null;
    this.clientTimeout = 10000;
    this.serverTimer = null;
    this.serverTimeout = 5000;

    this.num = 3;

    // 应用层的心跳订阅
    this.heartbeatSubscription = null;

    this.uuid = getUUID();

    this.addr_ping = `/ws/heartbeat/ping/${this.uuid}`;
    this.addr_pong = `/ws/heartbeat/pong/${this.uuid}`;

    this.createStomp();
  }

  createStomp(callback) {
    this.stomp = Stomp.client(this.url);
    this.stomp.outgoing = 20000;
    this.stomp.incoming = 20000;
    this.stomp.reconnectDelay = 0;
    callback && callback();
  }

  connect(callback) {
    this.stomp.connect(
      {
        Authorization: CookieService.getCookie('Fregata-Token'),
      },
      (data) => {
        // 连接后订阅心跳
        this.heartbeatSubscription && this.heartbeatSubscription.unsubscribe();
        this.heartbeatSubscription = this.stomp.subscribe(this.addr_pong, (/* data */) => {
          this.num = 3;
        });
        // 连接成功后，执行业务层回调
        callback(data);
      },
      (/* err */) => {
        // 连接失败
        this.reconnect(callback);
      }
    );
  }

  reconnect(callback) {
    if (this.lockReconnect) {
      return;
    }
    const _this = this;
    this.lockReconnect = true;
    this.reconnectTimer && clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      _this.lockReconnect = false;
      _this.connect(callback);
    }, this.reconnectTimeout);
  }

  /**
   * @param {*} url 订阅链接
   * @param {*} vm vue组件实例
   * @param {*} cb 订阅后的回调函数
   */
  subscribe(url, vm, cb) {
    this.clientTimer && clearInterval(this.clientTimer);
    this.serverTimer && clearTimeout(this.serverTimer);
    if (!this.stomp.connected) {
      // 如果订阅业务层时，连接已经断开，重新连接，连接完成后继续执行业务层的该订阅
      this.createStomp(() => {
        this.reconnect(() => {
          this.subscribe(url, cb);
        });
      });
      return;
    }

    const businessSubscription = this.stomp.subscribe(url, (data) => {
      if (!vm) {
        // 如果组件已经被销毁
        this.vmDestroyToDisconnect();
        return;
      }
      cb(data, businessSubscription);
    });

    // 连接正常则客户端开始发送心跳
    this.heartCheckStart(url, businessSubscription, cb);

    // 返回业务层订阅
    return businessSubscription;
  }

  disconnect(callback) {
    // 取消连接时，应先取消心跳订阅的逻辑
    this.heartbeatSubscription && this.heartbeatSubscription.unsubscribe();
    this.clientTimer && clearInterval(this.clientTimer);
    this.serverTimer && clearTimeout(this.serverTimer);

    this.stomp.disconnect(
      (data) => {
        callback(data);
      },
      {
        Authorization: CookieService.getCookie('Fregata-Token'),
      }
    );
  }

  vmDestroyToDisconnect() {
    // 组件被销毁，则取消所有订阅
    Object.keys(this.stomp.subscriptions).forEach((subId) => {
      subId && this.stomp.unsubscribe(subId);
    });
    // 关闭连接
    this.stomp.disconnect(() => { }, {
      Authorization: CookieService.getCookie('Fregata-Token'),
    });
  }

  heartCheckStart(url, businessSubscription, cb) {
    const _this = this;

    this.clientTimer = setInterval(() => {
      // 发送心跳包
      _this.stomp.send(_this.addr_ping, {}, JSON.stringify('ping!'));

      _this.num -= 1;
      // 三次未收到心跳答复，则开始计算答复时间
      if (_this.num <= 0) {
        _this.num = 3;
        _this.serverTimer && clearTimeout(_this.serverTimer);
        // 计算答复的超时时间
        _this.serverTimer = setTimeout(() => {
          // 后台返回超时，即重新进行业务层订阅
          businessSubscription && businessSubscription.unsubscribe();
          _this.subscribe(url, cb);
        }, _this.serverTimeout);
      }
    }, this.clientTimeout);
  }
}
