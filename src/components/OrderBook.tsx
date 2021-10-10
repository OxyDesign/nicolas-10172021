import { useState, useEffect } from 'react';

import {
  computeOrdersTotal
} from '../utils/functions';

import OrdersTable from './OrdersTable';

import OrderBookWebSocket from '../data/OrderBookWebSocket';

function OrderBook() {
  const [ws, setWs]: [any, Function] = useState(null);
  const [product, setProduct]: [string, Function] = useState('');
  const [data, setData]: [{asks: TotalOrders, bids: TotalOrders}, Function] = useState({asks: [], bids: []});

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

  return (
    <div className="ob">
      <div className="ob-tables-container">
        <OrdersTable
          type="ask"
          orders={ data.asks }
        />
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
    </div>
  );
}

export default OrderBook;
