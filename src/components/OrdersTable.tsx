import OrderRow from './OrderRow';

type OrdersTableProps = {
  type: 'ask' | 'bid';
  orders: TotalOrders;
};

function OrdersTable({ type, orders }: OrdersTableProps) {
  // Get max to pass to the rows to compute background size %
  const max = orders.length ? orders[orders.length - 1][2] : 0;

  return <table
    className={ `orders-table ${ type }` }
  >
    <thead>
      <tr>
        <th>Price</th>
        <th>Size</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      { orders.map((order, i) => <OrderRow
        key={ i }
        order={ order }
        max={ max }
      />) }
    </tbody>
  </table>;
}

export default OrdersTable;
