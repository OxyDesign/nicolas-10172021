import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { getSubscriptionMessage } from '../utils/functions';

const wsUrl: string = 'wss://www.cryptofacilities.com/ws/v1';

interface WebsocketInterface {
  constructor: Function;
  close: Function;
  subscribe: Function;
  unsubscribe: Function;
}

class WebsocketConnection implements WebsocketInterface {
  private socket: W3CWebSocket;
  private onData: Function = () => {};
  // private data: object = {};

  public constructor({ onConnect }: { onConnect: Function }) {
    this.socket = new W3CWebSocket(wsUrl);

    this.socket.onopen = function () {
      onConnect();
    };

    this.socket.onmessage = (event) => {
      const { data } = event;
      const JSONData = JSON.parse(data as string);

      if (JSONData.feed === 'book_ui_1_snapshot') {
        if (this.onData) this.onData(JSONData);
      };
    };
  };

  public close = () => {
    this.socket.close();
  };

  public subscribe = ({ product, onData }: { product: string, onData: Function }) => {
    this.onData = onData;

    if (this.socket) {
      this.socket.send(getSubscriptionMessage(true, product));
    }
  };

  public unsubscribe = ({ product }: { product: string }) => {
    this.onData = () => {};

    if (this.socket) {
      this.socket.send(getSubscriptionMessage(false, product));
    }
  };
};

export default WebsocketConnection;
