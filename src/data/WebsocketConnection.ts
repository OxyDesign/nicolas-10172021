import { w3cwebsocket as W3CWebSocket } from 'websocket';
import {
  getSubscriptionMessage,
  sortOrdersByAsc,
  computeOrdersTotal,
  updateOrders
} from '../utils/functions';

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
  private asks: Orders;
  private bids: Orders;

  private sendData = () => {
    if (this.onData) this.onData({
      asks: computeOrdersTotal(this.asks.slice(0).reverse()).reverse(),
      bids: computeOrdersTotal(this.bids),
    });
  };

  public constructor({ onConnect }: { onConnect: Function }) {
    this.asks = [];
    this.bids = [];
    this.socket = new W3CWebSocket(wsUrl);

    this.socket.onopen = function() {
      onConnect();
    };

    this.socket.onmessage = (e) => {
      const { data = '' } = e;
      const {
        event = '',
        feed = '',
        asks = [],
        bids = []
      } = JSON.parse(data as string);

      if (event === 'info' || event === 'subscribed') {
        return;
      }

      const sortedAsks = sortOrdersByAsc(asks);
      const sortedBids = sortOrdersByAsc(bids);

      if (feed === 'book_ui_1_snapshot') {
        this.asks = sortedAsks;
        this.bids = sortedBids;

        this.sendData();
      } else if (feed === 'book_ui_1') {
        if (sortedAsks.length) {
          this.asks = updateOrders(this.asks, sortedAsks);
        }
        if (sortedBids.length) {
          this.bids = updateOrders(this.bids, sortedBids);
        }

        this.sendData();
      };
    };
  };

  public close = () => {
    this.socket.close();
  };

  public subscribe = ({ product, onData }: { product: string, onData: Function }) => {
    this.onData = onData;

    if (this.socket.readyState === 1) {
      this.socket.send(getSubscriptionMessage(true, product));
    }
  };

  public unsubscribe = ({ product }: { product: string }) => {
    this.onData = () => {};

    if (this.socket.readyState === 1) {
      this.socket.send(getSubscriptionMessage(false, product));
    }
  };
};

export default WebsocketConnection;
