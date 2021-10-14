// import { render, screen } from '@testing-library/react';
import {
  computeOrdersTotal,
  getSubscriptionMessage,
  sortOrdersByAsc,
  updateOrders
} from './utils/functions';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

const getSubscriptionMessageTests = [
  // Subscribe / XBT
  {
    values: { isSubscribe: true, product: 'XBT' },
    answer: '{"event":"subscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}'
  },
  // Unsubscribe / XBT
  {
    values: { isSubscribe: false, product: 'XBT' },
    answer: '{"event":"unsubscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}'
  },
  // Subscribe / ETH
  {
    values: { isSubscribe: true, product: 'ETH' },
    answer: '{"event":"subscribe","feed":"book_ui_1","product_ids":["PI_ETHUSD"]}'
  },
  // Unsubscribe / ETH
  {
    values: { isSubscribe: false, product: 'ETH' },
    answer: '{"event":"unsubscribe","feed":"book_ui_1","product_ids":["PI_ETHUSD"]}'
  }
];

const sortOrdersByAscTests = [
  // Empty Array / No Orders
  {
    values: [],
    answer: []
  },
  // Only 1 order
  {
    values: [[57484.5, 2795]],
    answer: [[57484.5, 2795]]
  },
  // Reversed order
  {
    values: [[9, 1], [8, 1], [7, 1], [6, 1], [5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1]],
    answer: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]
  },
  // Random order w/ various sizes
  {
    values: [[57484.5, 2795], [57426.5, 23816], [57666.5, 0], [57429, 1000], [57430.5, 0], [57425, 116321], [57428, 230348], [58893, 0], [58892.5, 400000]],
    answer: [[57425, 116321], [57426.5, 23816], [57428, 230348], [57429, 1000], [57430.5, 0], [57484.5, 2795], [57666.5, 0], [58892.5, 400000], [58893, 0]]
  },
  // Random order w/ various sizes
  {
    values: [[58893, 0], [58892.5, 400000], [57666.5, 0], [57484.5, 2795], [57430.5, 0], [57429, 1000], [57428, 230348], [57426.5, 23816], [57425, 116321]],
    answer: [[57425, 116321], [57426.5, 23816], [57428, 230348], [57429, 1000], [57430.5, 0], [57484.5, 2795], [57666.5, 0], [58892.5, 400000], [58893, 0]]
  },
];

const computeOrdersTotalTests = [
  // Empty Array / No Orders
  {
    values: [],
    answer: []
  },
  // Only 1 order
  {
    values: [[57484.5, 2795]],
    answer: [[57484.5, 2795, 2795]]
  },
  // All sizes at 0
  {
    values: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]],
    answer: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0], [5, 0, 0], [6, 0, 0], [7, 0, 0], [8, 0, 0], [9, 0, 0]]
  },
  // All sizes at 1
  {
    values: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
    answer: [[0, 1, 1], [1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 1, 5], [5, 1, 6], [6, 1, 7], [7, 1, 8], [8, 1, 9], [9, 1, 10]]
  },
  // Various sizes
  {
    values: [[57425, 116321], [57426.5, 23816], [57428, 230348], [57429, 1000], [57430.5, 0], [57484.5, 2795], [57666.5, 0], [58892.5, 400000], [58893, 0]],
    answer: [[57425, 116321, 116321], [57426.5, 23816, 140137], [57428, 230348, 370485], [57429, 1000, 371485], [57430.5, 0, 371485], [57484.5, 2795, 374280], [57666.5, 0, 374280], [58892.5, 400000, 774280], [58893, 0, 774280]]
  }
];

const updateOrdersTests = [
  // Empty Orders / Empty Deltas
  {
    values: {
      orders: [],
      deltas: []
    },
    answer: []
  },
  // 1 Order / Empty Deltas
  {
    values: {
      orders: [[57484.5, 2795]],
      deltas: []
    },
    answer: [[57484.5, 2795]]
  },
  // Empty Orders / 1 Delta
  {
    values: {
      orders: [],
      deltas: [[57484.5, 2795]]
    },
    answer: [[57484.5, 2795]]
  },
  // 1 Order / 1 Delta at 0 for same order
  {
    values: {
      orders: [[57484.5, 2795]],
      deltas: [[57484.5, 0]]
    },
    answer: []
  },
  // 2 New Deltas within Orders range
  {
    values: {
      orders: [[0, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [8, 1], [9, 1]],
      deltas: [[1, 1], [7, 1]]
    },
    answer: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]
  },
  // 1 New Delta before Orders range
  {
    values: {
      orders: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
      deltas: [[0, 1]]
    },
    answer: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]
  },
  // 1 New Delta after Orders range
  {
    values: {
      orders: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]],
      deltas: [[9, 1]]
    },
    answer: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]
  },
  // 2 New Deltas, both at 0, within Orders range
  {
    values: {
      orders: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
      deltas: [[1, 0], [7, 0]]
    },
    answer: [[0, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [8, 1], [9, 1]]
  },
  // 1 New Delta, at 0, first Order in range
  {
    values: {
      orders: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
      deltas: [[0, 0]]
    },
    answer: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]]
  },
  // 1 New Delta, at 0, last Order in range
  {
    values: {
      orders: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1]],
      deltas: [[9, 0]]
    },
    answer: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]]
  },
  // Several Deltas, various sizes, mix of addition/removal/replacement
  {
    values: {
      orders: [[57425, 116321], [57426.5, 23816], [57428, 230348], [57429, 1000], [57484.5, 2795], [58484.5, 10], [58892.5, 400000]],
      deltas: [[10, 111], [57427, 0], [57429, 999], [57429.5, 3], [58484.5, 0], [99999, 1]]
    },
    answer: [[10, 111], [57425, 116321], [57426.5, 23816], [57428, 230348], [57429, 999], [57429.5, 3], [57484.5, 2795], [58892.5, 400000], [99999, 1]]
  }
];

test('getSubscriptionMessage', () => {
  getSubscriptionMessageTests.forEach(test => {
    const { values, answer } = test;
    const { isSubscribe, product } = values;
    expect(getSubscriptionMessage(isSubscribe, product)).toBe(answer);
  });
});

test('sortOrdersByAsc', () => {
  sortOrdersByAscTests.forEach(test => {
    const { values, answer } = test;
    expect(sortOrdersByAsc(values)).toStrictEqual(answer);
  });
});

test('computeOrdersTotal', () => {
  computeOrdersTotalTests.forEach(test => {
    const { values, answer } = test;
    expect(computeOrdersTotal(values)).toStrictEqual(answer);
  });
});

test('updateOrders', () => {
  updateOrdersTests.forEach(test => {
    const { values, answer } = test;
    const { orders, deltas } = values;
    expect(updateOrders(orders, deltas)).toStrictEqual(answer);
  });
});
