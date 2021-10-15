import { useState, useEffect } from 'react';

import {
  computeOrdersTotal,
  formatNumberForDisplay
} from '../utils/functions';

import OrdersTable from './OrdersTable';
import Button from './Button';

import OrderBookWebSocket from '../data/OrderBookWebSocket';

function OrderBook() {
  const frequency: number = 1000;
  const [ws, setWs]: [any, Function] = useState(null);
  const [isLoading, setIsLoading]: [boolean, Function] = useState(true);
  const [isPaused, setIsPaused]: [boolean, Function] = useState(false);
  const [product, setProduct]: [string, Function] = useState('');
  const [data, setData]: [{asks: TotalOrders, bids: TotalOrders}, Function] = useState({asks: [], bids: []});
  const spread: number = (data.asks.length && data.bids.length) ? Math.abs(data.asks[0][0] - data.bids[0][0]) : 0;
  const spreadPercentage: number = spread > 0 ? (spread * 100 / data.asks[0][0]) : 0;
  const loadingMessage = isPaused ? 'Paused' : 'Loading...';

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

  const unsubscribe = (websocket: OrderBookWebSocket, loadingFunction: Function) => {
    loadingFunction(true);
    websocket.unsubscribe({ product });
  };

  useEffect(() => {
    const newWebsocket = new OrderBookWebSocket({
      onConnect: (): void => {
        setProduct('XBT');
      }
    });

    setWs(newWebsocket);

    const onFocus = () => subscribe(newWebsocket, setIsPaused);
    const onBlur = () => unsubscribe(newWebsocket, setIsPaused);

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      newWebsocket.close();
    };
  }, []);

  useEffect(() => {
    if (!product || !ws) return;

    subscribe(ws, setIsLoading);

    return () => {
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
        { loadingMessage }
      </div>
    </section>
  );
}

export default OrderBook;
