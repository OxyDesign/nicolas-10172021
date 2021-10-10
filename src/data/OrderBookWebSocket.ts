import { w3cwebsocket as W3CWebSocket } from 'websocket';
import {
  getSubscriptionMessage,
  sortOrdersByAsc,
  updateOrders
} from '../utils/functions';

interface WebsocketInterface {
  constructor: Function;
  close: Function;
  subscribe: Function;
  unsubscribe: Function;
  isConnected: Function;
}

class OrderBookWebSocket implements WebsocketInterface {
  readonly url: string = 'wss://www.cryptofacilities.com/ws/v1';
  private socket: W3CWebSocket;
  private onData: Function = () => {};
  private asks: Orders;
  private bids: Orders;
  private product: string;
  private interval: number = 0;

  public constructor({ onConnect }: { onConnect: Function }) {
    this.product = '';
    this.asks = [];
    this.bids = [];
    this.socket = new W3CWebSocket(this.url);

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
      } else if (feed === 'book_ui_1') {
        if (sortedAsks.length) {
          this.asks = updateOrders(this.asks, sortedAsks);
        }
        if (sortedBids.length) {
          this.bids = updateOrders(this.bids, sortedBids);
        }
      };
    };
  };

  public close = () => {
    this.socket.close();
  };

  public subscribe = ({ product, frequency, onData }: { product: string, frequency: number, onData: Function }) => {
    this.product = product;
    this.onData = onData;

    if (this.isConnected()) {
      this.socket.send(getSubscriptionMessage(true, this.product));
      this.interval = window.setInterval(() => {
        this.sendData();
      }, frequency);
    }
  };

  public unsubscribe = ({ product }: { product: string }) => {
    this.asks = [];
    this.bids = [];
    this.product = '';
    this.onData = () => {};
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.isConnected()) {
      this.socket.send(getSubscriptionMessage(false, product));
    }
  };

  private sendData = () => {
    if (this.onData) this.onData({
      asks: this.asks.slice(),
      bids: this.bids.slice()
    });
  };

  public isConnected = (): boolean => {
    return this.socket.readyState === 1;
  };
};

export default OrderBookWebSocket;
