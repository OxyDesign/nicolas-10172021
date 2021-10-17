import { render, screen } from '@testing-library/react';
import ReactDOM from 'react-dom';
import App from './App';
import OrdersTable from './components/OrdersTable';
import {
  formatNumberForDisplay
} from './utils/functions';

test('App renders', () => {
  const root = document.createElement('div');
  ReactDOM.render(<App />, root);
});

test('Renders App UI', () => {
  render(<App />);

  const titleOrderBook = screen.getByText('Order Book');
  const btToggleFeed = screen.getByText('Toggle Feed');
  const titlesSpread = screen.getAllByText('Spread', { exact: false });
  const theadsPrice = screen.getAllByText('Price');
  const theadsSize = screen.getAllByText('Size');
  const theadsTotal = screen.getAllByText('Total');

  // Check if Title is rendered
  expect(titleOrderBook).toBeInTheDocument();
  // Check if Toggle Feed Button is rendered
  expect(btToggleFeed).toBeInTheDocument();

  // Check if Spreads are rendered
  expect(titlesSpread.length).toBe(2);
  titlesSpread.forEach(elt => {
    expect(elt).toBeInTheDocument()
  });

  // Check if Price theads are rendered
  expect(theadsPrice.length).toBe(2);
  theadsPrice.forEach(elt => {
    expect(elt).toBeInTheDocument();
  });

  // Check if Size theads are rendered
  expect(theadsSize.length).toBe(2);
  theadsSize.forEach(elt => {
    expect(elt).toBeInTheDocument();
  });

  // Check if Total theads are rendered
  expect(theadsTotal.length).toBe(2);
  theadsTotal.forEach(elt => {
    expect(elt).toBeInTheDocument();
  });
});

test('Renders Asks OrdersTable UI', () => {
  const orders: TotalOrders = [[57425, 116321, 116321], [57426.5, 23816, 140137], [57428, 230348, 370485], [57429, 1000, 371485], [57430.5, 0, 371485], [57484.5, 2795, 374280], [57666.5, 0, 374280], [58892.5, 400000, 774280], [58893, 0, 774280]];
  const max = orders[orders.length - 1][2];

  render(<OrdersTable type="ask" orders={ orders } />);

  orders.forEach(order => {
    const [price, size, total] = order;
    const cellPrice = screen.getByText(formatNumberForDisplay(price, 2)) as HTMLElement;
    const cellSize = cellPrice.nextElementSibling as HTMLElement;
    const cellTotal = cellSize.nextElementSibling as HTMLElement;
    const row = cellPrice.parentElement;
    const percentage = (total * 100) / max;

    // Check if Price is rendered
    expect(cellPrice).toBeInTheDocument();
    // Check if Size is correct
    expect(cellSize.textContent).toBe(formatNumberForDisplay(size));
    // Check if Total is correct
    expect(cellTotal.textContent).toBe(formatNumberForDisplay(total));
    // Check if Background percentage correct
    expect(row).toHaveStyle(`backgroundSize: ${ percentage }% 100%`);
  });
});

test('Renders Bids OrdersTable UI', () => {
  const orders: TotalOrders = [[0, 1, 1], [1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 1, 5], [5, 1, 6], [6, 1, 7], [7, 1, 8], [8, 1, 9], [9, 1, 10]];
  const max = orders[orders.length - 1][2];

  render(<OrdersTable type="bid" orders={ orders } />);

  orders.forEach(order => {
    const [price, size, total] = order;
    const cellPrice = screen.getByText(formatNumberForDisplay(price, 2)) as HTMLElement;
    const cellSize = cellPrice.nextElementSibling as HTMLElement;
    const cellTotal = cellSize.nextElementSibling as HTMLElement;
    const row = cellPrice.parentElement;
    const percentage = (total * 100) / max;

    // Check if Price is rendered
    expect(cellPrice).toBeInTheDocument();
    // Check if Size is correct
    expect(cellSize.textContent).toBe(formatNumberForDisplay(size));
    // Check if Total is correct
    expect(cellTotal.textContent).toBe(formatNumberForDisplay(total));
    // Check if Background percentage correct
    expect(row).toHaveStyle(`backgroundSize: ${ percentage }% 100%`);
  });
});
