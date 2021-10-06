import { useState, useEffect } from 'react';
import WebsocketConnection from '../data/WebsocketConnection';

function OrderBook() {
  const [ws, setWs]: [any, Function] = useState(null);
  const [product, setProduct]: [string, Function] = useState('');
  const [data, setData]: [{asks: [], bids: []}, Function] = useState({asks: [], bids: []});

  useEffect(() => {
    setWs(new WebsocketConnection({
      onConnect: (): void => {
        setProduct('XBT');
      }
    }));

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!product || !ws) return;

    ws.subscribe({
      product,
      onData: (newData: {asks: [], bids: []}): void => {
        setData(newData);
      }
    })

    return () => {
      ws.unsubscribe({ product });
    };
  }, [product, ws]);

  return (
    <div className="ob">
      { data.asks.map((ask, i) => <div key={ i }>{ ask[0] } / { ask[1] }</div>) }
      <hr />
      { data.bids.map((bid, i) => <div key={ i }>{ bid[0] } / { bid[1] }</div>) }
      <button onClick={ () => {
        setProduct((prevProduct: string) => prevProduct === 'XBT' ? 'ETH' : 'XBT');
      } }>
        Switch
      </button>
    </div>
  );
}

export default OrderBook;
