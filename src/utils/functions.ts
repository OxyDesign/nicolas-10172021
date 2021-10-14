/**
 * Generate the message needed to subscribe/unsubscribe to the WebSocket data
 * @param {boolean} isSubscribe - Select Subscribe or Unscribe type of Message
 * @param {string} product - Product ID
 * @return {string} Stringified Message to send to the WebSocket
 */
export const getSubscriptionMessage: Function = (
  isSubscribe: boolean,
  product: string
): string => JSON.stringify({
  event: isSubscribe ? 'subscribe' : 'unsubscribe',
  feed: 'book_ui_1',
  product_ids:[`PI_${ product }USD`]
});

/**
 * Sort Orders by Ascending Value
 * @param {Array} orders - Orders to sort
 * @return {Array} Sorted orders
 */
export const sortOrdersByAsc: Function = (orders: Orders): Orders => {
  return orders.sort((orderA: Order, orderB: Order) => orderA[0] - orderB[0]);
};

/**
 * Compute & Add Total Orders
 * @param {Array} orders - Orders to compute
 * @return {Array} Orders with Totals
 */
export const computeOrdersTotal: Function = (orders: Orders): TotalOrders => {
  let total: number = 0;
  return orders.map(order => [...order, total += order[1]]);
};

/**
 * Update existing orders
 * @param {Array} orders - Orders to update
 * @param {Array} deltas - New Deltas to add/remove/update in Orders
 * @return {Array} Updated Orders
 */
export const updateOrders: Function = (orders: Orders, deltas: Orders): Orders => {
  const newOrders: Orders = [];
  let orderIndex: number = 0;
  let deltaIndex: number = 0;

  // Orders & Deltas are processed in order until one runs out
  while (orderIndex < orders.length && deltaIndex < deltas.length) {
    const order: Order = orders[orderIndex];
    const delta: Order = deltas[deltaIndex];

    if (delta[0] < order[0]) {
      // Current Delta lower than current Order, Delta added (if not 0 size)
      if (delta[1] !== 0) {
        newOrders.push(delta);
      }
      // Then move forward, to next Delta
      deltaIndex++;
    } else if (delta[0] > order[0]) {
      // Current Delta higher than current Order, Order added
      newOrders.push(order);
      // Then move forward, to next Order
      orderIndex++;
    } else {
      // Current Delta & Current Order at same value, only the delta is kept
      // If not size 0
      if (delta[1] !== 0) {
        newOrders.push(delta);
      }
      // Then move forward, to next Order & Delta
      deltaIndex++;
      orderIndex++;
    }
  }

  if (orderIndex < orders.length) {
    // If there are remaining orders, they are added
    newOrders.push(...orders.slice(orderIndex));
  } else if (deltaIndex < deltas.length) {
    // If there are remaining deltas, the non 0 size ones are added
    newOrders.push(...deltas.slice(deltaIndex).filter(delta => delta[1] !== 0));
  }

  return newOrders;
};

/**
 * Format Number For Display
 * @param {number} value - Number to format
 * @param {number} decimal - Decimals to include
 * @return {string} Formatted Number
 */
export const formatNumberForDisplay: Function = (value: number, decimal: number = 0): String => {
  let [integerPart, decimalPart] = value.toFixed(decimal).split('.');
  let i = 0;

  integerPart = integerPart.split('').reduceRight((number, digit) => {
    const newNumber = digit + (i && i % 3 === 0 ? ',' : '') + number;
    i++;
    return newNumber;
  }, '');

  return decimal ? [integerPart, decimalPart].join('.') : integerPart;
}
