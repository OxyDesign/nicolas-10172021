import { formatNumberForDisplay } from '../utils/functions';

type OrderRowProps = {
  order: TotalOrder;
  max: number;
};

function OrderRow({ order, max }: OrderRowProps) {
  // Get price, size, total from the order
  const [price, size, total] = order;
  // Use max prop and total to calculate % for background size to render
  const totalPercentage = max ? (total * 100) / max : 0;

  // Use the formatting util to display each number as expected
  return <tr style={ {
    backgroundSize: `${ totalPercentage }%`
  } }>
    <td className="price">{ formatNumberForDisplay(price, 2) }</td>
    <td>{ formatNumberForDisplay(size) }</td>
    <td>{ formatNumberForDisplay(total) }</td>
  </tr>;
}

export default OrderRow;
