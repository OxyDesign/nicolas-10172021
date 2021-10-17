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
  // URL to connect
  readonly url: string = 'wss://www.cryptofacilities.com/ws/v1';
  // Store the websocket instance
  private socket: W3CWebSocket;
  // Function called at regular interval, for the component to update
  private onData: Function = () => {};
  // Processed Asks orders
  private asks: Orders;
  // Processed Bids orders
  private bids: Orders;
  // Product ID (XBT / ETH)
  private product: string;
  // Interval to send Data (asks + bids)
  private interval: number = 0;

  // Constructor
  public constructor({ onConnect }: { onConnect: Function }) {
    // Initialize properties
    this.product = '';
    this.asks = [];
    this.bids = [];
    // Instantiate the WebSocket
    this.socket = new W3CWebSocket(this.url);

    // On Open, execute onConnect callback
    this.socket.onopen = function() {
      onConnect();
    };

    // On Message, process the data
    this.socket.onmessage = (e) => {
      const { data = '' } = e;
      const {
        event = '',
        feed = '',
        asks = [],
        bids = []
      } = JSON.parse(data as string);

      // When no data, there is nothing to process
      if (event === 'info' || event === 'subscribed') {
        return;
      }

      // Asks and Bids are sorted by ascending price
      // Could be removed to improve performance if we are guaranteed they
      // always come already sorted.
      const sortedAsks = sortOrdersByAsc(asks);
      const sortedBids = sortOrdersByAsc(bids);

      if (feed === 'book_ui_1_snapshot') {
        // If it's a snapshot, store the values and send them right away
        this.asks = sortedAsks;
        this.bids = sortedBids;

        this.sendData();
      } else if (feed === 'book_ui_1') {
        // If it's a delta, update existing orders accordingly
        if (sortedAsks.length) {
          this.asks = updateOrders(this.asks, sortedAsks);
        }
        if (sortedBids.length) {
          this.bids = updateOrders(this.bids, sortedBids);
        }
      };
    };
  };

  // Public Close method
  public close = () => {
    this.socket.close();
  };

  // Public Subscribe method
  public subscribe = ({ product, frequency, onData }: { product: string, frequency: number, onData: Function }) => {
    // On subscribe request, product ID and onData callback are saved
    this.product = product;
    this.onData = onData;

    if (this.isConnected()) {
      // Send the formatted message to subscribe (including product ID)
      this.socket.send(getSubscriptionMessage(true, this.product));
      // Start the interval to send Data, based on frequency provided
      this.interval = window.setInterval(() => {
        this.sendData();
      }, frequency);
    }
  };

  // Public Unsubscribe method
  public unsubscribe = ({ product }: { product: string }) => {
    // Reset properties
    this.asks = [];
    this.bids = [];
    this.product = '';
    this.onData = () => {};

    if (this.interval) {
      // Clear the existing interval to send Data
      clearInterval(this.interval);
    }

    if (this.isConnected()) {
      // Send the formatted message to unsubscribe (including product ID)
      this.socket.send(getSubscriptionMessage(false, product));
    }
  };

  // Private Send Data method - Called on a regular interval set by the component
  private sendData = () => {
    // Send asks and bids processed / sorted orders
    if (this.onData) this.onData({
      asks: this.asks.slice(),
      bids: this.bids.slice()
    });
  };

  // Public isConnected method
  public isConnected = (): boolean => {
    return this.socket.readyState === 1;
  };
};

export default OrderBookWebSocket;
