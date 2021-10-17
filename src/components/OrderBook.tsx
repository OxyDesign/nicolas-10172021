import { useState, useEffect } from 'react';

import {
  computeOrdersTotal,
  formatNumberForDisplay
} from '../utils/functions';

import OrdersTable from './OrdersTable';
import Button from './Button';

import OrderBookWebSocket from '../data/OrderBookWebSocket';

function OrderBook() {
  // Frequency to update the Order tables
  const frequency: number = 500;
  // Websocket instance
  const [ws, setWs]: [any, Function] = useState(null);
  // When is loading, show overlayer with Loading message
  const [isLoading, setIsLoading]: [boolean, Function] = useState(true);
  // When is paused, show overlayer with Paused message + Button to reconnect
  const [isPaused, setIsPaused]: [boolean, Function] = useState(false);
  // Product ID (XBT or ETH)
  const [product, setProduct]: [string, Function] = useState('');
  // Asks and Bids data
  const [data, setData]: [{asks: TotalOrders, bids: TotalOrders}, Function] = useState({asks: [], bids: []});
  // Spread value
  const spread: number = (data.asks.length && data.bids.length) ? Math.abs(data.asks[0][0] - data.bids[0][0]) : 0;
  // Spread percentage
  const spreadPercentage: number = spread > 0 ? (spread * 100 / data.asks[0][0]) : 0;
  // Message string for Pause / Loading
  const loadingMessage = isPaused ? 'Paused' : 'Loading...';

  // Subscribe / resubscribe, reset loading state function (pause / load)
  const subscribe = (websocket: OrderBookWebSocket, loadingFunction: Function) => {
    setTimeout(() => loadingFunction(false), 200);
    websocket.subscribe({
      product,
      frequency,
      onData: ({ asks, bids }: {asks: [], bids: []}): void => {
        setData({
          asks: computeOrdersTotal(asks),
          bids: computeOrdersTotal(bids.reverse())
        });
      }
    });
  };

  // Unsubscribe, set loading state function (pause / load)
  const unsubscribe = (websocket: OrderBookWebSocket, loadingFunction: Function) => {
    loadingFunction(true);
    websocket.unsubscribe({ product });
  };

  useEffect(() => {
    // On component 1st render, intialize the WebSocket
    const newWebsocket = new OrderBookWebSocket({
      onConnect: (): void => {
        // Set the initial product
        setProduct('XBT');
      }
    });

    setWs(newWebsocket);

    // On Blur, pause the WS subscription (unsubscribe)
    // Will resubscribe when the user clicks the 'Reconnect' button
    const onBlur = () => unsubscribe(newWebsocket, setIsPaused);
    window.addEventListener('blur', onBlur);

    return () => {
      // Remove listener and close the WS when unmount
      window.removeEventListener('blur', onBlur);
      newWebsocket.close();
    };
  }, []);

  useEffect(() => {
    if (!product || !ws) return;
    // When WS and Product are set, subscribe

    subscribe(ws, setIsLoading);

    return () => {
      // Unsubscribe when product change
      unsubscribe(ws, setIsLoading);
    };
  }, [product, ws]);

  const spreadElt = <h2 className="ob-spread">
    Spread:&nbsp;<span className="number">{ formatNumberForDisplay(spread, 1) }</span>&nbsp;(<span className="number">{ formatNumberForDisplay(spreadPercentage, 2) }</span>%)
  </h2>;

  return (
    <section className="ob">
      <div className="ob-title-container">
        <h1 className="ob-title">
          Order Book
        </h1>
        { spreadElt }
      </div>
      <div className="ob-tables-container">
        <OrdersTable
          type="ask"
          orders={ data.asks }
        />
        { spreadElt }
        <OrdersTable
          type="bid"
          orders={ data.bids }
        />
      </div>
      <div className="ob-footer">
        <Button onClick={ () => {
          setProduct((prevProduct: string) => prevProduct === 'XBT' ? 'ETH' : 'XBT');
        } }>
          Toggle Feed
        </Button>
      </div>
      <div className={ `ob-loader ${ (isLoading || isPaused) ? 'visible' : '' }` }>
        <span>{ loadingMessage }</span>
        { isPaused && <Button onClick={ () => subscribe(ws, setIsPaused) }>
          Reconnect
        </Button> }
      </div>
    </section>
  );
}

export default OrderBook;
