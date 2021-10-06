export const getSubscriptionMessage: Function = (isSubscribe: boolean, product: string) => JSON.stringify({
  event: isSubscribe ? 'subscribe' : 'unsubscribe',
  feed: 'book_ui_1',
  product_ids:[`PI_${ product }USD`]
});
