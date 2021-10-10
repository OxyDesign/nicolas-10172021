import { useState, useEffect } from 'react';
import OrderBookWebSocket from '../data/OrderBookWebSocket';
import {
  computeOrdersTotal
} from '../utils/functions';

function OrderBook() {
  const [ws, setWs]: [any, Function] = useState(null);
  const [product, setProduct]: [string, Function] = useState('');
  const [data, setData]: [{asks: TotalOrders, bids: TotalOrders}, Function] = useState({asks: [], bids: []});
  const askMax = data.asks.length ? data.asks[0][2] : null;
  const bidMax = data.bids.length ? data.bids[data.bids.length - 1][2] : null;

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
          asks: computeOrdersTotal(asks.reverse()).reverse(),
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
      { data.asks.map((ask, i) => <div key={ i }>
        <div style={ { height: '20px', width: '200px', minWidth: '200px' } }>
          <div style={ {
            background: 'red',
            height: '100%',
            width: `${ askMax ? (ask[2] * 100) / askMax : 0 }%`
          } }>{ askMax ? ((ask[2] * 100) / askMax).toFixed(2) : 0 }%</div>
        </div>
        { ask[0] } / { ask[1] } / { ask[2] }
      </div>) }

      <hr />

      { data.bids.map((bid, i) => <div key={ i }>
        <div style={ { height: '20px', width: '200px', minWidth: '200px' } }>
          <div style={ {
            background: 'green',
            height: '100%',
            width: `${ bidMax ? (bid[2] * 100) / bidMax : 0 }%`
          } }>{ bidMax ? ((bid[2] * 100) / bidMax).toFixed(2) : 0 }%</div>
        </div>
        { bid[0] } / { bid[1] } / { bid[2] }
      </div>) }

      <button onClick={ () => {
        setProduct((prevProduct: string) => prevProduct === 'XBT' ? 'ETH' : 'XBT');
      } }>
        Switch
      </button>
    </div>
  );
}

export default OrderBook;
