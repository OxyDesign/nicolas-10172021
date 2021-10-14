import { useState, useEffect } from 'react';

import {
  computeOrdersTotal,
  formatNumberForDisplay
} from '../utils/functions';

import OrdersTable from './OrdersTable';

import OrderBookWebSocket from '../data/OrderBookWebSocket';

function OrderBook() {
  const [ws, setWs]: [any, Function] = useState(null);
  const [product, setProduct]: [string, Function] = useState('');
  const [data, setData]: [{asks: TotalOrders, bids: TotalOrders}, Function] = useState({asks: [], bids: []});
  const spread: number = (data.asks.length && data.bids.length) ? Math.abs(data.asks[0][0] - data.bids[0][0]) : 0;
  const spreadPercentage: number = spread > 0 ? (spread * 100 / data.asks[0][0]) : 0;

  useEffect(() => {
    const newWebsocket = new OrderBookWebSocket({
      onConnect: (): void => {
        setProduct('XBT');
      }
    });

    setWs(newWebsocket);

    return () => {
      newWebsocket.close();
    };
  }, []);

  useEffect(() => {
    if (!product || !ws) return;

    ws.subscribe({
      product,
      frequency: 1000,
      onData: ({ asks, bids }: {asks: [], bids: []}): void => {
        setData({
          asks: computeOrdersTotal(asks.reverse()),
          bids: computeOrdersTotal(bids)
        });
      }
    })

    return () => {
      ws.unsubscribe({ product });
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

      <button onClick={ () => {
        setProduct((prevProduct: string) => prevProduct === 'XBT' ? 'ETH' : 'XBT');
      } }>
        Switch
      </button>
    </section>
  );
}

export default OrderBook;
