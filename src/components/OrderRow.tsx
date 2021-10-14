import { formatNumberForDisplay } from '../utils/functions';

type OrderRowProps = {
  order: TotalOrder;
  max: number;
};

function OrderRow({ order, max }: OrderRowProps) {
  const [price, size, total] = order;
  const totalPercentage = max ? (total * 100) / max : 0;

  return <tr style={ {
    backgroundSize: `${ totalPercentage }%`
  } }>
    <td className="price">{ formatNumberForDisplay(price, 2) }</td>
    <td>{ formatNumberForDisplay(size) }</td>
    <td>{ formatNumberForDisplay(total) }</td>
  </tr>;
}

export default OrderRow;
