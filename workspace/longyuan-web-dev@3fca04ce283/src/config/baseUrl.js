let base = '';
let websocket = window.location.host;

if (process.env && process.env.NODE_ENV === 'development') {
  base = '/fregataDev';
  websocket = 'localhost:8088';
}

if (window.location.protocol === 'https:') {
  websocket = `wss://${websocket}`;
} else {
  websocket = `ws://${websocket}`;
}

export const baseUrl = base;
export const websocketUrl = websocket;
